namespace Application.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Username { get; set; }
        public string? Sicil { get; set; }
        public int? SectorId { get; set; }
        public string? Sector { get; set; }
        public int? DirectorateId { get; set; }
        public string? Directorate { get; set; }
        public string Role { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDemo { get; set; }
    }
}


