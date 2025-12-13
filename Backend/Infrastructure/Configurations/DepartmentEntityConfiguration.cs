using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Department with Turkish database table/column names
    /// </summary>
    public class DepartmentEntityConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            // Turkish table name
            builder.ToTable("Bolumler");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Name).IsRequired().HasMaxLength(255).HasColumnName("BolumAdi");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.DirectorateId).HasColumnName("DirektorlukId");
            builder.Property(e => e.Description).HasMaxLength(1000).HasColumnName("Aciklama");
            builder.Property(e => e.IsActive).HasColumnName("Aktif");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Sector)
                .WithMany(s => s.Departments)
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(e => e.Directorate)
                .WithMany(d => d.Departments)
                .HasForeignKey(e => e.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(e => e.Name).IsUnique().HasDatabaseName("IX_Bolumler_BolumAdi");
        }
    }
}


