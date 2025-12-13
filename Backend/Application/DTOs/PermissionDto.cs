namespace Application.DTOs
{
    public class PermissionDto
    {
        public int Id { get; set; }
        public int RoleId { get; set; }
        public string Role { get; set; } = string.Empty; // Role name from Roller.Ad (for display)
        public string Page { get; set; } = string.Empty;
        public string? Button { get; set; }
        public bool FilterSektor { get; set; }
        public bool FilterDirektorluk { get; set; }
        public bool ShowPlanlananTarih { get; set; }
        public bool ShowPlanlandiDurum { get; set; }
        public bool CanView { get; set; }
        public bool CanViewYetkilerTab { get; set; }
    }
}


