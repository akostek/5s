using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for AuditPlan with Turkish database table/column names
    /// </summary>
    public class AuditPlanEntityConfiguration : IEntityTypeConfiguration<AuditPlan>
    {
        public void Configure(EntityTypeBuilder<AuditPlan> builder)
        {
            // Turkish table name
            builder.ToTable("DenetimPlanlari");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.Name).IsRequired().HasMaxLength(255).HasColumnName("PlanAdi");
            builder.Property(e => e.DepartmentId).HasColumnName("BolumId");
            builder.Property(e => e.AreaId).HasColumnName("AlanId");
            builder.Property(e => e.AuditorId).HasColumnName("DenetciId");
            builder.Property(e => e.CategoryId).HasColumnName("KategoriId");
            builder.Property(e => e.PlannedDate).HasColumnName("PlanlananTarih");
            builder.Property(e => e.Status).IsRequired().HasMaxLength(50).HasColumnName("Durum");
            builder.Property(e => e.Notes).HasMaxLength(2000).HasColumnName("Notlar");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Department)
                .WithMany(d => d.AuditPlans)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired()
                .HasConstraintName("FK_DenetimPlanlari_Bolumler");

            builder.HasOne(e => e.Area)
                .WithMany(a => a.AuditPlans)
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired()
                .HasConstraintName("FK_DenetimPlanlari_Alanlar");

            builder.HasOne(e => e.Auditor)
                .WithMany(u => u.AuditPlans)
                .HasForeignKey(e => e.AuditorId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired()
                .HasConstraintName("FK_DenetimPlanlari_Kullanicilar");

            builder.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DenetimPlanlari_Kategoriler");

            // Many-to-many relationship with Audit
            builder.HasMany(e => e.Audits)
                .WithMany(a => a.AuditPlans)
                .UsingEntity<Dictionary<string, object>>(
                    "AuditAuditPlan",
                    l => l.HasOne<Audit>().WithMany().HasForeignKey("AuditsId").HasConstraintName("FK_AuditAuditPlan_Denetimler_AuditsId"),
                    r => r.HasOne<AuditPlan>().WithMany().HasForeignKey("AuditPlansId").HasConstraintName("FK_AuditAuditPlan_DenetimPlanlari_AuditPlansId"),
                    j => j.HasKey("AuditPlansId", "AuditsId").HasName("PK_AuditAuditPlan"));
        }
    }
}


