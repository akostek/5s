using Domain.Enums;

namespace Application.DTOs
{
    public class UpdateActionDto
    {
        public string? ImagePath { get; set; }
        public List<string>? ImageUrls { get; set; }
        public string? Description { get; set; }
        public string? SuggestedActivity { get; set; }
        public string? PlannedActivity { get; set; }
        public DateTime? TargetDate { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public ActionStatus? Status { get; set; }
        public string? Priority { get; set; }
    }
}






