using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// User entity representing system users
    /// </summary>
    public class User : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Username { get; set; }
        public string? Sicil { get; set; }
        public int? SectorId { get; set; }
        public int? DirectorateId { get; set; }
        public int RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public virtual Department? Department { get; set; }
        public virtual Sector? Sector { get; set; }
        public virtual Directorate? Directorate { get; set; }
        public virtual Role? Role { get; set; }
        public virtual ICollection<AuditPlan> AuditPlans { get; set; } = new List<AuditPlan>();
    }
}


