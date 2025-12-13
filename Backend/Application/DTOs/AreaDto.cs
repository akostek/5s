namespace Application.DTOs
{
    /// <summary>
    /// DTO for Area entity
    /// </summary>
    public class AreaDto
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int? SectorId { get; set; }
        public string? SectorName { get; set; }
        public int? DirectorateId { get; set; }
        public string? DirectorateName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}



