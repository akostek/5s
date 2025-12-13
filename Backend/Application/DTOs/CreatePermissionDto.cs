using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CreatePermissionDto
    {
        [Required(ErrorMessage = "RoleId is required")]
        public int RoleId { get; set; }

        [Required(ErrorMessage = "Page is required")]
        [MaxLength(100)]
        public string Page { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Button { get; set; }

        public bool FilterSektor { get; set; }
        public bool FilterDirektorluk { get; set; }
        public bool ShowPlanlananTarih { get; set; }
        public bool ShowPlanlandiDurum { get; set; }
        public bool CanView { get; set; }
        public bool CanViewYetkilerTab { get; set; }
    }
}


