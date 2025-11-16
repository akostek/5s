using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var baseUrl = "http://localhost:5000";
        var client = new HttpClient();

        try
        {
            // 1. Test health endpoint
            Console.WriteLine("1. Testing health endpoint...");
            var healthResponse = await client.GetAsync($"{baseUrl}/api/health");
            Console.WriteLine($"Health Status: {healthResponse.StatusCode}");
            if (healthResponse.IsSuccessStatusCode)
            {
                var healthContent = await healthResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Health Response: {healthContent}\n");
            }

            // 2. Test login to get token
            Console.WriteLine("2. Testing login...");
            var loginData = new
            {
                email = "admin@5s.com",
                password = "Admin123!"
            };
            var loginJson = JsonSerializer.Serialize(loginData);
            var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");
            var loginResponse = await client.PostAsync($"{baseUrl}/api/auth/login", loginContent);
            Console.WriteLine($"Login Status: {loginResponse.StatusCode}");

            string? token = null;
            if (loginResponse.IsSuccessStatusCode)
            {
                var loginResult = await loginResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Login Response: {loginResult}\n");
                
                // Parse token from response
                var jsonDoc = JsonDocument.Parse(loginResult);
                if (jsonDoc.RootElement.TryGetProperty("token", out var tokenElement))
                {
                    token = tokenElement.GetString();
                    Console.WriteLine($"Token received: {token?.Substring(0, Math.Min(50, token.Length ?? 0))}...\n");
                }
            }
            else
            {
                var errorContent = await loginResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Login Error: {errorContent}\n");
            }

            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("Cannot proceed without token. Exiting.");
                return;
            }

            // 3. Test GET /api/audits
            Console.WriteLine("3. Testing GET /api/audits...");
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            var auditsResponse = await client.GetAsync($"{baseUrl}/api/audits");
            Console.WriteLine($"GET Audits Status: {auditsResponse.StatusCode}");
            if (auditsResponse.IsSuccessStatusCode)
            {
                var auditsContent = await auditsResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Audits Response: {auditsContent.Substring(0, Math.Min(500, auditsContent.Length))}...\n");
            }
            else
            {
                var errorContent = await auditsResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"GET Audits Error: {errorContent}\n");
            }

            // 4. Test POST /api/audits/plan
            Console.WriteLine("4. Testing POST /api/audits/plan...");
            var planData = new
            {
                departmentId = 1,
                auditorId = 1,
                area = "Test Alanı",
                areaSupervisor = "Test Sorumlu",
                auditDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss"),
                notes = "Test denetim planı"
            };
            var planJson = JsonSerializer.Serialize(planData);
            var planContent = new StringContent(planJson, Encoding.UTF8, "application/json");
            var planResponse = await client.PostAsync($"{baseUrl}/api/audits/plan", planContent);
            Console.WriteLine($"POST Plan Status: {planResponse.StatusCode}");
            if (planResponse.IsSuccessStatusCode)
            {
                var planResult = await planResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Plan Response: {planResult}\n");
            }
            else
            {
                var errorContent = await planResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"POST Plan Error: {errorContent}\n");
            }

        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
        finally
        {
            client.Dispose();
        }
    }
}

