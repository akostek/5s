using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// LevelThreshold entity for defining 5S level criteria
    /// </summary>
    public class LevelThreshold : BaseEntity
    {
        public string LevelName { get; set; } = string.Empty;
        public decimal MinPercentage { get; set; }
        public decimal MaxPercentage { get; set; }
        public int? SectorId { get; set; }

        // Navigation properties
        public virtual Sector? Sector { get; set; }
    }
}


