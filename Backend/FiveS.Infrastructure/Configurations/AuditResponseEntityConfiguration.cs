using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for AuditResponse with Turkish database table/column names
    /// </summary>
    public class AuditResponseEntityConfiguration : IEntityTypeConfiguration<AuditResponse>
    {
        public void Configure(EntityTypeBuilder<AuditResponse> builder)
        {
            // Turkish table name
            builder.ToTable("DenetimYanitlari");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.AuditId).HasColumnName("DenetimId");
            builder.Property(e => e.QuestionId).HasColumnName("SoruId");
            builder.Property(e => e.Response).HasConversion<string>().HasMaxLength(50).HasColumnName("Yanit");
            builder.Property(e => e.PointsAwarded).HasColumnName("VerilenPuan");
            builder.Property(e => e.ImageUrls)
                .HasMaxLength(4000)
                .IsRequired(false)
                .HasColumnName("SoruGorselleri");
            builder.Property(e => e.DepartmentId).HasColumnName("BolumId");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.DirectorateId).HasColumnName("DirektorlukId");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Audit)
                .WithMany()
                .HasForeignKey(e => e.AuditId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_DenetimYanitlari_Denetimler");

            builder.HasOne(e => e.Question)
                .WithMany(q => q.AuditResponses)
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DenetimYanitlari_Sorular");

            builder.HasOne(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_DenetimYanitlari_Bolumler");

            builder.HasOne(e => e.Sector)
                .WithMany()
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_DenetimYanitlari_Sektorler");

            builder.HasOne(e => e.Directorate)
                .WithMany()
                .HasForeignKey(e => e.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_DenetimYanitlari_Direktorlukler");
        }
    }
}

