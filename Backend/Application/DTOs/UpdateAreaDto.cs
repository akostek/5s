using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// DTO for updating an existing Area
    /// </summary>
    public class UpdateAreaDto
    {
        public int? DepartmentId { get; set; }

        [MinLength(2, ErrorMessage = "Area name must be at least 2 characters")]
        [MaxLength(255, ErrorMessage = "Area name cannot exceed 255 characters")]
        public string? Name { get; set; }

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [MaxLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
        public string? ImageUrl { get; set; }

        public bool? IsActive { get; set; }
    }
}



