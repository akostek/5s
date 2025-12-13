using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Permission entity representing role-based permissions
    /// </summary>
    public class Permission : BaseEntity
    {
        public int RoleId { get; set; } // Roller tablosundaki Id (Foreign Key)
        public string Page { get; set; } = string.Empty; // Hangi sayfaya ait yetki olduğu
        public string? Button { get; set; } // new / edit / delete (view butonu tüm rollere açık)
        public bool FilterSektor { get; set; } // 1 → sadece kullanıcının sektörüne ait kayıtları görebilir
        public bool FilterDirektorluk { get; set; } // 1 → sadece kullanıcının direktörlüğüne ait kayıtları görebilir
        public bool ShowPlanlananTarih { get; set; } // 0 → gizle, 1 → göster (sadece Denetimler için)
        public bool ShowPlanlandiDurum { get; set; } // 0 → gizle, 1 → göster (sadece Denetimler için)
        public bool CanView { get; set; } // 1 → erişim var, 0 → erişim yok
        public bool CanViewYetkilerTab { get; set; } // 1 → Ayarlar sayfasında Yetkiler sekmesini görebilir, 0 → göremez

        // Navigation properties
        public virtual Role? Role { get; set; }
    }
}


