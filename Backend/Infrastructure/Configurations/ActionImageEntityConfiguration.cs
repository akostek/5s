using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for ActionImage with Turkish database table/column names
    /// </summary>
    public class ActionImageEntityConfiguration : IEntityTypeConfiguration<ActionImage>
    {
        public void Configure(EntityTypeBuilder<ActionImage> builder)
        {
            // Turkish table name
            builder.ToTable("AksiyonGorselleri");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.ActionId).HasColumnName("AksiyonId");
            builder.Property(e => e.ImagePath).HasMaxLength(500).HasColumnName("GorselYolu").IsRequired();
            builder.Property(e => e.ImageType).HasMaxLength(50).HasColumnName("GorselTipi").IsRequired();
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationship
            builder.HasOne(e => e.Action)
                .WithMany(a => a.Images)
                .HasForeignKey(e => e.ActionId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_AksiyonGorselleri_Aksiyonlar");
        }
    }
}
