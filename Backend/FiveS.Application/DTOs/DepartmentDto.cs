namespace FiveS.Application.DTOs
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? SectorId { get; set; }
        public string? Sector { get; set; }
        public int? DirectorateId { get; set; }
        public string? Directorate { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int UserCount { get; set; }
        public int AuditCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

