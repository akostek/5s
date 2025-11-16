using System.ComponentModel.DataAnnotations;

namespace FiveS.Application.DTOs
{
    public class CreateUserDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required")]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Username { get; set; }

        public string? Sicil { get; set; }

        public int? SectorId { get; set; }

        public string? Sector { get; set; }

        public int? DirectorateId { get; set; }

        public string? Directorate { get; set; }

        [Required(ErrorMessage = "RoleId is required")]
        public int RoleId { get; set; }

        public int? DepartmentId { get; set; }
    }
}

