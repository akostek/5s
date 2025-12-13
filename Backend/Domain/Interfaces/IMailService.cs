using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IMailService
    {
        Task SendEmailAsync(string to, string subject, string body, string cc = "");
    }
}

