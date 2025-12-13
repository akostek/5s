using Domain.Enums;

namespace Application.DTOs
{
    public class AuditResponseDto
    {
        public int Id { get; set; }
        public int? AuditId { get; set; }
        public int QuestionId { get; set; }
        public string? QuestionText { get; set; }
        public string? CategoryName { get; set; }
        public ResponseLevel Response { get; set; }
        public int PointsAwarded { get; set; }
        public List<string>? ImageUrls { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}


