using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Setting with Turkish database table/column names
    /// </summary>
    public class SettingEntityConfiguration : IEntityTypeConfiguration<Setting>
    {
        public void Configure(EntityTypeBuilder<Setting> builder)
        {
            // Turkish table name
            builder.ToTable("Ayarlar");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Key).IsRequired().HasMaxLength(255).HasColumnName("Anahtar");
            builder.Property(e => e.Value).IsRequired().HasColumnName("Deger");
            builder.Property(e => e.Description).HasMaxLength(1000).HasColumnName("Aciklama");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Indexes
            builder.HasIndex(e => e.Key).IsUnique().HasDatabaseName("IX_Ayarlar_Anahtar");
        }
    }
}


