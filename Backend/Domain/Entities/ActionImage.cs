using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Entity for action images (both action images and evidence images)
    /// </summary>
    public class ActionImage : BaseEntity
    {
        public int ActionId { get; set; }
        public string ImagePath { get; set; } = null!;
        public string ImageType { get; set; } = null!; // "Aksiyon" or "Kanit"
        
        // Navigation property
        public virtual Action Action { get; set; } = null!;
    }
}
