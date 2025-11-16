using System.Security.Cryptography;
using System.Text;

namespace FiveS.Infrastructure.Services
{
    /// <summary>
    /// Password hashing service using BCrypt-like implementation
    /// </summary>
    public class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public static bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}

