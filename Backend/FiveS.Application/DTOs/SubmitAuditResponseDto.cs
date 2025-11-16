using FiveS.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class SubmitAuditResponseDto
    {
        [Required]
        public int AuditId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        public ResponseLevel Response { get; set; }

        public List<string>? ImageUrls { get; set; }
    }
}

