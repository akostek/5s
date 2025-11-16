using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class UpdateUserDto
    {
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string? Name { get; set; }

        public string? Username { get; set; }

        public string? Sicil { get; set; }

        public string? Sector { get; set; }

        public string? Directorate { get; set; }

        public int? RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool? IsActive { get; set; }
    }
}

