using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class UpdateLevelThresholdDto
    {
        [MaxLength(100, ErrorMessage = "Level name cannot exceed 100 characters")]
        public string? LevelName { get; set; }

        [Range(0, 100, ErrorMessage = "Min percentage must be between 0 and 100")]
        public decimal? MinPercentage { get; set; }

        [Range(0, 100, ErrorMessage = "Max percentage must be between 0 and 100")]
        public decimal? MaxPercentage { get; set; }

        public int? SectorId { get; set; }
    }
}

