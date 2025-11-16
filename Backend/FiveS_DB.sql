-- ============================================
-- 5S DENETİM SİSTEMİ - VERİTABANI ŞEMASI
-- ============================================
-- Bu dosya tüm veritabanı tablolarının şemasını içerir
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
    "Ad" VARCHAR(100) NOT NULL UNIQUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS "Kullanicilar" (
    "Id" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "Username" VARCHAR(100) NULL,
    "Sicil" VARCHAR(50) NULL,
    "SectorId" INTEGER NULL,
    "DirectorateId" INTEGER NULL,
    "RoleId" INTEGER NOT NULL,
    "DepartmentId" INTEGER NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "LastLogin" TIMESTAMP WITH TIME ZONE NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Kullanicilar_Roller" FOREIGN KEY ("RoleId") REFERENCES "Roller"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Kullanicilar_Sektorler" FOREIGN KEY ("SectorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Kullanicilar_Direktorlukler" FOREIGN KEY ("DirectorateId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Kullanicilar_Bolumler" FOREIGN KEY ("DepartmentId") REFERENCES "Bolumler"("Id") ON DELETE SET NULL
);

-- Sektorler Tablosu
CREATE TABLE IF NOT EXISTS "Sektorler" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

-- Direktorlukler Tablosu
CREATE TABLE IF NOT EXISTS "Direktorlukler" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "SektorId" INTEGER NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Direktorlukler_Sektorler" FOREIGN KEY ("SektorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL
);

-- Bolumler Tablosu
CREATE TABLE IF NOT EXISTS "Bolumler" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "SectorId" INTEGER NULL,
    "DirectorateId" INTEGER NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Bolumler_Sektorler" FOREIGN KEY ("SectorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Bolumler_Direktorlukler" FOREIGN KEY ("DirectorateId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL
);

-- Alanlar Tablosu
CREATE TABLE IF NOT EXISTS "Alanlar" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Alanlar_Bolumler" FOREIGN KEY ("DepartmentId") REFERENCES "Bolumler"("Id") ON DELETE RESTRICT
);

-- Kategoriler Tablosu
CREATE TABLE IF NOT EXISTS "Kategoriler" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT NULL,
    "OrderIndex" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

-- Sorular Tablosu
CREATE TABLE IF NOT EXISTS "Sorular" (
    "Id" SERIAL PRIMARY KEY,
    "CategoryId" INTEGER NOT NULL,
    "Text" TEXT NOT NULL,
    "Sector" VARCHAR(100) NULL,
    "Directorate" VARCHAR(200) NULL,
    "Department" VARCHAR(200) NULL,
    "Area" VARCHAR(200) NULL,
    "OrderIndex" INTEGER NOT NULL DEFAULT 0,
    "PointsHigh" INTEGER NOT NULL DEFAULT 10,
    "PointsMedium" INTEGER NOT NULL DEFAULT 5,
    "PointsLow" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Sorular_Kategoriler" FOREIGN KEY ("CategoryId") REFERENCES "Kategoriler"("Id") ON DELETE RESTRICT
);

