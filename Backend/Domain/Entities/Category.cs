using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Category entity for grouping audit questions
    /// </summary>
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrderIndex { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}


