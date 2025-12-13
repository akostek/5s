using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Role with Turkish database table/column names
    /// </summary>
    public class RoleEntityConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            // Turkish table name
            builder.ToTable("Roller");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Ad).IsRequired().HasMaxLength(255).HasColumnName("Ad");
            builder.Property(e => e.Aciklama).HasMaxLength(1000).HasColumnName("Aciklama");
            builder.Property(e => e.IsActive).HasColumnName("Aktif");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Indexes
            builder.HasIndex(e => e.Ad).IsUnique().HasDatabaseName("IX_Roller_Ad");
        }
    }
}


