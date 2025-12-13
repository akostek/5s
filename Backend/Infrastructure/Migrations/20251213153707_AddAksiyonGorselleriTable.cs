using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAksiyonGorselleriTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AksiyonGorselleri",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AksiyonId = table.Column<int>(type: "integer", nullable: false),
                    GorselYolu = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    GorselTipi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AksiyonGorselleri", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AksiyonGorselleri_Aksiyonlar",
                        column: x => x.AksiyonId,
                        principalTable: "Aksiyonlar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AksiyonGorselleri_AksiyonId",
                table: "AksiyonGorselleri",
                column: "AksiyonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AksiyonGorselleri");
        }
    }
}
