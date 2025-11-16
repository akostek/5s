-- ============================================
-- 5S DENETİM SİSTEMİ - VERİTABANI ŞEMASI
-- ============================================
-- Bu dosya tüm veritabanı tablolarının şemasını içerir
-- Entity Framework Configuration dosyalarından oluşturulmuştur
-- Oluşturulma Tarihi: 2025-01-XX
-- PostgreSQL 8.0+
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLOLAR
-- ============================================

-- Roller Tablosu
CREATE TABLE IF NOT EXISTS "Roller" (
    "Id" SERIAL PRIMARY KEY,
    "Ad" VARCHAR(255) NOT NULL UNIQUE,
    "Aciklama" VARCHAR(1000) NULL,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS "IX_Roller_Ad" ON "Roller"("Ad");

-- Sektorler Tablosu
CREATE TABLE IF NOT EXISTS "Sektorler" (
    "Id" SERIAL PRIMARY KEY,
    "SektorAdi" VARCHAR(100) NOT NULL,
    "Aciklama" VARCHAR(500) NULL,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

-- Direktorlukler Tablosu
CREATE TABLE IF NOT EXISTS "Direktorlukler" (
    "Id" SERIAL PRIMARY KEY,
    "DirektorlukAdi" VARCHAR(100) NOT NULL,
    "SektorId" INTEGER NULL,
    "Aciklama" VARCHAR(500) NULL,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Direktorlukler_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Direktorlukler_SektorId" ON "Direktorlukler"("SektorId");

-- Bolumler Tablosu
CREATE TABLE IF NOT EXISTS "Bolumler" (
    "Id" SERIAL PRIMARY KEY,
    "BolumAdi" VARCHAR(255) NOT NULL UNIQUE,
    "SektorId" INTEGER NULL,
    "DirektorlukId" INTEGER NULL,
    "Aciklama" VARCHAR(1000) NULL,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Bolumler_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Bolumler_Direktorlukler" FOREIGN KEY ("DirektorlukId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Bolumler_BolumAdi" ON "Bolumler"("BolumAdi");
CREATE INDEX IF NOT EXISTS "IX_Bolumler_SectorId" ON "Bolumler"("SektorId");
CREATE INDEX IF NOT EXISTS "IX_Bolumler_DirectorateId" ON "Bolumler"("DirektorlukId");

-- Alanlar Tablosu
CREATE TABLE IF NOT EXISTS "Alanlar" (
    "Id" SERIAL PRIMARY KEY,
    "AlanAdi" VARCHAR(255) NOT NULL,
    "BolumId" INTEGER NOT NULL,
    "SektorId" INTEGER NULL,
    "DirektorlukId" INTEGER NULL,
    "Aciklama" VARCHAR(1000) NULL,
    "Sorumlu" VARCHAR(200) NULL,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Alanlar_Bolumler" FOREIGN KEY ("BolumId") REFERENCES "Bolumler"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Alanlar_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Alanlar_Direktorlukler" FOREIGN KEY ("DirektorlukId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Alanlar_DepartmentId" ON "Alanlar"("BolumId");

-- Kategoriler Tablosu
CREATE TABLE IF NOT EXISTS "Kategoriler" (
    "Id" SERIAL PRIMARY KEY,
    "KategoriAdi" VARCHAR(255) NOT NULL,
    "Aciklama" VARCHAR(1000) NULL,
    "Sira" INTEGER NOT NULL DEFAULT 0,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

-- Sorular Tablosu
CREATE TABLE IF NOT EXISTS "Sorular" (
    "Id" SERIAL PRIMARY KEY,
    "KategoriId" INTEGER NOT NULL,
    "SoruMetni" VARCHAR(1000) NOT NULL,
    "Sektor" VARCHAR(100) NULL,
    "Direktorluk" VARCHAR(200) NULL,
    "Bolum" VARCHAR(200) NULL,
    "Alan" VARCHAR(200) NULL,
    "Sira" INTEGER NOT NULL DEFAULT 0,
    "YuksekPuan" INTEGER NOT NULL DEFAULT 10,
    "OrtaPuan" INTEGER NOT NULL DEFAULT 5,
    "DusukPuan" INTEGER NOT NULL DEFAULT 0,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Sorular_Kategoriler" FOREIGN KEY ("KategoriId") REFERENCES "Kategoriler"("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Sorular_CategoryId" ON "Sorular"("KategoriId");

-- Kullanicilar Tablosu
CREATE TABLE IF NOT EXISTS "Kullanicilar" (
    "Id" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "Sifre" TEXT NOT NULL,
    "AdSoyad" VARCHAR(255) NOT NULL,
    "KullaniciAdi" VARCHAR(100) NULL,
    "SicilNo" VARCHAR(50) NULL,
    "SektorId" INTEGER NULL,
    "DirektorlukId" INTEGER NULL,
    "RolId" INTEGER NOT NULL,
    "BolumId" INTEGER NULL,
    "Aktif" BOOLEAN NOT NULL DEFAULT TRUE,
    "SonGiris" TIMESTAMP WITH TIME ZONE NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Kullanicilar_Roller" FOREIGN KEY ("RolId") REFERENCES "Roller"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Kullanicilar_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Kullanicilar_Direktorlukler" FOREIGN KEY ("DirektorlukId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Kullanicilar_Bolumler" FOREIGN KEY ("BolumId") REFERENCES "Bolumler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_Email" ON "Kullanicilar"("Email");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_KullaniciAdi" ON "Kullanicilar"("KullaniciAdi");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_RoleId" ON "Kullanicilar"("RolId");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_SectorId" ON "Kullanicilar"("SektorId");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_DirectorateId" ON "Kullanicilar"("DirektorlukId");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_DepartmentId" ON "Kullanicilar"("BolumId");

-- Denetimler Tablosu
CREATE TABLE IF NOT EXISTS "Denetimler" (
    "Id" SERIAL PRIMARY KEY,
    "BolumId" INTEGER NOT NULL,
    "SektorId" INTEGER NULL,
    "DirektorlukId" INTEGER NULL,
    "DenetciId" INTEGER NOT NULL,
    "AlanId" INTEGER NULL,
    "AlanSorumlusu" VARCHAR(200) NULL,
    "DenetimTarihi" DATE NULL,
    "Notlar" VARCHAR(2000) NULL,
    "Durum" VARCHAR(50) NOT NULL DEFAULT 'planlandı',
    "ToplamPuan" INTEGER NOT NULL DEFAULT 0,
    "MaksimumPuan" INTEGER NOT NULL DEFAULT 0,
    "UlasilanSeviye" VARCHAR(50) NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Denetimler_Bolumler" FOREIGN KEY ("BolumId") REFERENCES "Bolumler"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Denetimler_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Denetimler_Direktorlukler" FOREIGN KEY ("DirektorlukId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Denetimler_Alanlar" FOREIGN KEY ("AlanId") REFERENCES "Alanlar"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Denetimler_Kullanicilar" FOREIGN KEY ("DenetciId") REFERENCES "Kullanicilar"("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_Denetimler_DepartmentId" ON "Denetimler"("BolumId");
CREATE INDEX IF NOT EXISTS "IX_Denetimler_AreaId" ON "Denetimler"("AlanId");
CREATE INDEX IF NOT EXISTS "IX_Denetimler_AuditorId" ON "Denetimler"("DenetciId");

-- Denetim Planları Tablosu
CREATE TABLE IF NOT EXISTS "DenetimPlanlari" (
    "Id" SERIAL PRIMARY KEY,
    "PlanAdi" VARCHAR(255) NOT NULL,
    "BolumId" INTEGER NOT NULL,
    "AlanId" INTEGER NOT NULL,
    "DenetciId" INTEGER NOT NULL,
    "KategoriId" INTEGER NULL,
    "PlanlananTarih" DATE NULL,
    "Durum" VARCHAR(50) NOT NULL,
    "Notlar" VARCHAR(2000) NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_DenetimPlanlari_Bolumler" FOREIGN KEY ("BolumId") REFERENCES "Bolumler"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_DenetimPlanlari_Alanlar" FOREIGN KEY ("AlanId") REFERENCES "Alanlar"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_DenetimPlanlari_Kullanicilar" FOREIGN KEY ("DenetciId") REFERENCES "Kullanicilar"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_DenetimPlanlari_Kategoriler" FOREIGN KEY ("KategoriId") REFERENCES "Kategoriler"("Id") ON DELETE RESTRICT
);

-- Denetim Planı - Denetim İlişki Tablosu
CREATE TABLE IF NOT EXISTS "AuditAuditPlan" (
    "AuditPlansId" INTEGER NOT NULL,
    "AuditsId" INTEGER NOT NULL,
    PRIMARY KEY ("AuditPlansId", "AuditsId"),
    CONSTRAINT "FK_AuditAuditPlan_DenetimPlanlari" FOREIGN KEY ("AuditPlansId") REFERENCES "DenetimPlanlari"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AuditAuditPlan_Denetimler" FOREIGN KEY ("AuditsId") REFERENCES "Denetimler"("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_AuditAuditPlan_AuditsId" ON "AuditAuditPlan"("AuditsId");

-- Denetim Cevapları Tablosu
CREATE TABLE IF NOT EXISTS "DenetimYanitlari" (
    "Id" SERIAL PRIMARY KEY,
    "DenetimId" INTEGER NOT NULL,
    "SoruId" INTEGER NOT NULL,
    "Yanit" VARCHAR(50) NOT NULL,
    "VerilenPuan" INTEGER NOT NULL DEFAULT 0,
    "SoruGorselleri" VARCHAR(4000) NULL,
    "BolumId" INTEGER NULL,
    "SektorId" INTEGER NULL,
    "DirektorlukId" INTEGER NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_DenetimYanitlari_Denetimler" FOREIGN KEY ("DenetimId") REFERENCES "Denetimler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_DenetimYanitlari_Sorular" FOREIGN KEY ("SoruId") REFERENCES "Sorular"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_DenetimYanitlari_Bolumler" FOREIGN KEY ("BolumId") REFERENCES "Bolumler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_DenetimYanitlari_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_DenetimYanitlari_Direktorlukler" FOREIGN KEY ("DirektorlukId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_DenetimCevaplari_AuditId" ON "DenetimYanitlari"("DenetimId");
CREATE INDEX IF NOT EXISTS "IX_DenetimCevaplari_QuestionId" ON "DenetimYanitlari"("SoruId");

-- Aksiyonlar Tablosu
CREATE TABLE IF NOT EXISTS "Aksiyonlar" (
    "Id" SERIAL PRIMARY KEY,
    "DenetimId" INTEGER NOT NULL,
    "SoruId" INTEGER NULL,
    "BolumId" INTEGER NULL,
    "SektorId" INTEGER NULL,
    "DirektorlukId" INTEGER NULL,
    "ResimYolu" VARCHAR(500) NULL,
    "Aciklama" VARCHAR(2000) NOT NULL,
    "OnerilenFaaliyet" VARCHAR(1000) NULL,
    "PlanlananFaaliyet" VARCHAR(1000) NULL,
    "HedefTarih" DATE NULL,
    "Sorumlu" VARCHAR(200) NULL,
    "Durum" VARCHAR(50) NOT NULL DEFAULT 'açık',
    "Oncelik" VARCHAR(50) NULL DEFAULT 'orta',
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Aksiyonlar_Denetimler" FOREIGN KEY ("DenetimId") REFERENCES "Denetimler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Aksiyonlar_Sorular" FOREIGN KEY ("SoruId") REFERENCES "Sorular"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Aksiyonlar_Bolumler" FOREIGN KEY ("BolumId") REFERENCES "Bolumler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Aksiyonlar_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Aksiyonlar_Direktorlukler" FOREIGN KEY ("DirektorlukId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_Aksiyonlar_AuditId" ON "Aksiyonlar"("DenetimId");
CREATE INDEX IF NOT EXISTS "IX_Aksiyonlar_AssignedTo" ON "Aksiyonlar"("Sorumlu");

-- Seviye Eşikleri Tablosu
CREATE TABLE IF NOT EXISTS "SeviyeEsikleri" (
    "Id" SERIAL PRIMARY KEY,
    "SeviyeAdi" VARCHAR(100) NOT NULL,
    "MinimumYuzde" DECIMAL(5,2) NOT NULL,
    "MaksimumYuzde" DECIMAL(5,2) NOT NULL,
    "SektorId" INTEGER NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_SeviyeEsikleri_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "IX_SeviyeEsikleri_SectorId" ON "SeviyeEsikleri"("SektorId");

-- Ayarlar Tablosu
CREATE TABLE IF NOT EXISTS "Ayarlar" (
    "Id" SERIAL PRIMARY KEY,
    "Anahtar" VARCHAR(255) NOT NULL UNIQUE,
    "Deger" TEXT NOT NULL,
    "Aciklama" VARCHAR(1000) NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS "IX_Ayarlar_Anahtar" ON "Ayarlar"("Anahtar");

-- Yetkiler Tablosu
CREATE TABLE IF NOT EXISTS "yetkiler" (
    "Id" SERIAL PRIMARY KEY,
    "roleId" INTEGER NOT NULL,
    "page" VARCHAR(100) NOT NULL,
    "button" VARCHAR(50) NULL,
    "filterSektor" BOOLEAN NOT NULL DEFAULT FALSE,
    "filterDirektorluk" BOOLEAN NOT NULL DEFAULT FALSE,
    "showPlanlananTarih" BOOLEAN NOT NULL DEFAULT FALSE,
    "showPlanlandiDurum" BOOLEAN NOT NULL DEFAULT FALSE,
    "canView" BOOLEAN NOT NULL DEFAULT FALSE,
    "canViewYetkilerTab" BOOLEAN NOT NULL DEFAULT FALSE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_yetkiler_Roller" FOREIGN KEY ("roleId") REFERENCES "Roller"("Id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "IX_yetkiler_RoleId_Page_Button" ON "yetkiler"("roleId", "page", "button");
CREATE INDEX IF NOT EXISTS "IX_yetkiler_RoleId_Page" ON "yetkiler"("roleId", "page");
CREATE INDEX IF NOT EXISTS "IX_yetkiler_roleId" ON "yetkiler"("roleId");

-- ============================================
-- VARSayılan VERİLER (SEED DATA)
-- ============================================

-- Seviye Eşikleri
INSERT INTO "SeviyeEsikleri" ("Id", "SeviyeAdi", "MinimumYuzde", "MaksimumYuzde", "SektorId", "OlusturmaTarihi") VALUES
(1, 'Başlangıç S', 0, 19.99, NULL, CURRENT_TIMESTAMP),
(2, '1S', 20, 39.99, NULL, CURRENT_TIMESTAMP),
(3, '2S', 40, 59.99, NULL, CURRENT_TIMESTAMP),
(4, '3S', 60, 79.99, NULL, CURRENT_TIMESTAMP),
(5, '4S', 80, 94.99, NULL, CURRENT_TIMESTAMP),
(6, '5S', 95, 100, NULL, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Kategoriler
INSERT INTO "Kategoriler" ("Id", "KategoriAdi", "Aciklama", "Sira", "Aktif", "OlusturmaTarihi") VALUES
(1, '1S - Seiri (Ayıklama)', 'Gereksiz malzemelerin ayıklanması', 1, TRUE, CURRENT_TIMESTAMP),
(2, '2S - Seiton (Düzenleme)', 'Her şeyin yerli yerinde olması', 2, TRUE, CURRENT_TIMESTAMP),
(3, '3S - Seiso (Temizlik)', 'Çalışma alanının temiz tutulması', 3, TRUE, CURRENT_TIMESTAMP),
(4, '4S - Seiketsu (Standartlaştırma)', 'Standartların uygulanması', 4, TRUE, CURRENT_TIMESTAMP),
(5, '5S - Shitsuke (Disiplin)', 'Disiplinli çalışma alışkanlığı', 5, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTLAR
-- ============================================
-- 1. Bu dosya Entity Framework Configuration dosyalarından oluşturulmuştur
-- 2. Tüm kolon isimleri Türkçe'dir (Entity Configuration'lara göre)
-- 3. Veritabanı şeması güncellendiğinde bu dosya da güncellenmelidir
-- 4. Production ortamında çalıştırmadan önce yedek alınmalıdır
-- 5. ON CONFLICT DO NOTHING kullanıldığı için seed data tekrar çalıştırılabilir
-- 6. Foreign key constraint'ler Entity Configuration'lara göre ayarlanmıştır
-- ============================================
