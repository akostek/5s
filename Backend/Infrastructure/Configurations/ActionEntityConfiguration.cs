using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    /// <summary>
    /// Entity configuration for Action with Turkish database table/column names
    /// </summary>
    public class ActionEntityConfiguration : IEntityTypeConfiguration<Domain.Entities.Action>
    {
        public void Configure(EntityTypeBuilder<Domain.Entities.Action> builder)
        {
            // Turkish table name
            builder.ToTable("Aksiyonlar");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties with Turkish column names
            builder.Property(e => e.Id).HasColumnName("Id");
            builder.Property(e => e.AuditId).HasColumnName("DenetimId");
            builder.Property(e => e.QuestionId).HasColumnName("SoruId");
            builder.Property(e => e.DepartmentId).HasColumnName("BolumId");
            builder.Property(e => e.SectorId).HasColumnName("SektorId");
            builder.Property(e => e.DirectorateId).HasColumnName("DirektorlukId");
            builder.Property(e => e.Description).HasMaxLength(1000).HasColumnName("Aciklama");
            builder.Property(e => e.SuggestedActivity).HasMaxLength(1000).HasColumnName("OnerilenFaaliyet");
            builder.Property(e => e.PlannedActivity).HasMaxLength(1000).HasColumnName("PlanlananFaaliyet");
            builder.Property(e => e.TargetDate).HasColumnName("HedefTarih");
            builder.Property(e => e.ResponsiblePersonId).HasColumnName("alansorumlusu_id");
            builder.Property(e => e.Status)
                .HasConversion<string>()
                .HasConversion(
                    v => v == Domain.Enums.ActionStatus.Open ? "Aksiyon Sahibinde" :
                         v == Domain.Enums.ActionStatus.InProgress ? "Devam Ediyor" :
                         v == Domain.Enums.ActionStatus.PendingApproval ? "Denetçi Kontrolünde" :
                         v == Domain.Enums.ActionStatus.Closed ? "Kapandı" : v.ToString(),
                    v => v == "Aksiyon Sahibinde" ? Domain.Enums.ActionStatus.Open :
                         v == "Açık" ? Domain.Enums.ActionStatus.Open : // Backward compatibility
                         v == "Devam Ediyor" ? Domain.Enums.ActionStatus.InProgress :
                         v == "Denetçi Kontrolünde" ? Domain.Enums.ActionStatus.PendingApproval :
                         v == "Kapandı" ? Domain.Enums.ActionStatus.Closed :
                         v == "Tamamlandı" ? Domain.Enums.ActionStatus.Closed : // Backward compatibility
                         Enum.Parse<Domain.Enums.ActionStatus>(v))
                .HasMaxLength(50)
                .HasColumnName("Durum");
            builder.Property(e => e.Priority).HasMaxLength(50).HasColumnName("Oncelik");
            builder.Property(e => e.CreatedAt).HasColumnName("OlusturmaTarihi");
            builder.Property(e => e.UpdatedAt).HasColumnName("GuncellemeTarihi");

            // Relationships
            builder.HasOne(e => e.ResponsiblePerson)
                .WithMany()
                .HasForeignKey(e => e.ResponsiblePersonId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Aksiyonlar_Kullanicilar");

            builder.HasOne(e => e.Audit)
                .WithMany()
                .HasForeignKey(e => e.AuditId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Aksiyonlar_Denetimler");

            builder.HasOne(e => e.Question)
                .WithMany(q => q.Actions)
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Aksiyonlar_Sorular");

            builder.HasOne(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Aksiyonlar_Bolumler");

            builder.HasOne(e => e.Sector)
                .WithMany()
                .HasForeignKey(e => e.SectorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Aksiyonlar_Sektorler");

            builder.HasOne(e => e.Directorate)
                .WithMany()
                .HasForeignKey(e => e.DirectorateId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Aksiyonlar_Direktorlukler");
        }
    }
}




