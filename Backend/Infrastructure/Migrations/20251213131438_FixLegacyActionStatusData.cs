using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixLegacyActionStatusData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Aksiyonlar Tablosu - Veri Düzeltme
            migrationBuilder.Sql("UPDATE \"Aksiyonlar\" SET \"Durum\" = 'Aksiyon Sahibinde' WHERE \"Durum\" IN ('Open', 'Açık', 'open', '0');");
            migrationBuilder.Sql("UPDATE \"Aksiyonlar\" SET \"Durum\" = 'Denetçi Kontrolünde' WHERE \"Durum\" IN ('PendingApproval', 'Denetçi Onayı Bekliyor', 'pending_approval', '2');");
            migrationBuilder.Sql("UPDATE \"Aksiyonlar\" SET \"Durum\" = 'Kapandı' WHERE \"Durum\" IN ('Closed', 'Tamamlandı', 'closed', 'completed', 'kapandı', '3');");
            migrationBuilder.Sql("UPDATE \"Aksiyonlar\" SET \"Durum\" = 'Devam Ediyor' WHERE \"Durum\" IN ('InProgress', 'in_progress', 'devam ediyor', '1');");

            // Aksiyon Geçmişi Tablosu - Veri Düzeltme (EskiDurum)
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"EskiDurum\" = 'Aksiyon Sahibinde' WHERE \"EskiDurum\" IN ('Open', 'Açık', 'open', '0');");
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"EskiDurum\" = 'Denetçi Kontrolünde' WHERE \"EskiDurum\" IN ('PendingApproval', 'Denetçi Onayı Bekliyor', 'pending_approval', '2');");
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"EskiDurum\" = 'Kapandı' WHERE \"EskiDurum\" IN ('Closed', 'Tamamlandı', 'closed', 'completed', 'kapandı', '3');");
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"EskiDurum\" = 'Devam Ediyor' WHERE \"EskiDurum\" IN ('InProgress', 'in_progress', 'devam ediyor', '1');");

            // Aksiyon Geçmişi Tablosu - Veri Düzeltme (YeniDurum)
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"YeniDurum\" = 'Aksiyon Sahibinde' WHERE \"YeniDurum\" IN ('Open', 'Açık', 'open', '0');");
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"YeniDurum\" = 'Denetçi Kontrolünde' WHERE \"YeniDurum\" IN ('PendingApproval', 'Denetçi Onayı Bekliyor', 'pending_approval', '2');");
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"YeniDurum\" = 'Kapandı' WHERE \"YeniDurum\" IN ('Closed', 'Tamamlandı', 'closed', 'completed', 'kapandı', '3');");
            migrationBuilder.Sql("UPDATE \"AksiyonGecmisi\" SET \"YeniDurum\" = 'Devam Ediyor' WHERE \"YeniDurum\" IN ('InProgress', 'in_progress', 'devam ediyor', '1');");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
