using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for ActionHistory with Turkish database table/column names
    /// </summary>
    public class ActionHistoryEntityConfiguration : IEntityTypeConfiguration<ActionHistory>
    {
        public void Configure(EntityTypeBuilder<ActionHistory> builder)
        {
            // Turkish table name
            builder.ToTable("AksiyonGecmisi");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.ActionId).HasColumnName("AksiyonId");
            builder.Property(e => e.StatusFrom)
                .HasConversion<string>()
                .HasConversion(
                    v => v == Domain.Enums.ActionStatus.Open ? "Açık" :
                         v == Domain.Enums.ActionStatus.InProgress ? "Devam Ediyor" :
                         v == Domain.Enums.ActionStatus.PendingApproval ? "Denetçi Onayı Bekliyor" :
                         v == Domain.Enums.ActionStatus.Closed ? "Tamamlandı" : v.ToString(),
                    v => v == "Açık" ? Domain.Enums.ActionStatus.Open :
                         v == "Devam Ediyor" ? Domain.Enums.ActionStatus.InProgress :
                         v == "Denetçi Onayı Bekliyor" ? Domain.Enums.ActionStatus.PendingApproval :
                         v == "Tamamlandı" ? Domain.Enums.ActionStatus.Closed : Enum.Parse<Domain.Enums.ActionStatus>(v))
                .HasMaxLength(50)
                .HasColumnName("EskiDurum");

            builder.Property(e => e.StatusTo)
                .HasConversion<string>()
                 .HasConversion(
                    v => v == Domain.Enums.ActionStatus.Open ? "Açık" :
                         v == Domain.Enums.ActionStatus.InProgress ? "Devam Ediyor" :
                         v == Domain.Enums.ActionStatus.PendingApproval ? "Denetçi Onayı Bekliyor" :
                         v == Domain.Enums.ActionStatus.Closed ? "Tamamlandı" : v.ToString(),
                    v => v == "Açık" ? Domain.Enums.ActionStatus.Open :
                         v == "Devam Ediyor" ? Domain.Enums.ActionStatus.InProgress :
                         v == "Denetçi Onayı Bekliyor" ? Domain.Enums.ActionStatus.PendingApproval :
                         v == "Tamamlandı" ? Domain.Enums.ActionStatus.Closed : Enum.Parse<Domain.Enums.ActionStatus>(v))
                .HasMaxLength(50)
                .HasColumnName("YeniDurum");
            builder.Property(e => e.ChangedBy).HasMaxLength(200).HasColumnName("Degistiren");
            builder.Property(e => e.Comment).HasMaxLength(2000).HasColumnName("Aciklama");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.Action)
                .WithMany(a => a.History)
                .HasForeignKey(e => e.ActionId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_AksiyonGecmisi_Aksiyonlar");
        }
    }
}
