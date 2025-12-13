using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Sektör entity - Dinamik sektör yönetimi için
    /// </summary>
    public class Sector : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
        public virtual ICollection<Area> Areas { get; set; } = new List<Area>();
    }
}


