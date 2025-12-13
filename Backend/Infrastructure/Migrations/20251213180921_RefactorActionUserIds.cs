using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorActionUserIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropColumn(
            //     name: "KanitGorselYolu",
            //     table: "Aksiyonlar");

            // migrationBuilder.DropColumn(
            //     name: "ResimYolu",
            //     table: "Aksiyonlar");

            migrationBuilder.DropColumn(
                name: "Sorumlu",
                table: "Aksiyonlar");

            migrationBuilder.DropColumn(
                name: "Degistiren",
                table: "AksiyonGecmisi");

            migrationBuilder.AlterColumn<string>(
                name: "Aciklama",
                table: "Aksiyonlar",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "alansorumlusu_id",
                table: "Aksiyonlar",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "kullanici_id",
                table: "AksiyonGecmisi",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Aksiyonlar_alansorumlusu_id",
                table: "Aksiyonlar",
                column: "alansorumlusu_id");

            migrationBuilder.CreateIndex(
                name: "IX_AksiyonGecmisi_kullanici_id",
                table: "AksiyonGecmisi",
                column: "kullanici_id");

            migrationBuilder.AddForeignKey(
                name: "FK_AksiyonGecmisi_Kullanicilar",
                table: "AksiyonGecmisi",
                column: "kullanici_id",
                principalTable: "Kullanicilar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Aksiyonlar_Kullanicilar",
                table: "Aksiyonlar",
                column: "alansorumlusu_id",
                principalTable: "Kullanicilar",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AksiyonGecmisi_Kullanicilar",
                table: "AksiyonGecmisi");

            migrationBuilder.DropForeignKey(
                name: "FK_Aksiyonlar_Kullanicilar",
                table: "Aksiyonlar");

            migrationBuilder.DropIndex(
                name: "IX_Aksiyonlar_alansorumlusu_id",
                table: "Aksiyonlar");

            migrationBuilder.DropIndex(
                name: "IX_AksiyonGecmisi_kullanici_id",
                table: "AksiyonGecmisi");

            migrationBuilder.DropColumn(
                name: "alansorumlusu_id",
                table: "Aksiyonlar");

            migrationBuilder.DropColumn(
                name: "kullanici_id",
                table: "AksiyonGecmisi");

            migrationBuilder.AlterColumn<string>(
                name: "Aciklama",
                table: "Aksiyonlar",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KanitGorselYolu",
                table: "Aksiyonlar",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResimYolu",
                table: "Aksiyonlar",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sorumlu",
                table: "Aksiyonlar",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Degistiren",
                table: "AksiyonGecmisi",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }
    }
}
