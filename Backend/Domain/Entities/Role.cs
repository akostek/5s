using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Role entity representing user roles
    /// </summary>
    public class Role : BaseEntity
    {
        public string Ad { get; set; } = string.Empty;
        public string? Aciklama { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}


