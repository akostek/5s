using FiveS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FiveS.Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Permission with Turkish database table/column names
    /// </summary>
    public class PermissionEntityConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            // Turkish table name
            builder.ToTable("yetkiler");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.RoleId).IsRequired().HasColumnName("roleId");
            builder.Property(e => e.Page).IsRequired().HasMaxLength(100).HasColumnName("page");
            builder.Property(e => e.Button).HasMaxLength(50).HasColumnName("button");
            builder.Property(e => e.FilterSektor).HasColumnName("filterSektor");
            builder.Property(e => e.FilterDirektorluk).HasColumnName("filterDirektorluk");
            builder.Property(e => e.ShowPlanlananTarih).HasColumnName("showPlanlananTarih");
            builder.Property(e => e.ShowPlanlandiDurum).HasColumnName("showPlanlandiDurum");
            builder.Property(e => e.CanView).HasColumnName("canView");
            builder.Property(e => e.CanViewYetkilerTab).HasColumnName("canViewYetkilerTab");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Foreign key relationship
            builder.HasOne(e => e.Role)
                .WithMany()
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_yetkiler_Roller");

            // Indexes for performance
            builder.HasIndex(e => new { e.RoleId, e.Page, e.Button }).HasDatabaseName("IX_yetkiler_RoleId_Page_Button");
            builder.HasIndex(e => new { e.RoleId, e.Page }).HasDatabaseName("IX_yetkiler_RoleId_Page");
        }
    }
}

