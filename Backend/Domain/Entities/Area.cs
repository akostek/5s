using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Area entity representing work areas in departments
    /// </summary>
    public class Area : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int? SectorId { get; set; } // Sektör ID (Foreign Key)
        public int? DirectorateId { get; set; } // Direktörlük ID (Foreign Key)
        public string? Description { get; set; }
        public string? Supervisor { get; set; } // Alan sorumlusu
        public string ImageUrl { get; set; } = string.Empty; // Alan görseli (zorunlu)
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Department Department { get; set; } = null!;
        public virtual Sector? Sector { get; set; }
        public virtual Directorate? Directorate { get; set; }
        public virtual ICollection<AuditPlan> AuditPlans { get; set; } = new List<AuditPlan>();
    }
}


