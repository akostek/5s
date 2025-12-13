using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEvidenceImagePathColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EvidenceImagePath",
                table: "Aksiyonlar",
                newName: "KanitGorselYolu");

            migrationBuilder.AlterColumn<string>(
                name: "KanitGorselYolu",
                table: "Aksiyonlar",
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
                table: "Aksiyonlar",
                newName: "EvidenceImagePath");

            migrationBuilder.AlterColumn<string>(
                name: "EvidenceImagePath",
                table: "Aksiyonlar",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}
