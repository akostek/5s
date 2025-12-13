using Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class KeycloakMailService : IMailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public KeycloakMailService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string body, string cc = "")
        {
            try
            {
                // 1. Keycloak'tan Token Al
                var token = await GetKeycloakTokenAsync();
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("Failed to get Keycloak token for Mail Service");
                    return;
                }

                // 2. E-posta Gönder
                var mailServiceUrl = _configuration["Integration:MailService:Url"];
                var from = _configuration["Integration:MailService:From"];
                var fromDisplayName = _configuration["Integration:MailService:DisplayName"];

                if (string.IsNullOrEmpty(mailServiceUrl))
                {
                    Console.WriteLine("Mail Service URL is missing in appsettings.json (Integration:MailService:Url)");
                    return;
                }

                using var content = new MultipartFormDataContent();
                content.Add(new StringContent(from ?? ""), "From");
                content.Add(new StringContent(fromDisplayName ?? ""), "FromDisplayName");
                content.Add(new StringContent(subject ?? ""), "Subject");
                content.Add(new StringContent(body ?? ""), "Body");

                // Alıcıları (To) İşle
                if (!string.IsNullOrEmpty(to))
                {
                    var toList = to.Split(';', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var t in toList)
                    {
                        content.Add(new StringContent(t.Trim()), "To");
                    }
                }

                // Bilgi (CC) İşle
                if (!string.IsNullOrEmpty(cc))
                {
                    var toList = to?.Split(';', StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).ToList() ?? new List<string>();
                    var ccList = cc.Split(';', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var c in ccList)
                    {
                        var trimmedC = c.Trim();
                        if (!toList.Contains(trimmedC)) // Avoid duplicates
                        {
                            content.Add(new StringContent(trimmedC), "Cc");
                        }
                    }
                }

                var request = new HttpRequestMessage(HttpMethod.Post, mailServiceUrl);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                request.Content = content;

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Mail Service Failed: {response.StatusCode} - {responseBody}");
                }
                else
                {
                    Console.WriteLine($"Email sent successfully to {to}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
            }
        }

        private async Task<string> GetKeycloakTokenAsync()
        {
            try
            {
                // Appsettings.json'dan ayarları oku
                var baseUrl = _configuration["Integration:Keycloak:BaseUrl"];
                var realm = _configuration["Integration:Keycloak:Realm"];
                var clientId = _configuration["Integration:Keycloak:ClientId"];
                var clientSecret = _configuration["Integration:Keycloak:ClientSecret"];

                if (string.IsNullOrEmpty(baseUrl) || string.IsNullOrEmpty(realm) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
                {
                    Console.WriteLine("Keycloak configuration is missing in appsettings.json (Integration:Keycloak section)");
                    return null!;
                }

                var keycloakUrl = $"{baseUrl.TrimEnd('/')}/realms/{realm}/protocol/openid-connect/token";

                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials"),
                    new KeyValuePair<string, string>("client_id", clientId),
                    new KeyValuePair<string, string>("client_secret", clientSecret)
                });

                var response = await _httpClient.PostAsync(keycloakUrl, content);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("access_token", out var accessToken))
                    {
                        return accessToken.GetString()!;
                    }
                }

                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Keycloak Token Failed: {response.StatusCode} - {error}");
                return null!;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting Keycloak token: {ex.Message}");
                return null!;
            }
        }
    }
}

