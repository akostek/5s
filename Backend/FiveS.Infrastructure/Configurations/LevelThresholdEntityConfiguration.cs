using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for LevelThreshold with Turkish database table/column names
    /// </summary>
    public class LevelThresholdEntityConfiguration : IEntityTypeConfiguration<LevelThreshold>
    {
        public void Configure(EntityTypeBuilder<LevelThreshold> builder)
        {
            // Turkish table name
            builder.ToTable("SeviyeEsikleri");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.LevelName).IsRequired().HasMaxLength(100).HasColumnName("SeviyeAdi");
            builder.Property(e => e.MinPercentage).HasPrecision(5, 2).HasColumnName("MinimumYuzde");
            builder.Property(e => e.MaxPercentage).HasPrecision(5, 2).HasColumnName("MaksimumYuzde");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Sector)
                .WithMany()
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_SeviyeEsikleri_Sektorler");
        }
    }
}

