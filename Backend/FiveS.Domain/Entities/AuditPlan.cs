using FiveS.Domain.Common;

namespace FiveS.Domain.Entities
{
    /// <summary>
    /// AuditPlan entity for planning audits
    /// </summary>
    public class AuditPlan : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int AreaId { get; set; }
        public int AuditorId { get; set; }
        public int? CategoryId { get; set; }
        public DateTime PlannedDate { get; set; }
        public string Status { get; set; } = "planlandı";
        public string? Notes { get; set; }

        // Navigation properties
        public virtual Department Department { get; set; } = null!;
        public virtual Area Area { get; set; } = null!;
        public virtual User Auditor { get; set; } = null!;
        public virtual Category? Category { get; set; }
        public virtual ICollection<Audit> Audits { get; set; } = new List<Audit>();
    }
}








