using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FiveS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPriorityToActions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Oncelik",
                table: "Aksiyonlar",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Oncelik",
                table: "Aksiyonlar");
        }
    }
}

