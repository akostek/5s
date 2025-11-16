using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class CreateDepartmentDto
    {
        [Required(ErrorMessage = "Department name is required")]
        [MinLength(2, ErrorMessage = "Department name must be at least 2 characters")]
        [MaxLength(255, ErrorMessage = "Department name cannot exceed 255 characters")]
        public string Name { get; set; } = string.Empty;

        public int? SectorId { get; set; }

        [MaxLength(100, ErrorMessage = "Sector cannot exceed 100 characters")]
        public string? Sector { get; set; }

        public int? DirectorateId { get; set; }

        [MaxLength(200, ErrorMessage = "Directorate cannot exceed 200 characters")]
        public string? Directorate { get; set; }

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }
    }
}

