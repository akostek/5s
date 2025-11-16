using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FiveS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlsToAuditResponse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SoruGorselleri",
                table: "DenetimYanitlari",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SoruGorselleri",
                table: "DenetimYanitlari");
        }
    }
}











