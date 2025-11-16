using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    public class SectorEntityConfiguration : IEntityTypeConfiguration<Sector>
    {
        public void Configure(EntityTypeBuilder<Sector> builder)
        {
            builder.ToTable("Sektorler");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

            builder.Property(s => s.Name)
                .HasColumnName("SektorAdi")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.Description)
                .HasColumnName("Aciklama")
                .HasMaxLength(500);

            builder.Property(s => s.IsActive)
                .HasColumnName("Aktif")
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(s => s.CreatedAt)
                .HasColumnName("OlusturmaTarihi")
                .IsRequired();

            builder.Property(s => s.UpdatedAt)
                .HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasMany(s => s.Departments)
                .WithOne(d => d.Sector)
                .HasForeignKey(d => d.SectorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(s => s.Areas)
                .WithOne(a => a.Sector)
                .HasForeignKey(a => a.SectorId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

