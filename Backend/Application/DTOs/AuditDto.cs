namespace Application.DTOs
{
    public class AuditDto
    {
        public int Id { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int AuditorId { get; set; }
        public string AuditorName { get; set; } = string.Empty;
        public DateTime AuditDate { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public int MaxPossibleScore { get; set; }
        public string? LevelAchieved { get; set; }
        public int? SectorId { get; set; }
        public string? SectorName { get; set; }
        public int? DirectorateId { get; set; }
        public string? DirectorateName { get; set; }
        public int? AreaId { get; set; }
        public string? AreaName { get; set; }
        public string? AreaSupervisor { get; set; }
        public int TotalActions { get; set; }
        public int OpenActions { get; set; }
        public int ClosedActions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}


