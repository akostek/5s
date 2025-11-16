using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FiveS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditPlanCategoryColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ayarlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Anahtar = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Deger = table.Column<string>(type: "text", nullable: false),
                    Aciklama = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ayarlar", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Direktorlukler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DirektorlukAdi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Aciklama = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Direktorlukler", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Kategoriler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KategoriAdi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Aciklama = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Sira = table.Column<int>(type: "integer", nullable: false),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kategoriler", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sektorler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SektorAdi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Aciklama = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sektorler", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SeviyeEsikleri",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SeviyeAdi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MinimumYuzde = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    MaksimumYuzde = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeviyeEsikleri", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sorular",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KategoriId = table.Column<int>(type: "integer", nullable: false),
                    SoruMetni = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Sektor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Direktorluk = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Bolum = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Alan = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Sira = table.Column<int>(type: "integer", nullable: false),
                    YuksekPuan = table.Column<int>(type: "integer", nullable: false),
                    OrtaPuan = table.Column<int>(type: "integer", nullable: false),
                    DusukPuan = table.Column<int>(type: "integer", nullable: false),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sorular", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sorular_Kategoriler",
                        column: x => x.KategoriId,
                        principalTable: "Kategoriler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bolumler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BolumAdi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    SektorId = table.Column<int>(type: "integer", nullable: true),
                    DirektorlukId = table.Column<int>(type: "integer", nullable: true),
                    Aciklama = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bolumler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bolumler_Direktorlukler_DirektorlukId",
                        column: x => x.DirektorlukId,
                        principalTable: "Direktorlukler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Bolumler_Sektorler_SektorId",
                        column: x => x.SektorId,
                        principalTable: "Sektorler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Alanlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlanAdi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    BolumId = table.Column<int>(type: "integer", nullable: false),
                    SektorId = table.Column<int>(type: "integer", nullable: true),
                    DirektorlukId = table.Column<int>(type: "integer", nullable: true),
                    Aciklama = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Sorumlu = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alanlar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alanlar_Bolumler",
                        column: x => x.BolumId,
                        principalTable: "Bolumler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Alanlar_Direktorlukler_DirektorlukId",
                        column: x => x.DirektorlukId,
                        principalTable: "Direktorlukler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Alanlar_Sektorler_SektorId",
                        column: x => x.SektorId,
                        principalTable: "Sektorler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Kullanicilar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Sifre = table.Column<string>(type: "text", nullable: false),
                    AdSoyad = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    KullaniciAdi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SicilNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SektorId = table.Column<int>(type: "integer", nullable: true),
                    DirektorlukId = table.Column<int>(type: "integer", nullable: true),
                    Rol = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BolumId = table.Column<int>(type: "integer", nullable: true),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false),
                    SonGiris = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kullanicilar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Kullanicilar_Bolumler",
                        column: x => x.BolumId,
                        principalTable: "Bolumler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Kullanicilar_Direktorlukler",
                        column: x => x.DirektorlukId,
                        principalTable: "Direktorlukler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Kullanicilar_Sektorler",
                        column: x => x.SektorId,
                        principalTable: "Sektorler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Denetimler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BolumId = table.Column<int>(type: "integer", nullable: false),
                    DenetciId = table.Column<int>(type: "integer", nullable: false),
                    Alan = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AlanSorumlusu = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DenetimTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notlar = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Durum = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ToplamPuan = table.Column<int>(type: "integer", nullable: false),
                    MaksimumPuan = table.Column<int>(type: "integer", nullable: false),
                    UlasilanSeviye = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Denetimler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Denetimler_Bolumler",
                        column: x => x.BolumId,
                        principalTable: "Bolumler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Denetimler_Kullanicilar",
                        column: x => x.DenetciId,
                        principalTable: "Kullanicilar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DenetimPlanlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanAdi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    BolumId = table.Column<int>(type: "integer", nullable: false),
                    AlanId = table.Column<int>(type: "integer", nullable: false),
                    DenetciId = table.Column<int>(type: "integer", nullable: false),
                    KategoriId = table.Column<int>(type: "integer", nullable: true),
                    PlanlananTarih = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Durum = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Notlar = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DenetimPlanlari", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DenetimPlanlari_Alanlar",
                        column: x => x.AlanId,
                        principalTable: "Alanlar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DenetimPlanlari_Bolumler",
                        column: x => x.BolumId,
                        principalTable: "Bolumler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DenetimPlanlari_Kategoriler",
                        column: x => x.KategoriId,
                        principalTable: "Kategoriler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DenetimPlanlari_Kullanicilar",
                        column: x => x.DenetciId,
                        principalTable: "Kullanicilar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Aksiyonlar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DenetimId = table.Column<int>(type: "integer", nullable: false),
                    SoruId = table.Column<int>(type: "integer", nullable: false),
                    BolumId = table.Column<int>(type: "integer", nullable: true),
                    SektorId = table.Column<int>(type: "integer", nullable: true),
                    DirektorlukId = table.Column<int>(type: "integer", nullable: true),
                    ResimYolu = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Aciklama = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OnerilenFaaliyet = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PlanlananFaaliyet = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    HedefTarih = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Sorumlu = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Durum = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aksiyonlar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Aksiyonlar_Bolumler",
                        column: x => x.BolumId,
                        principalTable: "Bolumler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Aksiyonlar_Denetimler",
                        column: x => x.DenetimId,
                        principalTable: "Denetimler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Aksiyonlar_Direktorlukler",
                        column: x => x.DirektorlukId,
                        principalTable: "Direktorlukler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Aksiyonlar_Sektorler",
                        column: x => x.SektorId,
                        principalTable: "Sektorler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Aksiyonlar_Sorular",
                        column: x => x.SoruId,
                        principalTable: "Sorular",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AuditAuditPlan",
                columns: table => new
                {
                    AuditPlansId = table.Column<int>(type: "integer", nullable: false),
                    AuditsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditAuditPlan", x => new { x.AuditPlansId, x.AuditsId });
                    table.ForeignKey(
                        name: "FK_AuditAuditPlan_DenetimPlanlari_AuditPlansId",
                        column: x => x.AuditPlansId,
                        principalTable: "DenetimPlanlari",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AuditAuditPlan_Denetimler_AuditsId",
                        column: x => x.AuditsId,
                        principalTable: "Denetimler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DenetimYanitlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DenetimId = table.Column<int>(type: "integer", nullable: true),
                    DenetimPlaniId = table.Column<int>(type: "integer", nullable: true),
                    SoruId = table.Column<int>(type: "integer", nullable: false),
                    Yanit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VerilenPuan = table.Column<int>(type: "integer", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuncellemeTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DenetimYanitlari", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DenetimYanitlari_DenetimPlanlari",
                        column: x => x.DenetimPlaniId,
                        principalTable: "DenetimPlanlari",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DenetimYanitlari_Denetimler",
                        column: x => x.DenetimId,
                        principalTable: "Denetimler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DenetimYanitlari_Sorular",
                        column: x => x.SoruId,
                        principalTable: "Sorular",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Kategoriler",
                columns: new[] { "Id", "OlusturmaTarihi", "Aciklama", "Aktif", "KategoriAdi", "Sira", "GuncellemeTarihi" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gereksiz malzemelerin ayıklanması", true, "1S - Seiri (Ayıklama)", 1, null },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Her şeyin yerli yerinde olması", true, "2S - Seiton (Düzenleme)", 2, null },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Çalışma alanının temiz tutulması", true, "3S - Seiso (Temizlik)", 3, null },
                    { 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Standartların uygulanması", true, "4S - Seiketsu (Standartlaştırma)", 4, null },
                    { 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Disiplinli çalışma alışkanlığı", true, "5S - Shitsuke (Disiplin)", 5, null }
                });

            migrationBuilder.InsertData(
                table: "SeviyeEsikleri",
                columns: new[] { "Id", "OlusturmaTarihi", "SeviyeAdi", "MaksimumYuzde", "MinimumYuzde", "GuncellemeTarihi" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Başlangıç S", 19.99m, 0m, null },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "1S", 39.99m, 20m, null },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "2S", 59.99m, 40m, null },
                    { 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "3S", 79.99m, 60m, null },
                    { 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "4S", 94.99m, 80m, null },
                    { 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "5S", 100m, 95m, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Aksiyonlar_BolumId",
                table: "Aksiyonlar",
                column: "BolumId");

            migrationBuilder.CreateIndex(
                name: "IX_Aksiyonlar_DenetimId",
                table: "Aksiyonlar",
                column: "DenetimId");

            migrationBuilder.CreateIndex(
                name: "IX_Aksiyonlar_DirektorlukId",
                table: "Aksiyonlar",
                column: "DirektorlukId");

            migrationBuilder.CreateIndex(
                name: "IX_Aksiyonlar_SektorId",
                table: "Aksiyonlar",
                column: "SektorId");

            migrationBuilder.CreateIndex(
                name: "IX_Aksiyonlar_SoruId",
                table: "Aksiyonlar",
                column: "SoruId");

            migrationBuilder.CreateIndex(
                name: "IX_Alanlar_BolumId",
                table: "Alanlar",
                column: "BolumId");

            migrationBuilder.CreateIndex(
                name: "IX_Alanlar_DirektorlukId",
                table: "Alanlar",
                column: "DirektorlukId");

            migrationBuilder.CreateIndex(
                name: "IX_Alanlar_SektorId",
                table: "Alanlar",
                column: "SektorId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditAuditPlan_AuditsId",
                table: "AuditAuditPlan",
                column: "AuditsId");

            migrationBuilder.CreateIndex(
                name: "IX_Ayarlar_Anahtar",
                table: "Ayarlar",
                column: "Anahtar",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bolumler_BolumAdi",
                table: "Bolumler",
                column: "BolumAdi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bolumler_DirektorlukId",
                table: "Bolumler",
                column: "DirektorlukId");

            migrationBuilder.CreateIndex(
                name: "IX_Bolumler_SektorId",
                table: "Bolumler",
                column: "SektorId");

            migrationBuilder.CreateIndex(
                name: "IX_Denetimler_BolumId",
                table: "Denetimler",
                column: "BolumId");

            migrationBuilder.CreateIndex(
                name: "IX_Denetimler_DenetciId",
                table: "Denetimler",
                column: "DenetciId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimPlanlari_AlanId",
                table: "DenetimPlanlari",
                column: "AlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimPlanlari_BolumId",
                table: "DenetimPlanlari",
                column: "BolumId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimPlanlari_DenetciId",
                table: "DenetimPlanlari",
                column: "DenetciId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimPlanlari_KategoriId",
                table: "DenetimPlanlari",
                column: "KategoriId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimYanitlari_DenetimId",
                table: "DenetimYanitlari",
                column: "DenetimId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimYanitlari_DenetimPlaniId",
                table: "DenetimYanitlari",
                column: "DenetimPlaniId");

            migrationBuilder.CreateIndex(
                name: "IX_DenetimYanitlari_SoruId",
                table: "DenetimYanitlari",
                column: "SoruId");

            migrationBuilder.CreateIndex(
                name: "IX_Kullanicilar_BolumId",
                table: "Kullanicilar",
                column: "BolumId");

            migrationBuilder.CreateIndex(
                name: "IX_Kullanicilar_DirektorlukId",
                table: "Kullanicilar",
                column: "DirektorlukId");

            migrationBuilder.CreateIndex(
                name: "IX_Kullanicilar_Email",
                table: "Kullanicilar",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Kullanicilar_KullaniciAdi",
                table: "Kullanicilar",
                column: "KullaniciAdi");

            migrationBuilder.CreateIndex(
                name: "IX_Kullanicilar_SektorId",
                table: "Kullanicilar",
                column: "SektorId");

            migrationBuilder.CreateIndex(
                name: "IX_Sorular_KategoriId",
                table: "Sorular",
                column: "KategoriId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Aksiyonlar");

            migrationBuilder.DropTable(
                name: "AuditAuditPlan");

            migrationBuilder.DropTable(
                name: "Ayarlar");

            migrationBuilder.DropTable(
                name: "DenetimYanitlari");

            migrationBuilder.DropTable(
                name: "SeviyeEsikleri");

            migrationBuilder.DropTable(
                name: "DenetimPlanlari");

            migrationBuilder.DropTable(
                name: "Denetimler");

            migrationBuilder.DropTable(
                name: "Sorular");

            migrationBuilder.DropTable(
                name: "Alanlar");

            migrationBuilder.DropTable(
                name: "Kullanicilar");

            migrationBuilder.DropTable(
                name: "Kategoriler");

            migrationBuilder.DropTable(
                name: "Bolumler");

            migrationBuilder.DropTable(
                name: "Direktorlukler");

            migrationBuilder.DropTable(
                name: "Sektorler");
        }
    }
}
