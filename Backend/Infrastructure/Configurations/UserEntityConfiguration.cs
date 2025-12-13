using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for User with Turkish database table/column names
    /// </summary>
    public class UserEntityConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Turkish table name
            builder.ToTable("Kullanicilar");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Email).IsRequired().HasMaxLength(255).HasColumnName("Email");
            builder.Property(e => e.PasswordHash).IsRequired().HasColumnName("Sifre");
            builder.Property(e => e.Name).IsRequired().HasMaxLength(255).HasColumnName("AdSoyad");
            builder.Property(e => e.Username).HasMaxLength(100).HasColumnName("KullaniciAdi");
            builder.Property(e => e.Sicil).HasMaxLength(50).HasColumnName("SicilNo");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.DirectorateId).HasColumnName("DirektorlukId");
            builder.Property(e => e.RoleId).IsRequired().HasColumnName("RolId");
            builder.Property(e => e.DepartmentId).HasColumnName("BolumId");
            builder.Property(e => e.IsActive).HasColumnName("Aktif");
            builder.Property(e => e.LastLogin)
                .HasColumnName("SonGiris")
                .HasConversion(
                    v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null);
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt)
                .HasColumnName("GuncellemeTarihi")
                .HasConversion(
                    v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null);

            // Indexes
            builder.HasIndex(e => e.Email).IsUnique().HasDatabaseName("IX_Kullanicilar_Email");
            builder.HasIndex(e => e.Username).HasDatabaseName("IX_Kullanicilar_KullaniciAdi");

            // Relationships
            builder.HasOne(e => e.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Kullanicilar_Bolumler");

            builder.HasOne(e => e.Sector)
                .WithMany()
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Kullanicilar_Sektorler");

            builder.HasOne(e => e.Directorate)
                .WithMany()
                .HasForeignKey(e => e.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Kullanicilar_Direktorlukler");

            builder.HasOne(e => e.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Kullanicilar_Roller");
        }
    }
}


