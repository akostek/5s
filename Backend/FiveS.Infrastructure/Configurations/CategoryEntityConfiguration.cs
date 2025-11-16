using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Category with Turkish database table/column names
    /// </summary>
    public class CategoryEntityConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            // Turkish table name
            builder.ToTable("Kategoriler");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Name).IsRequired().HasMaxLength(255).HasColumnName("KategoriAdi");
            builder.Property(e => e.Description).HasMaxLength(1000).HasColumnName("Aciklama");
            builder.Property(e => e.OrderIndex).HasColumnName("Sira");
            builder.Property(e => e.IsActive).HasColumnName("Aktif");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");
        }
    }
}

