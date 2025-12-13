using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Application.Services
{
    public class AuditService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMailService _mailService;

        public AuditService(IUnitOfWork unitOfWork, IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _mailService = mailService;
        }

        public async Task<AuditDto?> GetAuditByIdAsync(int id)
        {
            try
            {
                var audit = await _unitOfWork.Repository<Audit>()
                    .GetQueryable()
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Area)
                    .Include(a => a.Auditor)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (audit == null)
                    return null;

                // Bu denetim için aksiyonları getir
                var auditActions = await _unitOfWork.Repository<Domain.Entities.Action>()
                    .GetQueryable()
                    .Where(act => act.AuditId == id)
                    .ToListAsync();

                var totalActions = auditActions.Count;
                var openActions = auditActions.Count(act => act.Status == ActionStatus.Open);
                var closedActions = auditActions.Count(act => act.Status == ActionStatus.Closed);

                return new AuditDto
                {
                    Id = audit.Id,
                    DepartmentId = audit.DepartmentId,
                    DepartmentName = audit.Department?.Name ?? string.Empty,
                    SectorId = audit.SectorId,
                    SectorName = audit.Sector?.Name,
                    DirectorateId = audit.DirectorateId,
                    DirectorateName = audit.Directorate?.Name,
                    AuditorId = audit.AuditorId,
                    AuditorName = audit.Auditor?.Name ?? string.Empty,
                    AuditDate = audit.AuditDate,
                    Notes = audit.Notes,
                    Status = audit.Status,
                    TotalScore = audit.TotalScore,
                    MaxPossibleScore = audit.MaxPossibleScore,
                    LevelAchieved = audit.LevelAchieved,
                    AreaId = audit.AreaId,
                    AreaName = audit.Area?.Name,
                    AreaSupervisor = audit.AreaSupervisor,
                    TotalActions = totalActions,
                    OpenActions = openActions,
                    ClosedActions = closedActions,
                    CreatedAt = audit.CreatedAt,
                    UpdatedAt = audit.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting audit by ID: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<AuditDto>> GetAllAuditsAsync(int? filterSektorId = null, int? filterDirektorlukId = null)
        {
            try
            {
                IQueryable<Audit> query = _unitOfWork.Repository<Audit>()
                    .GetQueryable()
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Area)
                    .Include(a => a.Auditor);

                // Satır bazlı güvenlik filtrelemesi
                if (filterSektorId.HasValue && filterSektorId.Value > 0)
                {
                    query = query.Where(a => a.SectorId == filterSektorId.Value);
                }

                if (filterDirektorlukId.HasValue && filterDirektorlukId.Value > 0)
                {
                    query = query.Where(a => a.DirectorateId == filterDirektorlukId.Value);
                }

                var audits = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                // Tüm denetimler için tüm aksiyonları tek sorguda getir
                var allAuditIds = audits.Select(a => a.Id).ToList();
                var allActions = await _unitOfWork.Repository<Domain.Entities.Action>()
                    .GetQueryable()
                    .Where(act => act.AuditId.HasValue && allAuditIds.Contains(act.AuditId.Value))
                .ToListAsync();

                return audits.Select(a =>
                {
                    // Bu denetim için aksiyonları getir
                    var auditActions = allActions.Where(act => act.AuditId == a.Id).ToList();
                    var totalActions = auditActions.Count;
                    var openActions = auditActions.Count(act => act.Status == ActionStatus.Open);
                    var closedActions = auditActions.Count(act => act.Status == ActionStatus.Closed);

                    return new AuditDto
                    {
                        Id = a.Id,
                        DepartmentId = a.DepartmentId,
                        DepartmentName = a.Department?.Name ?? string.Empty,
                        SectorId = a.SectorId,
                        SectorName = a.Sector?.Name,
                        DirectorateId = a.DirectorateId,
                        DirectorateName = a.Directorate?.Name,
                        AuditorId = a.AuditorId,
                        AuditorName = a.Auditor?.Name ?? string.Empty,
                        AuditDate = a.AuditDate,
                        Notes = a.Notes,
                        Status = a.Status,
                        TotalScore = a.TotalScore,
                        MaxPossibleScore = a.MaxPossibleScore,
                        LevelAchieved = a.LevelAchieved,
                        AreaId = a.AreaId,
                        AreaName = a.Area?.Name,
                        AreaSupervisor = a.AreaSupervisor,
                        TotalActions = totalActions,
                        OpenActions = openActions,
                        ClosedActions = closedActions,
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt
                    };
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving audits: {ex.Message}", ex);
            }
        }

        public async Task<bool> PublishAuditAsync(int auditId)
        {
            try
            {
                var audit = await _unitOfWork.Repository<Audit>()
                    .GetByIdAsync(auditId);
                if (audit == null)
                {
                    throw new Exception($"Audit with ID {auditId} not found");
                }

                // Tüm soruların cevaplanıp cevaplanmadığını kontrol et
                var responses = await _unitOfWork.Repository<AuditResponse>()
                    .GetQueryable()
                    .Where(r => r.AuditId == auditId)
                    .CountAsync();

                var totalQuestions = await _unitOfWork.Repository<Question>()
                    .GetQueryable()
                    .Where(q => q.IsActive)
                    .CountAsync();

                if (responses < totalQuestions)
                {
                    throw new Exception("Tüm sorular cevaplanmadan denetim yayınlanamaz.");
                }

                audit.Status = "denetlendi";
                audit.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Repository<Audit>().UpdateAsync(audit);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error publishing audit: {ex.Message}", ex);
            }
        }

        public async Task<AuditDto> CreateAuditPlanAsync(CreateAuditPlanDto createDto)
        {
            Audit audit;
            
            try
            {
                // Departmanın varlığını doğrula
                var department = await _unitOfWork.Repository<Department>()
                    .GetByIdAsync(createDto.DepartmentId);
                if (department == null)
        {
                    throw new Exception($"Department with ID {createDto.DepartmentId} not found");
                }

                // Denetçinin (Kullanıcı) varlığını doğrula
                var auditor = await _unitOfWork.Repository<User>()
                    .GetByIdAsync(createDto.AuditorId);
                if (auditor == null)
                {
                    throw new Exception($"User with ID {createDto.AuditorId} not found");
                }

                audit = new Audit
            {
                    DepartmentId = createDto.DepartmentId,
                    SectorId = createDto.SectorId,
                    DirectorateId = createDto.DirectorateId,
                    AuditorId = createDto.AuditorId,
                    AreaId = createDto.AreaId,
                    AreaSupervisor = createDto.AreaSupervisor,
                    AuditDate = createDto.AuditDate,
                    Notes = createDto.Notes,
                    Status = "planlandı",
                TotalScore = 0,
                MaxPossibleScore = 0,
                CreatedAt = DateTime.UtcNow
            };

                await _unitOfWork.Repository<Audit>().AddAsync(audit);
                await _unitOfWork.SaveChangesAsync();

                // E-posta bildirimi gönder
                if (auditor != null && !string.IsNullOrEmpty(auditor.Email))
                {
                    await _mailService.SendEmailAsync(
                        auditor.Email, 
                        "Yeni 5S Denetimi Planlandı", 
                        $"Merhaba {auditor.Name},<br><br>{department?.Name} departmanı için {createDto.AuditDate:dd.MM.yyyy} tarihinde yeni bir 5S denetimi planlanmıştır.<br><br>İyi çalışmalar."
                    );
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating audit plan: {ex.Message}", ex);
            }

            // Reload with navigation properties
            var created = await _unitOfWork.Repository<Audit>()
                .GetQueryable()
                .Include(a => a.Department)
                .Include(a => a.Sector)
                .Include(a => a.Directorate)
                .Include(a => a.Area)
                .Include(a => a.Auditor)
                .FirstAsync(a => a.Id == audit.Id);

            return new AuditDto
            {
                Id = created.Id,
                DepartmentId = created.DepartmentId,
                DepartmentName = created.Department?.Name ?? string.Empty,
                SectorId = created.SectorId,
                SectorName = created.Sector?.Name,
                DirectorateId = created.DirectorateId,
                DirectorateName = created.Directorate?.Name,
                AuditorId = created.AuditorId,
                AuditorName = created.Auditor?.Name ?? string.Empty,
                AuditDate = created.AuditDate,
                Notes = created.Notes,
                Status = created.Status,
                    TotalScore = created.TotalScore,
                    MaxPossibleScore = created.MaxPossibleScore,
                    LevelAchieved = created.LevelAchieved,
                    AreaId = created.AreaId,
                    AreaName = created.Area?.Name,
                    AreaSupervisor = created.AreaSupervisor,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };
        }
    }
}



