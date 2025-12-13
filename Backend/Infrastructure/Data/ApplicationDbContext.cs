using Domain.Entities;
using Infrastructure.Configurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    /// <summary>
    /// Application database context with Turkish table names
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets - English names in code, Turkish names in database via Configuration
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<Sector> Sectors { get; set; }
        public DbSet<Directorate> Directorates { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Audit> Audits { get; set; }
        public DbSet<AuditPlan> AuditPlans { get; set; }
        public DbSet<AuditResponse> AuditResponses { get; set; }
        public DbSet<Domain.Entities.Action> Actions { get; set; }
        public DbSet<ActionHistory> ActionHistories { get; set; }
        public DbSet<LevelThreshold> LevelThresholds { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Announcement> Announcements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all configurations from Configuration classes
            modelBuilder.ApplyConfiguration(new UserEntityConfiguration());
            modelBuilder.ApplyConfiguration(new RoleEntityConfiguration());
            modelBuilder.ApplyConfiguration(new DepartmentEntityConfiguration());
            modelBuilder.ApplyConfiguration(new AreaEntityConfiguration());
            modelBuilder.ApplyConfiguration(new SectorEntityConfiguration());
            modelBuilder.ApplyConfiguration(new DirectorateEntityConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryEntityConfiguration());
            modelBuilder.ApplyConfiguration(new QuestionEntityConfiguration());
            modelBuilder.ApplyConfiguration(new AuditEntityConfiguration());
            modelBuilder.ApplyConfiguration(new AuditPlanEntityConfiguration());
            modelBuilder.ApplyConfiguration(new AuditResponseEntityConfiguration());
            modelBuilder.ApplyConfiguration(new ActionEntityConfiguration());
            modelBuilder.ApplyConfiguration(new LevelThresholdEntityConfiguration());
            modelBuilder.ApplyConfiguration(new SettingEntityConfiguration());
            modelBuilder.ApplyConfiguration(new PermissionEntityConfiguration());
            modelBuilder.ApplyConfiguration(new AnnouncementEntityConfiguration());

            // Seed default data
            SeedDefaultData(modelBuilder);
        }

        private void SeedDefaultData(ModelBuilder modelBuilder)
        {
            // Seed 6 S Level thresholds (Başlangıç S + 5S)
            var now = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            
            modelBuilder.Entity<LevelThreshold>().HasData(
                new LevelThreshold 
                { 
                    Id = 1, 
                    LevelName = "Başlangıç S", 
                    MinPercentage = 0, 
                    MaxPercentage = 19.99m, 
                    CreatedAt = now 
                },
                new LevelThreshold 
                { 
                    Id = 2, 
                    LevelName = "1S", 
                    MinPercentage = 20, 
                    MaxPercentage = 39.99m, 
                    CreatedAt = now 
                },
                new LevelThreshold 
                { 
                    Id = 3, 
                    LevelName = "2S", 
                    MinPercentage = 40, 
                    MaxPercentage = 59.99m, 
                    CreatedAt = now 
                },
                new LevelThreshold 
                { 
                    Id = 4, 
                    LevelName = "3S", 
                    MinPercentage = 60, 
                    MaxPercentage = 79.99m, 
                    CreatedAt = now 
                },
                new LevelThreshold 
                { 
                    Id = 5, 
                    LevelName = "4S", 
                    MinPercentage = 80, 
                    MaxPercentage = 94.99m, 
                    CreatedAt = now 
                },
                new LevelThreshold 
                { 
                    Id = 6, 
                    LevelName = "5S", 
                    MinPercentage = 95, 
                    MaxPercentage = 100, 
                    CreatedAt = now 
                }
            );

            // Seed 5S Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "1S - Seiri (Ayıklama)", Description = "Gereksiz malzemelerin ayıklanması", OrderIndex = 1, IsActive = true, CreatedAt = now },
                new Category { Id = 2, Name = "2S - Seiton (Düzenleme)", Description = "Her şeyin yerli yerinde olması", OrderIndex = 2, IsActive = true, CreatedAt = now },
                new Category { Id = 3, Name = "3S - Seiso (Temizlik)", Description = "Çalışma alanının temiz tutulması", OrderIndex = 3, IsActive = true, CreatedAt = now },
                new Category { Id = 4, Name = "4S - Seiketsu (Standartlaştırma)", Description = "Standartların uygulanması", OrderIndex = 4, IsActive = true, CreatedAt = now },
                new Category { Id = 5, Name = "5S - Shitsuke (Disiplin)", Description = "Disiplinli çalışma alışkanlığı", OrderIndex = 5, IsActive = true, CreatedAt = now }
            );

            // Admin user will be seeded in Program.cs startup
        }
    }
}


