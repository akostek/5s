using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameEvidenceImagePathToTurkish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EvidenceImagePath",
                table: "AksiyonGecmisi",
                newName: "KanitGorselYolu");

            migrationBuilder.AlterColumn<string>(
                name: "KanitGorselYolu",
                table: "AksiyonGecmisi",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "KanitGorselYolu",
                table: "AksiyonGecmisi",
                newName: "EvidenceImagePath");

            migrationBuilder.AlterColumn<string>(
                name: "EvidenceImagePath",
                table: "AksiyonGecmisi",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}
