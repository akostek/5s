-- ============================================
-- ÖNEMLİ NOTLAR
-- ============================================
-- 1. Bu script'i çalıştırmadan önce Roller tablosundaki Id ve Ad değerlerini kontrol edin
-- 2. yetkiler tablosundaki 'roleId' kolonu, Roller tablosundaki 'Id' kolonu ile eşleşmeli
-- 3. Örnek: Roller.Id = 1 ve Roller.Ad = 'Admin' ise yetkiler.roleId = 1 olmalı
-- 4. Script çalıştıktan sonra kullanıcıların yeniden giriş yapması gerekebilir (yeni token için)
-- 5. ÖNCE Roller tablosundaki Id değerlerini kontrol edin:
--    SELECT "Id", "Ad" FROM "Roller" ORDER BY "Id";
-- ============================================

-- Eğer tablo varsa sil (dikkatli kullanın!)
-- DROP TABLE IF EXISTS "yetkiler" CASCADE;

-- Yetkiler tablosunu oluştur
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

-- Index'ler
CREATE INDEX IF NOT EXISTS "IX_yetkiler_RoleId_Page_Button" ON "yetkiler" ("roleId", "page", "button");
CREATE INDEX IF NOT EXISTS "IX_yetkiler_RoleId_Page" ON "yetkiler" ("roleId", "page");

-- ============================================
-- ÖNEMLİ: Roller tablosundaki Id değerlerini kontrol edin
-- ============================================
-- Aşağıdaki script'te varsayılan Id değerleri kullanılmıştır:
-- Admin = 1
-- Denetci = 2
-- AlanSorumlusu = 3
-- 
-- Eğer Roller tablosundaki Id değerleri farklıysa, aşağıdaki INSERT komutlarındaki
-- roleId değerlerini güncelleyin!
-- ============================================

-- Roller tablosundaki Id değerlerini kontrol et
-- SELECT "Id", "Ad" FROM "Roller" ORDER BY "Id";

-- ============================================
-- ADMIN YETKİLERİ (roleId = 1 - varsayılan)
-- ============================================
-- Admin: Tüm sayfalar açık, tüm butonlar açık, filtreleme yok

-- Sayfa yetkileri (button = NULL)
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Anasayfa', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Denetimler', NULL, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Raporlar', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Yardim', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Profil', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Alanlar', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Bolumler', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Kullanicilar', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Ayarlar', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Denetimler
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Denetimler', 'new', FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Denetimler', 'edit', FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Denetimler', 'delete', FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Denetimler', 'AddPlan', FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Raporlar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Raporlar', 'new', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Raporlar', 'edit', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Raporlar', 'delete', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Alanlar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Alanlar', 'new', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Alanlar', 'edit', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Alanlar', 'delete', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Bolumler
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Bolumler', 'new', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Bolumler', 'edit', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Bolumler', 'delete', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Kullanicilar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Kullanicilar', 'new', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Kullanicilar', 'edit', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Kullanicilar', 'delete', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Ayarlar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (1, 'Ayarlar', 'new', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Ayarlar', 'edit', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (1, 'Ayarlar', 'delete', FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- ============================================
-- DENETCI YETKİLERİ (roleId = 2 - varsayılan)
-- ============================================
-- Denetci: Tüm sayfalar açık, tüm butonlar açık, sektör+direktörlük filtresi var

-- Sayfa yetkileri
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (2, 'Anasayfa', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Denetimler', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Raporlar', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Yardim', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Profil', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Alanlar', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Bolumler', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Kullanicilar', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Ayarlar', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);
    -- Denetci Ayarlar sayfasını görebilir ama Yetkiler sekmesini göremez (canViewYetkilerTab = FALSE)

-- Buton yetkileri - Denetimler
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (2, 'Denetimler', 'new', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Denetimler', 'edit', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Denetimler', 'delete', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Denetimler', 'AddPlan', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Raporlar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (2, 'Raporlar', 'new', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Raporlar', 'edit', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Raporlar', 'delete', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Alanlar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (2, 'Alanlar', 'new', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Alanlar', 'edit', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Alanlar', 'delete', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Bolumler
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (2, 'Bolumler', 'new', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Bolumler', 'edit', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Bolumler', 'delete', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Kullanicilar
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (2, 'Kullanicilar', 'new', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Kullanicilar', 'edit', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (2, 'Kullanicilar', 'delete', TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);
    -- Denetci için Ayarlar sayfası buton yetkileri yok (sadece Admin görebilir)

-- ============================================
-- ALANSORUMLUSU YETKİLERİ (roleId = 3 - varsayılan)
-- ============================================
-- AlanSorumlusu: Anasayfa, Denetimler, Raporlar, Yardim, Profil açık
-- new/edit/delete butonları kapalı
-- sektör+direktörlük filtresi var (Raporlar ve Denetimler için)

-- Sayfa yetkileri (sadece belirtilen sayfalar)
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (3, 'Anasayfa', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Denetimler', NULL, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Raporlar', NULL, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Yardim', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Profil', NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, CURRENT_TIMESTAMP);

-- Buton yetkileri - Denetimler (new/edit/delete/AddPlan kapalı)
INSERT INTO "yetkiler" ("roleId", "page", "button", "filterSektor", "filterDirektorluk", "showPlanlananTarih", "showPlanlandiDurum", "canView", "canViewYetkilerTab", "OlusturmaTarihi")
VALUES
    (3, 'Denetimler', 'new', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Denetimler', 'edit', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Denetimler', 'delete', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP),
    (3, 'Denetimler', 'AddPlan', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, CURRENT_TIMESTAMP);

-- ============================================
-- MEVCUT TABLO İÇİN KOLON EKLEME (Eğer tablo zaten varsa)
-- ============================================
-- Eğer yetkiler tablosu zaten varsa, canViewYetkilerTab kolonunu ekle
ALTER TABLE "yetkiler" 
ADD COLUMN IF NOT EXISTS "canViewYetkilerTab" BOOLEAN NOT NULL DEFAULT FALSE;

-- Admin için Ayarlar sayfası yetkisini güncelle (canViewYetkilerTab = TRUE)
UPDATE "yetkiler" 
SET "canViewYetkilerTab" = TRUE 
WHERE "roleId" = 1 AND "page" = 'Ayarlar' AND "button" IS NULL;

-- Diğer tüm kayıtlar için canViewYetkilerTab = FALSE (zaten default)

-- ============================================
-- VERİ KONTROLÜ
-- ============================================
-- Toplam kayıt sayısını kontrol et
SELECT 
    r."Id" as "roleId",
    r."Ad" as "roleName",
    COUNT(*) as "toplam_kayit"
FROM "yetkiler" y
INNER JOIN "Roller" r ON y."roleId" = r."Id"
GROUP BY r."Id", r."Ad"
ORDER BY r."Id";

-- Sayfa yetkilerini kontrol et (button = NULL)
SELECT 
    r."Ad" as "role",
    y."page",
    y."canView",
    y."filterSektor",
    y."filterDirektorluk"
FROM "yetkiler" y
INNER JOIN "Roller" r ON y."roleId" = r."Id"
WHERE y."button" IS NULL
ORDER BY r."Ad", y."page";

-- Buton yetkilerini kontrol et
SELECT 
    r."Ad" as "role",
    y."page",
    y."button",
    y."canView"
FROM "yetkiler" y
INNER JOIN "Roller" r ON y."roleId" = r."Id"
WHERE y."button" IS NOT NULL
ORDER BY r."Ad", y."page", y."button";
