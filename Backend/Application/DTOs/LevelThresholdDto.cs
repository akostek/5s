namespace Application.DTOs
{
    public class LevelThresholdDto
    {
        public int Id { get; set; }
        public string LevelName { get; set; } = string.Empty;
        public decimal MinPercentage { get; set; }
        public decimal MaxPercentage { get; set; }
        public int? SectorId { get; set; }
        public string? SectorName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}


