using Domain.Common;
using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// Action entity for corrective actions from audit findings
    /// </summary>
    public class Action : BaseEntity
    {
        public int? AuditId { get; set; }
        public int QuestionId { get; set; }
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
        public string? Priority { get; set; } // Düşük, Orta, Yüksek

        // Navigation properties
        public virtual Audit? Audit { get; set; }
        public virtual Question Question { get; set; } = null!;
        public virtual Department? Department { get; set; }
        public virtual Sector? Sector { get; set; }
        public virtual Directorate? Directorate { get; set; }
        public virtual ICollection<ActionHistory> History { get; set; } = new List<ActionHistory>();
    }
}


