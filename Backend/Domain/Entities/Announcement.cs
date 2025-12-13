using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Announcement entity for system announcements
    /// </summary>
    public class Announcement : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime AnnouncementDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int? CreatedById { get; set; }
    }
}



