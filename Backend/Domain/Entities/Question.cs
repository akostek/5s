using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Question entity for audit questionnaire
    /// </summary>
    public class Question : BaseEntity
    {
        public int CategoryId { get; set; }
        public string Text { get; set; } = string.Empty;
        public string? Sector { get; set; } // Sektör (örn: UGES)
        public string? Directorate { get; set; } // Direktörlük
        public string? Department { get; set; } // Bölüm/Müdürlük
        public string? Area { get; set; } // Alan
        public int OrderIndex { get; set; }
        public int PointsHigh { get; set; } = 3;
        public int PointsMedium { get; set; } = 2;
        public int PointsLow { get; set; } = 1;
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Category Category { get; set; } = null!;
        public virtual ICollection<AuditResponse> AuditResponses { get; set; } = new List<AuditResponse>();
        public virtual ICollection<Action> Actions { get; set; } = new List<Action>();
    }
}


