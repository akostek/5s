namespace FiveS.Application.DTOs
{
    public class CreateAuditPlanDto
    {
        public int DepartmentId { get; set; }
        public int? SectorId { get; set; }
        public int? DirectorateId { get; set; }
        public int AuditorId { get; set; }
        public int? AreaId { get; set; }
        public string? AreaSupervisor { get; set; }
        public DateTime AuditDate { get; set; }
        public string? Notes { get; set; }
    }
}

