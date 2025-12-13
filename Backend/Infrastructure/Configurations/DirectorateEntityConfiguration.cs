using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class DirectorateEntityConfiguration : IEntityTypeConfiguration<Directorate>
    {
        public void Configure(EntityTypeBuilder<Directorate> builder)
        {
            builder.ToTable("Direktorlukler");

            builder.HasKey(d => d.Id);

            builder.Property(d => d.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

            builder.Property(d => d.Name)
                .HasColumnName("DirektorlukAdi")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(d => d.SectorId)
                .HasColumnName("SektorId");

            builder.Property(d => d.Description)
                .HasColumnName("Aciklama")
                .HasMaxLength(500);

            builder.Property(d => d.IsActive)
                .HasColumnName("Aktif")
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(d => d.CreatedAt)
                .HasColumnName("OlusturmaTarihi")
                .IsRequired();

            builder.Property(d => d.UpdatedAt)
                .HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(d => d.Sector)
                .WithMany()
                .HasForeignKey(d => d.SectorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Direktorlukler_Sektorler");

            builder.HasMany(d => d.Departments)
                .WithOne(dep => dep.Directorate)
                .HasForeignKey(dep => dep.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(d => d.Areas)
                .WithOne(a => a.Directorate)
                .HasForeignKey(a => a.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}


