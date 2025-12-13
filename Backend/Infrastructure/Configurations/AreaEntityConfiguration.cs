using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Area with Turkish database table/column names
    /// </summary>
    public class AreaEntityConfiguration : IEntityTypeConfiguration<Area>
    {
        public void Configure(EntityTypeBuilder<Area> builder)
        {
            // Turkish table name
            builder.ToTable("Alanlar");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Name).IsRequired().HasMaxLength(255).HasColumnName("AlanAdi");
            builder.Property(e => e.DepartmentId).HasColumnName("BolumId");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.DirectorateId).HasColumnName("DirektorlukId");
            builder.Property(e => e.Description).HasMaxLength(1000).HasColumnName("Aciklama");
            builder.Property(e => e.Supervisor).HasMaxLength(200).HasColumnName("Sorumlu");
            builder.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500).HasColumnName("GorselUrl");
            builder.Property(e => e.IsActive).HasColumnName("Aktif");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Department)
                .WithMany(d => d.Areas)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Alanlar_Bolumler");

            builder.HasOne(e => e.Sector)
                .WithMany(s => s.Areas)
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(e => e.Directorate)
                .WithMany(d => d.Areas)
                .HasForeignKey(e => e.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}


