using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class CreateQuestionDto
    {
        [Required(ErrorMessage = "Category ID is required")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Question text is required")]
        [MinLength(5, ErrorMessage = "Question text must be at least 5 characters")]
        [MaxLength(1000, ErrorMessage = "Question text cannot exceed 1000 characters")]
        public string Text { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "Sector cannot exceed 100 characters")]
        public string? Sector { get; set; }

        [MaxLength(200, ErrorMessage = "Directorate cannot exceed 200 characters")]
        public string? Directorate { get; set; }

        [MaxLength(200, ErrorMessage = "Department cannot exceed 200 characters")]
        public string? Department { get; set; }

        [MaxLength(200, ErrorMessage = "Area cannot exceed 200 characters")]
        public string? Area { get; set; }

        public int OrderIndex { get; set; } = 0;

        [Range(0, 100, ErrorMessage = "Points high must be between 0 and 100")]
        public int PointsHigh { get; set; } = 3;

        [Range(0, 100, ErrorMessage = "Points medium must be between 0 and 100")]
        public int PointsMedium { get; set; } = 2;

        [Range(0, 100, ErrorMessage = "Points low must be between 0 and 100")]
        public int PointsLow { get; set; } = 1;

        public bool IsActive { get; set; } = true;
    }
}





