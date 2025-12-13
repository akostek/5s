using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;

namespace Application.Services
{
    public class ActionNotificationService : IActionNotificationService
    {
        private readonly IMailService _mailService;

        public ActionNotificationService(IMailService mailService)
        {
            _mailService = mailService;
        }

        public async Task NotifyActionCreatedAsync(Domain.Entities.Action action)
        {
            var subject = "Yeni Aksiyon Atandı";
            
            // Build body using template
            var body = await BuildEmailBodyAsync(action, "Yeni Aksiyon Bildirimi", "Sisteme yeni bir aksiyon eklendi ve tarafınıza atandı.");
            
            var to = action.ResponsiblePerson?.Email;

            if (string.IsNullOrEmpty(to))
            {
                to = "unknown_user@example.com";
                subject = $"[NO EMAIL IN DB] {subject}";
                System.Console.WriteLine($"[Warning] Responsible person {action.ResponsiblePerson?.Name} has no email. Sending to dummy.");
            }

            await _mailService.SendEmailAsync(to, subject, body);
        }

        public async Task NotifyStatusChangedAsync(Domain.Entities.Action action, ActionStatus newStatus, string? comment, string? userId)
        {
            var responsibleEmail = action.ResponsiblePerson?.Email;
            var auditorEmail = action.Audit?.Auditor?.Email;

            string subject = "";
            string desc = "";
            string revisionState = "none";
            string revisionNote = comment ?? "-";

            
            var toList = new List<string>();
            var ccList = new List<string>();

            // Rules Logic
            if (newStatus == ActionStatus.PendingApproval) // "Denetçiye Gönder"
            {
                subject = "Aksiyon Onayınıza Sunuldu";
                desc = "Aksiyon tamamlandı ve onayınıza sunuldu.";
                // To: Denetçi, CC: Alan Sorumlusu
                if (!string.IsNullOrEmpty(auditorEmail)) toList.Add(auditorEmail);
                if (!string.IsNullOrEmpty(responsibleEmail)) ccList.Add(responsibleEmail);
                
                // Show comment if exists (as completion note)
                if (!string.IsNullOrEmpty(comment)) revisionState = "block";
            }
            else if (newStatus == ActionStatus.Open) // "Revizyon İstendi"
            {
                subject = "Aksiyon İçin Revizyon İstendi";
                desc = "Aksiyon için revizyon/düzeltme talep edildi.";
                // To: Alan Sorumlusu, CC: Denetçi
                if (!string.IsNullOrEmpty(responsibleEmail)) toList.Add(responsibleEmail);
                if (!string.IsNullOrEmpty(auditorEmail)) ccList.Add(auditorEmail);
                
                revisionState = "block"; // Always show revision note
            }
            else if (newStatus == ActionStatus.Closed) // "Tamamlandı"
            {
                subject = "Aksiyon Tamamlandı/Kapatıldı";
                desc = "Aksiyon başarıyla kapatıldı.";
                // To: Alan Sorumlusu, CC: Denetçi
                if (!string.IsNullOrEmpty(responsibleEmail)) toList.Add(responsibleEmail);
                if (!string.IsNullOrEmpty(auditorEmail)) ccList.Add(auditorEmail);
            }

            // Only send if we have a subject (meaning a rule matched)
            if (!string.IsNullOrEmpty(subject))
            {
                var body = await BuildEmailBodyAsync(action, subject, desc, revisionState, revisionNote, newStatus.ToString());

                var to = string.Join(";", toList);
                var cc = string.Join(";", ccList);

                if (string.IsNullOrEmpty(to))
                {
                     to = "unknown_user@example.com";
                     subject = $"[NO EMAIL IN DB] {subject}";
                }

                await _mailService.SendEmailAsync(to, subject, body, cc);
            }
        }

        private async Task<string> BuildEmailBodyAsync(Domain.Entities.Action action, string caption, string description, string revisionState = "none", string revisionNote = "", string statusTextOverride = "")
        {
            try
            {
                string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "ActionNotification.html");
                string logoPath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "logo.png");
                string templateContent;

                if (File.Exists(templatePath))
                {
                    templateContent = await File.ReadAllTextAsync(templatePath);
                }
                else
                {
                    // Fallback
                    templateContent = "<html><body><h2>{{CAPTION}}</h2><p>{{DESCRIPTION}}</p><p><b>Aksiyon:</b> {{TITLE}}</p></body></html>";
                }

                // Placeholders replacements
                var title = action.Description ?? "Tanımsız";
                var mainCategory = action.Question?.Category?.Name ?? "Genel";
                var subCategory = action.Question?.Text ?? "-"; 
                var creators = action.Audit?.Auditor?.Name ?? "Bilinmiyor";
                var assignees = action.ResponsiblePerson?.Name ?? "Atanmadı";
                var status = !string.IsNullOrEmpty(statusTextOverride) ? statusTextOverride : action.Status.ToString();
                
                // New Fields
                var actionId = action.Id.ToString();
                var areaName = action.Department?.Name ?? "Bilinmiyor";

                // Logo Handling
                string logoBase64 = "";
                if (File.Exists(logoPath)) 
                {
                    byte[] imageArray = await File.ReadAllBytesAsync(logoPath);
                    logoBase64 = Convert.ToBase64String(imageArray);
                }

                templateContent = templateContent.Replace("{{IMAGE}}", logoBase64)
                                                 .Replace("{{CAPTION}}", caption)
                                                 .Replace("{{DESCRIPTION}}", description)
                                                 .Replace("{{TITLE}}", title)
                                                 .Replace("{{MAIN_CATEGORY}}", mainCategory)
                                                 .Replace("{{SUB_CATEGORY}}", subCategory)
                                                 .Replace("{{CREATORS}}", creators)
                                                 .Replace("{{ASSIGNEES}}", assignees)
                                                 .Replace("{{STATUS}}", status)
                                                 .Replace("{{REVISION_STATE}}", revisionState)
                                                 .Replace("{{REVISION_NOTE}}", revisionNote)
                                                 .Replace("{{ACTION_ID}}", actionId)
                                                 .Replace("{{AREA_NAME}}", areaName);

                return templateContent;
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"[Error] Building email body: {ex.Message}");
                return $"Error building email: {ex.Message}";
            }
        }
    }
}
