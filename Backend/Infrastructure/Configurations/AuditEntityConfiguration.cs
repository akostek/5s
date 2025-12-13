using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class AuditEntityConfiguration : IEntityTypeConfiguration<Audit>
    {
        public void Configure(EntityTypeBuilder<Audit> builder)
        {
            builder.ToTable("Denetimler");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.DepartmentId).HasColumnName("BolumId");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.DirectorateId).HasColumnName("DirektorlukId");
            builder.Property(e => e.AuditorId).HasColumnName("DenetciId");
            builder.Property(e => e.AreaId).HasColumnName("AlanId");
            builder.Property(e => e.AreaSupervisor).HasMaxLength(200).HasColumnName("AlanSorumlusu");
            builder.Property(e => e.AuditDate).HasColumnName("DenetimTarihi");
            builder.Property(e => e.Notes).HasMaxLength(2000).HasColumnName("Notlar");
            builder.Property(e => e.Status).HasMaxLength(50).HasColumnName("Durum");
            builder.Property(e => e.TotalScore).HasColumnName("ToplamPuan");
            builder.Property(e => e.MaxPossibleScore).HasColumnName("MaksimumPuan");
            builder.Property(e => e.LevelAchieved).HasMaxLength(50).HasColumnName("UlasilanSeviye");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            builder.HasOne(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Denetimler_Bolumler");

            builder.HasOne(e => e.Sector)
                .WithMany()
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Denetimler_Sektorler");

            builder.HasOne(e => e.Directorate)
                .WithMany()
                .HasForeignKey(e => e.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Denetimler_Direktorlukler");

            builder.HasOne(e => e.Area)
                .WithMany()
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Denetimler_Alanlar");

            builder.HasOne(e => e.Auditor)
                .WithMany()
                .HasForeignKey(e => e.AuditorId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Denetimler_Kullanicilar");
        }
    }
}


