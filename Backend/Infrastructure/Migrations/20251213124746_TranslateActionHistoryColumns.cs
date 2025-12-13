using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TranslateActionHistoryColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AksiyonGecmisi_Aksiyonlar_ActionId",
                table: "AksiyonGecmisi");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "AksiyonGecmisi",
                newName: "GuncellemeTarihi");

            migrationBuilder.RenameColumn(
                name: "StatusTo",
                table: "AksiyonGecmisi",
                newName: "YeniDurum");

            migrationBuilder.RenameColumn(
                name: "StatusFrom",
                table: "AksiyonGecmisi",
                newName: "EskiDurum");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "AksiyonGecmisi",
                newName: "OlusturmaTarihi");

            migrationBuilder.RenameColumn(
                name: "Comment",
                table: "AksiyonGecmisi",
                newName: "Aciklama");

            migrationBuilder.RenameColumn(
                name: "ChangedBy",
                table: "AksiyonGecmisi",
                newName: "Degistiren");

            migrationBuilder.RenameColumn(
                name: "ActionId",
                table: "AksiyonGecmisi",
                newName: "AksiyonId");

            migrationBuilder.RenameIndex(
                name: "IX_AksiyonGecmisi_ActionId",
                table: "AksiyonGecmisi",
                newName: "IX_AksiyonGecmisi_AksiyonId");

            migrationBuilder.AlterColumn<string>(
                name: "YeniDurum",
                table: "AksiyonGecmisi",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "EskiDurum",
                table: "AksiyonGecmisi",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Aciklama",
                table: "AksiyonGecmisi",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Degistiren",
                table: "AksiyonGecmisi",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AksiyonGecmisi_Aksiyonlar",
                table: "AksiyonGecmisi",
                column: "AksiyonId",
                principalTable: "Aksiyonlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AksiyonGecmisi_Aksiyonlar",
                table: "AksiyonGecmisi");

            migrationBuilder.RenameColumn(
                name: "YeniDurum",
                table: "AksiyonGecmisi",
                newName: "StatusTo");

            migrationBuilder.RenameColumn(
                name: "OlusturmaTarihi",
                table: "AksiyonGecmisi",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "GuncellemeTarihi",
                table: "AksiyonGecmisi",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "EskiDurum",
                table: "AksiyonGecmisi",
                newName: "StatusFrom");

            migrationBuilder.RenameColumn(
                name: "Degistiren",
                table: "AksiyonGecmisi",
                newName: "ChangedBy");

            migrationBuilder.RenameColumn(
                name: "AksiyonId",
                table: "AksiyonGecmisi",
                newName: "ActionId");

            migrationBuilder.RenameColumn(
                name: "Aciklama",
                table: "AksiyonGecmisi",
                newName: "Comment");

            migrationBuilder.RenameIndex(
                name: "IX_AksiyonGecmisi_AksiyonId",
                table: "AksiyonGecmisi",
                newName: "IX_AksiyonGecmisi_ActionId");

            migrationBuilder.AlterColumn<int>(
                name: "StatusTo",
                table: "AksiyonGecmisi",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "StatusFrom",
                table: "AksiyonGecmisi",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ChangedBy",
                table: "AksiyonGecmisi",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Comment",
                table: "AksiyonGecmisi",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AksiyonGecmisi_Aksiyonlar_ActionId",
                table: "AksiyonGecmisi",
                column: "ActionId",
                principalTable: "Aksiyonlar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
