using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Announcement with Turkish database table/column names
    /// </summary>
    public class AnnouncementEntityConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {
            // Turkish table name
            builder.ToTable("Duyurular");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id)
                .HasColumnName("Id");

            builder.Property(e => e.Title)
                .HasMaxLength(255)
                .IsRequired()
                .HasColumnName("Baslik");

            builder.Property(e => e.Content)
                .HasColumnType("text")
                .IsRequired()
                .HasColumnName("Icerik");

            builder.Property(e => e.AnnouncementDate)
                .IsRequired()
                .HasColumnName("DuyuruTarihi")
                .HasConversion(
                    v => v.ToUniversalTime(),
                    v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            builder.Property(e => e.IsActive)
                .IsRequired()
                .HasColumnName("Aktif")
                .HasDefaultValue(true);

            builder.Property(e => e.CreatedById)
                .HasColumnName("OlusturanKullaniciId");

            builder.Property(e => e.CreatedAt)
                .HasColumnName("OlusturmaTarihi");

            builder.Property(e => e.UpdatedAt)
                .HasColumnName("GuncellemeTarihi");

            // Indexes
            builder.HasIndex(e => e.AnnouncementDate)
                .HasDatabaseName("IX_Duyurular_DuyuruTarihi");

            builder.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_Duyurular_Aktif");
        }
    }
}


