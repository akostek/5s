using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Direktörlük entity - Dinamik direktörlük yönetimi için
    /// </summary>
    public class Directorate : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int? SectorId { get; set; } // Sektör ID (Foreign Key)
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual Sector? Sector { get; set; }
        public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
        public virtual ICollection<Area> Areas { get; set; } = new List<Area>();
    }
}