-- Denetimler Tablosu
CREATE TABLE IF NOT EXISTS "Denetimler" (
    "Id" SERIAL PRIMARY KEY,
    "DepartmentId" INTEGER NOT NULL,
    "AreaId" INTEGER NULL,
    "SectorId" INTEGER NULL,
    "DirectorateId" INTEGER NULL,
    "AuditorId" INTEGER NOT NULL,
    "PlannedDate" DATE NULL,
    "CompletedDate" DATE NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'planlandı',
    "TotalScore" INTEGER NOT NULL DEFAULT 0,
    "MaxPossibleScore" INTEGER NOT NULL DEFAULT 0,
    "LevelAchieved" VARCHAR(50) NULL,
    "Notes" TEXT NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Denetimler_Bolumler" FOREIGN KEY ("DepartmentId") REFERENCES "Bolumler"("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Denetimler_Alanlar" FOREIGN KEY ("AreaId") REFERENCES "Alanlar"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Denetimler_Sektorler" FOREIGN KEY ("SectorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Denetimler_Direktorlukler" FOREIGN KEY ("DirectorateId") REFERENCES "Direktorlukler"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Denetimler_Kullanicilar" FOREIGN KEY ("AuditorId") REFERENCES "Kullanicilar"("Id") ON DELETE RESTRICT
);

-- Denetim Planları Tablosu
CREATE TABLE IF NOT EXISTS "DenetimPlanlari" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT NULL,
    "Category" VARCHAR(100) NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

-- Denetim Planı - Denetim İlişki Tablosu
CREATE TABLE IF NOT EXISTS "AuditAuditPlan" (
    "AuditPlansId" INTEGER NOT NULL,
    "AuditsId" INTEGER NOT NULL,
    PRIMARY KEY ("AuditPlansId", "AuditsId"),
    CONSTRAINT "FK_AuditAuditPlan_DenetimPlanlari" FOREIGN KEY ("AuditPlansId") REFERENCES "DenetimPlanlari"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_AuditAuditPlan_Denetimler" FOREIGN KEY ("AuditsId") REFERENCES "Denetimler"("Id") ON DELETE CASCADE
);

-- Denetim Cevapları Tablosu
CREATE TABLE IF NOT EXISTS "DenetimCevaplari" (
    "Id" SERIAL PRIMARY KEY,
    "AuditId" INTEGER NOT NULL,
    "QuestionId" INTEGER NOT NULL,
    "Response" VARCHAR(20) NOT NULL,
    "PointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "Notes" TEXT NULL,
    "ImageUrls" TEXT NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_DenetimCevaplari_Denetimler" FOREIGN KEY ("AuditId") REFERENCES "Denetimler"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_DenetimCevaplari_Sorular" FOREIGN KEY ("QuestionId") REFERENCES "Sorular"("Id") ON DELETE RESTRICT
);

-- Aksiyonlar Tablosu
CREATE TABLE IF NOT EXISTS "Aksiyonlar" (
    "Id" SERIAL PRIMARY KEY,
    "AuditId" INTEGER NOT NULL,
    "QuestionId" INTEGER NULL,
    "Description" TEXT NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'açık',
    "Priority" VARCHAR(20) NULL DEFAULT 'orta',
    "AssignedTo" INTEGER NULL,
    "DueDate" DATE NULL,
    "CompletedDate" DATE NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_Aksiyonlar_Denetimler" FOREIGN KEY ("AuditId") REFERENCES "Denetimler"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Aksiyonlar_Sorular" FOREIGN KEY ("QuestionId") REFERENCES "Sorular"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Aksiyonlar_Kullanicilar" FOREIGN KEY ("AssignedTo") REFERENCES "Kullanicilar"("Id") ON DELETE SET NULL
);

-- Seviye Eşikleri Tablosu
CREATE TABLE IF NOT EXISTS "SeviyeEsikleri" (
    "Id" SERIAL PRIMARY KEY,
    "LevelName" VARCHAR(50) NOT NULL,
    "MinPercentage" DECIMAL(5,2) NOT NULL,
    "MaxPercentage" DECIMAL(5,2) NOT NULL,
    "SectorId" INTEGER NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT "FK_SeviyeEsikleri_Sektorler" FOREIGN KEY ("SectorId") REFERENCES "Sektorler"("Id") ON DELETE SET NULL
);

-- Ayarlar Tablosu
CREATE TABLE IF NOT EXISTS "Ayarlar" (
    "Id" SERIAL PRIMARY KEY,
    "Key" VARCHAR(100) NOT NULL UNIQUE,
    "Value" TEXT NULL,
    "Description" TEXT NULL,
    "OlusturmaTarihi" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellemeTarihi" TIMESTAMP WITH TIME ZONE NULL
);

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

-- ============================================
-- İNDEKSLER
-- ============================================

CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_RoleId" ON "Kullanicilar"("RoleId");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_SectorId" ON "Kullanicilar"("SectorId");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_DirectorateId" ON "Kullanicilar"("DirectorateId");
CREATE INDEX IF NOT EXISTS "IX_Kullanicilar_DepartmentId" ON "Kullanicilar"("DepartmentId");
CREATE INDEX IF NOT EXISTS "IX_Direktorlukler_SektorId" ON "Direktorlukler"("SektorId");
CREATE INDEX IF NOT EXISTS "IX_Bolumler_SectorId" ON "Bolumler"("SectorId");
CREATE INDEX IF NOT EXISTS "IX_Bolumler_DirectorateId" ON "Bolumler"("DirectorateId");
CREATE INDEX IF NOT EXISTS "IX_Alanlar_DepartmentId" ON "Alanlar"("DepartmentId");
CREATE INDEX IF NOT EXISTS "IX_Sorular_CategoryId" ON "Sorular"("CategoryId");
CREATE INDEX IF NOT EXISTS "IX_Denetimler_DepartmentId" ON "Denetimler"("DepartmentId");
CREATE INDEX IF NOT EXISTS "IX_Denetimler_AreaId" ON "Denetimler"("AreaId");
CREATE INDEX IF NOT EXISTS "IX_Denetimler_AuditorId" ON "Denetimler"("AuditorId");
CREATE INDEX IF NOT EXISTS "IX_DenetimCevaplari_AuditId" ON "DenetimCevaplari"("AuditId");
CREATE INDEX IF NOT EXISTS "IX_DenetimCevaplari_QuestionId" ON "DenetimCevaplari"("QuestionId");
CREATE INDEX IF NOT EXISTS "IX_Aksiyonlar_AuditId" ON "Aksiyonlar"("AuditId");
CREATE INDEX IF NOT EXISTS "IX_Aksiyonlar_AssignedTo" ON "Aksiyonlar"("AssignedTo");
CREATE INDEX IF NOT EXISTS "IX_SeviyeEsikleri_SectorId" ON "SeviyeEsikleri"("SectorId");
CREATE INDEX IF NOT EXISTS "IX_yetkiler_roleId" ON "yetkiler"("roleId");

-- ============================================
-- VARSayılan VERİLER (SEED DATA)
-- ============================================

-- Seviye Eşikleri
INSERT INTO "SeviyeEsikleri" ("Id", "LevelName", "MinPercentage", "MaxPercentage", "SectorId", "OlusturmaTarihi") VALUES
(1, 'Başlangıç S', 0, 19.99, NULL, CURRENT_TIMESTAMP),
(2, '1S', 20, 39.99, NULL, CURRENT_TIMESTAMP),
(3, '2S', 40, 59.99, NULL, CURRENT_TIMESTAMP),
(4, '3S', 60, 79.99, NULL, CURRENT_TIMESTAMP),
(5, '4S', 80, 94.99, NULL, CURRENT_TIMESTAMP),
(6, '5S', 95, 100, NULL, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Kategoriler
INSERT INTO "Kategoriler" ("Id", "Name", "Description", "OrderIndex", "IsActive", "OlusturmaTarihi") VALUES
(1, '1S - Seiri (Ayıklama)', 'Gereksiz malzemelerin ayıklanması', 1, TRUE, CURRENT_TIMESTAMP),
(2, '2S - Seiton (Düzenleme)', 'Her şeyin yerli yerinde olması', 2, TRUE, CURRENT_TIMESTAMP),
(3, '3S - Seiso (Temizlik)', 'Çalışma alanının temiz tutulması', 3, TRUE, CURRENT_TIMESTAMP),
(4, '4S - Seiketsu (Standartlaştırma)', 'Standartların uygulanması', 4, TRUE, CURRENT_TIMESTAMP),
(5, '5S - Shitsuke (Disiplin)', 'Disiplinli çalışma alışkanlığı', 5, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTLAR
-- ============================================
-- 1. Bu dosya Entity Framework Migrations'dan oluşturulmuştur
-- 2. Veritabanı şeması güncellendiğinde bu dosya da güncellenmelidir
-- 3. Production ortamında çalıştırmadan önce yedek alınmalıdır
-- 4. ON CONFLICT DO NOTHING kullanıldığı için seed data tekrar çalıştırılabilir
-- ============================================

