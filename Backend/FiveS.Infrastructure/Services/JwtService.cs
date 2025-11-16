using FiveS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FiveS.Infrastructure.Services
{
    /// <summary>
    /// JWT token generation and validation service
    /// </summary>
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            // Priority: Environment variable > Configuration
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? _configuration["Jwt:Secret"]
                ?? throw new InvalidOperationException("JWT Secret not configured. Please set JWT_SECRET environment variable or Jwt:Secret in appsettings.json");
            
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Also add NameIdentifier for compatibility
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Ad ?? ""),
                new Claim("role_id", user.RoleId.ToString()), // RoleId for permission checks
                new Claim("department_id", user.DepartmentId?.ToString() ?? ""),
                new Claim("sector_id", user.SectorId?.ToString() ?? ""),
                new Claim("directorate_id", user.DirectorateId?.ToString() ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Get JWT settings from environment variables or configuration
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? _configuration["Jwt:Issuer"]
                ?? "FiveSAuditPlatform";
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? _configuration["Jwt:Audience"]
                ?? "FiveSAuditPlatformUsers";
            var expirationHours = Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS")
                ?? _configuration["Jwt:ExpirationHours"]
                ?? "24";
            
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(Convert.ToDouble(expirationHours)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            // Priority: Environment variable > Configuration
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? _configuration["Jwt:Secret"]
                ?? throw new InvalidOperationException("JWT Secret not configured. Please set JWT_SECRET environment variable or Jwt:Secret in appsettings.json");
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret));

            try
            {
                // Get JWT settings from environment variables or configuration
                var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                    ?? _configuration["Jwt:Issuer"]
                    ?? "FiveSAuditPlatform";
                var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                    ?? _configuration["Jwt:Audience"]
                    ?? "FiveSAuditPlatformUsers";
                
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = securityKey
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}

