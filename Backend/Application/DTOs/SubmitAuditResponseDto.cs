using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
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


