using Domain.Common;
using Domain.Enums;

namespace Domain.Entities
{
    /// <summary>
    /// AuditResponse entity representing answers to audit questions
    /// </summary>
    public class AuditResponse : BaseEntity
    {
        public int? AuditId { get; set; }
        public int QuestionId { get; set; }
        public ResponseLevel Response { get; set; }
        public int PointsAwarded { get; set; }
        public string? ImageUrls { get; set; } // JSON array of image URLs/base64 strings
        public int? DepartmentId { get; set; }
        public int? SectorId { get; set; }
        public int? DirectorateId { get; set; }

        // Navigation properties
        public virtual Audit? Audit { get; set; }
        public virtual Question Question { get; set; } = null!;
        public virtual Department? Department { get; set; }
        public virtual Sector? Sector { get; set; }
        public virtual Directorate? Directorate { get; set; }
    }
}


