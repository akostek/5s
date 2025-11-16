using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Question with Turkish database table/column names
    /// </summary>
    public class QuestionEntityConfiguration : IEntityTypeConfiguration<Question>
    {
        public void Configure(EntityTypeBuilder<Question> builder)
        {
            // Turkish table name
            builder.ToTable("Sorular");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.CategoryId).HasColumnName("KategoriId");
            builder.Property(e => e.Text).IsRequired().HasMaxLength(1000).HasColumnName("SoruMetni");
            builder.Property(e => e.Sector).HasMaxLength(100).HasColumnName("Sektor");
            builder.Property(e => e.Directorate).HasMaxLength(200).HasColumnName("Direktorluk");
            builder.Property(e => e.Department).HasMaxLength(200).HasColumnName("Bolum");
            builder.Property(e => e.Area).HasMaxLength(200).HasColumnName("Alan");
            builder.Property(e => e.OrderIndex).HasColumnName("Sira");
            builder.Property(e => e.PointsHigh).HasColumnName("YuksekPuan");
            builder.Property(e => e.PointsMedium).HasColumnName("OrtaPuan");
            builder.Property(e => e.PointsLow).HasColumnName("DusukPuan");
            builder.Property(e => e.IsActive).HasColumnName("Aktif");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Category)
                .WithMany(c => c.Questions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Sorular_Kategoriler");
        }
    }
}

