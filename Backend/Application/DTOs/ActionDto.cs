using Domain.Enums;

namespace Application.DTOs
{
    public class ActionDto
    {
        public int Id { get; set; }
        public int? AuditId { get; set; }
        public int QuestionId { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? SectorId { get; set; }
        public string? SectorName { get; set; }
        public int? DirectorateId { get; set; }
        public string? DirectorateName { get; set; }
        public string? ImagePath { get; set; }
        public string? Description { get; set; }
        public string? SuggestedActivity { get; set; }
        public string? PlannedActivity { get; set; }
        public DateTime? TargetDate { get; set; }
        public string? ResponsiblePerson { get; set; }
        public ActionStatus Status { get; set; }
        public string? Priority { get; set; }
        public string? QuestionText { get; set; }
        public string? CategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}




