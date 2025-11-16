namespace FiveS.Application.DTOs
{
    public class DirectorateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? SectorId { get; set; }
        public string? SectorName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateDirectorateDto
    {
        public string Name { get; set; } = string.Empty;
        public int? SectorId { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateDirectorateDto
    {
        public string Name { get; set; } = string.Empty;
        public int? SectorId { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}

