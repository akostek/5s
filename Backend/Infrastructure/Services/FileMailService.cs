using Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text;

namespace Infrastructure.Services
{
    public class FileMailService : IMailService
    {
        private readonly ILogger<FileMailService> _logger;
        private readonly string _logPath;

        public FileMailService(ILogger<FileMailService> logger)
        {
            _logger = logger;
            _logPath = Path.Combine(Directory.GetCurrentDirectory(), "logs", "emails.txt");
            
            // Ensure directory exists
            var directory = Path.GetDirectoryName(_logPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }

        public async Task SendEmailAsync(string to, string subject, string body, string cc = "")
        {
            var sb = new StringBuilder();
            sb.AppendLine("--------------------------------------------------------------------------------");
            sb.AppendLine($"Time: {DateTime.Now}");
            sb.AppendLine($"To: {to}");
            sb.AppendLine($"CC: {cc}");
            sb.AppendLine($"Subject: {subject}");
            sb.AppendLine("Body:");
            sb.AppendLine(body);
            sb.AppendLine("--------------------------------------------------------------------------------");
            sb.AppendLine();

            try 
            {
                await File.AppendAllTextAsync(_logPath, sb.ToString());
                _logger.LogInformation($"Email simulated: To={to}, Subject={subject}. Written to {_logPath}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write simulated email to file.");
            }
        }
    }
}
