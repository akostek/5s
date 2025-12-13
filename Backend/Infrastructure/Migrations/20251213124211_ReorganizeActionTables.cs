using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReorganizeActionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop columns from Aksiyonlar
            migrationBuilder.DropColumn(
                name: "alansorumlusu_not",
                table: "Aksiyonlar");

            migrationBuilder.DropColumn(
                name: "denetci_not",
                table: "Aksiyonlar");

            // Create AksiyonGecmisi table directly (instead of renaming missing ActionHistories)
            migrationBuilder.CreateTable(
                name: "AksiyonGecmisi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ActionId = table.Column<int>(type: "integer", nullable: false),
                    StatusFrom = table.Column<int>(type: "integer", nullable: false),
                    StatusTo = table.Column<int>(type: "integer", nullable: false),
                    ChangedBy = table.Column<string>(type: "text", nullable: true),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AksiyonGecmisi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AksiyonGecmisi_Aksiyonlar_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Aksiyonlar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AksiyonGecmisi_ActionId",
                table: "AksiyonGecmisi",
                column: "ActionId");

            // Create AksiyonNotlar table
            migrationBuilder.CreateTable(
                name: "AksiyonNotlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ActionId = table.Column<int>(type: "integer", nullable: false),
                    alansorumlusu_not = table.Column<string>(type: "text", nullable: true),
                    denetci_not = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AksiyonNotlar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AksiyonNotlar_Aksiyonlar_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Aksiyonlar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AksiyonNotlar_ActionId",
                table: "AksiyonNotlar",
                column: "ActionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AksiyonGecmisi");

            migrationBuilder.DropTable(
                name: "AksiyonNotlar");

            migrationBuilder.AddColumn<string>(
                name: "alansorumlusu_not",
                table: "Aksiyonlar",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "denetci_not",
                table: "Aksiyonlar",
                type: "text",
                nullable: true);
        }
    }
}
