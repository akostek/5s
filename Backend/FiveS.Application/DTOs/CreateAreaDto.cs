using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    /// <summary>
    /// DTO for creating a new Area
    /// </summary>
    public class CreateAreaDto
    {
        [Required(ErrorMessage = "Department ID is required")]
        public int DepartmentId { get; set; }

        [Required(ErrorMessage = "Area name is required")]
        [MinLength(2, ErrorMessage = "Area name must be at least 2 characters")]
        [MaxLength(255, ErrorMessage = "Area name cannot exceed 255 characters")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }
    }
}


