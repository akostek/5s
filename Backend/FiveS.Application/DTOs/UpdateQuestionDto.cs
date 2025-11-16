using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class UpdateQuestionDto
    {
        public int? CategoryId { get; set; }

        [MinLength(5, ErrorMessage = "Question text must be at least 5 characters")]
        [MaxLength(1000, ErrorMessage = "Question text cannot exceed 1000 characters")]
        public string? Text { get; set; }

        [MaxLength(100, ErrorMessage = "Sector cannot exceed 100 characters")]
        public string? Sector { get; set; }

        [MaxLength(200, ErrorMessage = "Directorate cannot exceed 200 characters")]
        public string? Directorate { get; set; }

        [MaxLength(200, ErrorMessage = "Department cannot exceed 200 characters")]
        public string? Department { get; set; }

        [MaxLength(200, ErrorMessage = "Area cannot exceed 200 characters")]
        public string? Area { get; set; }

        public int? OrderIndex { get; set; }

        [Range(0, 100, ErrorMessage = "Points high must be between 0 and 100")]
        public int? PointsHigh { get; set; }

        [Range(0, 100, ErrorMessage = "Points medium must be between 0 and 100")]
        public int? PointsMedium { get; set; }

        [Range(0, 100, ErrorMessage = "Points low must be between 0 and 100")]
        public int? PointsLow { get; set; }

        public bool? IsActive { get; set; }
    }
}




