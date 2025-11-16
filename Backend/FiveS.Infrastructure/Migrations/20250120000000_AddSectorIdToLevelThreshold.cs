using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FiveS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSectorIdToLevelThreshold : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SektorId",
                table: "SeviyeEsikleri",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SeviyeEsikleri_SektorId",
                table: "SeviyeEsikleri",
                column: "SektorId");

            migrationBuilder.AddForeignKey(
                name: "FK_SeviyeEsikleri_Sektorler",
                table: "SeviyeEsikleri",
                column: "SektorId",
                principalTable: "Sektorler",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SeviyeEsikleri_Sektorler",
                table: "SeviyeEsikleri");

            migrationBuilder.DropIndex(
                name: "IX_SeviyeEsikleri_SektorId",
                table: "SeviyeEsikleri");

            migrationBuilder.DropColumn(
                name: "SektorId",
                table: "SeviyeEsikleri");
        }
    }
}





