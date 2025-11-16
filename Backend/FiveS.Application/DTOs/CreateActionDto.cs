using System.ComponentModel.DataAnnotations;
using FiveS.Domain.Enums;

namespace FiveS.Application.DTOs
{
    public class CreateActionDto
    {
        [Required(ErrorMessage = "Question ID is required")]
        public int QuestionId { get; set; }

        [Required(ErrorMessage = "Audit ID is required")]
        public int AuditId { get; set; }

        public int? DepartmentId { get; set; }
        public int? SectorId { get; set; }
        public int? DirectorateId { get; set; }

        public string? ImagePath { get; set; }
        public string? Description { get; set; }
        public string? SuggestedActivity { get; set; }
        public string? PlannedActivity { get; set; }
        public DateTime? TargetDate { get; set; }
        public string? ResponsiblePerson { get; set; }
        public ActionStatus Status { get; set; } = ActionStatus.Open;
        public string? Priority { get; set; }
    }
}



