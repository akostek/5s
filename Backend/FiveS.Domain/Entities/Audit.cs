using FiveS.Domain.Common;

namespace FiveS.Domain.Entities
{
    /// <summary>
    /// Minimal Audit entity for planning audits
    /// </summary>
    public class Audit : BaseEntity
    {
        public int DepartmentId { get; set; }
        public int? SectorId { get; set; }
        public int? DirectorateId { get; set; }
        public int AuditorId { get; set; }
        public int? AreaId { get; set; }
        public string? AreaSupervisor { get; set; }
        public DateTime AuditDate { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = "planlandı";
        public int TotalScore { get; set; } = 0;
        public int MaxPossibleScore { get; set; } = 0;
        public string? LevelAchieved { get; set; }

        // Navigation properties
        public virtual Department Department { get; set; } = null!;
        public virtual Sector? Sector { get; set; }
        public virtual Directorate? Directorate { get; set; }
        public virtual Area? Area { get; set; }
        public virtual User Auditor { get; set; } = null!;
        public virtual ICollection<AuditPlan> AuditPlans { get; set; } = new List<AuditPlan>();
    }
}

