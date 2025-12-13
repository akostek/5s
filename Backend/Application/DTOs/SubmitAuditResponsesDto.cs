using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class SubmitAuditResponsesDto
    {
        [Required]
        public List<AuditResponseItemDto> Responses { get; set; } = new();
    }

    public class AuditResponseItemDto
    {
        [Required]
        public int QuestionId { get; set; }

        [Required]
        public ResponseLevel Response { get; set; }
    }
}


