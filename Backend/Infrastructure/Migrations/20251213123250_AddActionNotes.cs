using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class AddActionNotes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
             migrationBuilder.Sql(@"
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Aksiyonlar' AND column_name='alansorumlusu_not') THEN 
                        ALTER TABLE ""Aksiyonlar"" ADD COLUMN ""alansorumlusu_not"" text; 
                    END IF; 

                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Aksiyonlar' AND column_name='denetci_not') THEN 
                        ALTER TABLE ""Aksiyonlar"" ADD COLUMN ""denetci_not"" text; 
                    END IF;
                END $$;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "alansorumlusu_not",
                table: "Aksiyonlar");

            migrationBuilder.DropColumn(
                name: "denetci_not",
                table: "Aksiyonlar");
        }
    }
}
