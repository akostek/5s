using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UpdatePermissionDto
    {
        public int? RoleId { get; set; }

        [MaxLength(100)]
        public string? Page { get; set; }

        [MaxLength(50)]
        public string? Button { get; set; }

        public bool? FilterSektor { get; set; }
        public bool? FilterDirektorluk { get; set; }
        public bool? ShowPlanlananTarih { get; set; }
        public bool? ShowPlanlandiDurum { get; set; }
        public bool? CanView { get; set; }
        public bool? CanViewYetkilerTab { get; set; }
    }
}


