using FiveS.Domain.Common;

namespace FiveS.Domain.Entities
{
    /// <summary>
    /// Department entity representing organizational departments
    /// </summary>
    public class Department : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int? SectorId { get; set; } // Sektör ID (Foreign Key)
        public int? DirectorateId { get; set; } // Direktörlük ID (Foreign Key)
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Sector? Sector { get; set; }
        public virtual Directorate? Directorate { get; set; }
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<Area> Areas { get; set; } = new List<Area>();
        public virtual ICollection<AuditPlan> AuditPlans { get; set; } = new List<AuditPlan>();
    }
}

