using Application.DTOs;
using Application.Interfaces;
using Domain.Interfaces;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class ActionService : IActionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ActionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ActionDto?> GetActionByIdAsync(int id)
        {
            try
            {
                var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
                var action = await actionsRepo.GetQueryable()
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Question)
                        .ThenInclude(q => q.Category)
                    .FirstOrDefaultAsync(a => a.Id == id);

                return action != null ? MapToActionDto(action) : null;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving action by ID: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ActionDto>> GetAllActionsAsync()
        {
            try
            {
                var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
                var actions = await actionsRepo.GetQueryable()
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Question)
                        .ThenInclude(q => q.Category)
                    .Include(a => a.Images)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                return actions.Select(MapToActionDto);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving all actions: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ActionDto>> GetActionsByAuditIdAsync(int auditId)
        {
            try
            {
                var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
                var actions = await actionsRepo.GetQueryable()
                    .Where(a => a.AuditId == auditId)
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Question)
                        .ThenInclude(q => q.Category)
                    .Include(a => a.Images)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                return actions.Select(a => MapToActionDto(a));
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving actions by audit ID: {ex.Message}", ex);
            }
        }

        public async Task<ActionDto> CreateActionAsync(CreateActionDto createActionDto)
        {
            try
            {
                // Validate Question exists
                var question = await _unitOfWork.Repository<Domain.Entities.Question>()
                    .GetByIdAsync(createActionDto.QuestionId);
                if (question == null)
                {
                    throw new Exception($"Question with ID {createActionDto.QuestionId} not found");
                }

                // Get Audit to retrieve DepartmentId, SectorId, DirectorateId
                var audit = await _unitOfWork.Repository<Domain.Entities.Audit>()
                    .GetByIdAsync(createActionDto.AuditId);
                if (audit == null)
                {
                    throw new Exception($"Audit with ID {createActionDto.AuditId} not found");
                }

                // Use Audit's DepartmentId, SectorId, DirectorateId if not provided in DTO
                int? departmentId = createActionDto.DepartmentId ?? audit.DepartmentId;
                int? sectorId = createActionDto.SectorId ?? audit.SectorId;
                int? directorateId = createActionDto.DirectorateId ?? audit.DirectorateId;

                // Parse TargetDate if it's a string (shouldn't happen with proper JSON, but just in case)
                DateTime? targetDate = createActionDto.TargetDate;
                if (targetDate.HasValue && targetDate.Value.Kind == DateTimeKind.Unspecified)
                {
                    targetDate = DateTime.SpecifyKind(targetDate.Value, DateTimeKind.Utc);
                }

                var action = new Domain.Entities.Action
                {
                    AuditId = createActionDto.AuditId,
                    QuestionId = createActionDto.QuestionId,
                    DepartmentId = departmentId,
                    SectorId = sectorId,
                    DirectorateId = directorateId,
                    Description = createActionDto.Description ?? string.Empty,
                    SuggestedActivity = createActionDto.SuggestedActivity ?? string.Empty,
                    PlannedActivity = createActionDto.PlannedActivity ?? string.Empty,
                    TargetDate = targetDate,
                    ResponsiblePerson = createActionDto.ResponsiblePerson ?? string.Empty,
                    Status = createActionDto.Status,
                    Priority = createActionDto.Priority,
                    CreatedAt = DateTime.UtcNow
                };

                var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
                await actionsRepo.AddAsync(action);
                await _unitOfWork.SaveChangesAsync();

                // Save images to AksiyonGorselleri table
                if (createActionDto.ImageUrls != null && createActionDto.ImageUrls.Count > 0)
                {
                    var imageRepo = _unitOfWork.Repository<Domain.Entities.ActionImage>();
                    foreach (var imageUrl in createActionDto.ImageUrls)
                    {
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            var actionImage = new Domain.Entities.ActionImage
                            {
                                ActionId = action.Id,
                                ImagePath = imageUrl,
                                ImageType = "Aksiyon",
                                CreatedAt = DateTime.UtcNow
                            };
                            await imageRepo.AddAsync(actionImage);
                        }
                    }
                    await _unitOfWork.SaveChangesAsync();
                }

                return (await GetActionByIdAsync(action.Id))!;
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                throw new Exception($"Database error while creating action: {innerMessage}", dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating action: {ex.Message}", ex);
            }
        }

        public async Task<ActionDto> UpdateActionAsync(int id, UpdateActionDto updateActionDto)
        {
            var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
            var action = await actionsRepo.GetByIdAsync(id);

            if (action == null)
                throw new KeyNotFoundException($"Action with ID {id} not found");

            if (updateActionDto.ImagePath != null)
                action.ImagePath = updateActionDto.ImagePath;

            if (updateActionDto.Description != null)
                action.Description = updateActionDto.Description;

            if (updateActionDto.SuggestedActivity != null)
                action.SuggestedActivity = updateActionDto.SuggestedActivity;

            if (updateActionDto.PlannedActivity != null)
                action.PlannedActivity = updateActionDto.PlannedActivity;

            if (updateActionDto.TargetDate.HasValue)
                action.TargetDate = updateActionDto.TargetDate;

            if (updateActionDto.ResponsiblePerson != null)
                action.ResponsiblePerson = updateActionDto.ResponsiblePerson;

            if (updateActionDto.Status.HasValue)
                action.Status = updateActionDto.Status.Value;

            if (updateActionDto.Priority != null)
                action.Priority = updateActionDto.Priority;

            action.UpdatedAt = DateTime.UtcNow;

            await actionsRepo.UpdateAsync(action);
            await _unitOfWork.SaveChangesAsync();

            return (await GetActionByIdAsync(action.Id))!;
        }

        public async Task<bool> DeleteActionAsync(int id)
        {
            var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
            var action = await actionsRepo.GetByIdAsync(id);

            if (action == null)
                return false;

            actionsRepo.Delete(action);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<ActionDto> ChangeStatusAsync(int id, ActionStatus newStatus, string? comment, string? imageUrl, string? userId)
        {
            var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
            var action = await actionsRepo.GetByIdAsync(id);

            if (action == null)
                throw new KeyNotFoundException($"Action with ID {id} not found");

            // Strict Workflow Implementation
            // 1. Open -> PendingApproval (Action Owner sends to Auditor)
            // 2. PendingApproval -> Closed (Auditor approves)
            // 3. PendingApproval -> Open (Auditor rejects/requests revision)

            if (action.Status == ActionStatus.Open && newStatus == ActionStatus.PendingApproval)
            {
                // Action Owner check (Frontend usually handles this, but backend should verify if possible)
                // Assuming userId is the current user. Action owner is defined in action.ResponsiblePerson or similar? 
                // In this system, ResponsiblePerson is a string name, not ID. So we might skip strict user ID check for now 
                // or assume access is controlled by Controller/Auth attributes.
                
                // Requirement: Evidence (Image/File) is mandatory
                // Check if imageUrl is provided in this request
                if (string.IsNullOrEmpty(imageUrl))
                {
                    throw new InvalidOperationException("Aksiyonu denetçiye göndermek için kanıt (görsel) yüklenmesi zorunludur.");
                }
                
                // Save evidence image to AksiyonGorselleri table
                var actionImage = new Domain.Entities.ActionImage
                {
                    ActionId = id,
                    ImagePath = imageUrl,
                    ImageType = "Kanit",
                    CreatedAt = DateTime.UtcNow
                };
                var imageRepo = _unitOfWork.Repository<Domain.Entities.ActionImage>();
                await imageRepo.AddAsync(actionImage);
            }
            else if (action.Status == ActionStatus.PendingApproval && newStatus == ActionStatus.Closed)
            {
                // Auditor approves. Only Auditor role should do this.
                // Logic assumes caller has permission.
            }
            else if (action.Status == ActionStatus.PendingApproval && newStatus == ActionStatus.Open)
            {
                // Auditor requests revision.
                // Requirement: Comment is mandatory
                if (string.IsNullOrWhiteSpace(comment))
                {
                    throw new InvalidOperationException("Revizyon için açıklama girilmesi zorunludur.");
                }
            }
            else if (action.Status == newStatus)
            {
                // No change, maybe just adding a note/history? Allowed.
            }
            else
            {
                 // invalid transition
                 // Allow Open -> Closed? (Maybe Admin override? User said "Denetçi tamamlanmadan aksiyonu kapatamaz". 
                 // If current status is Open, it means it's with Owner. Owner cannot close. 
                 // So Open -> Closed is FORBIDDEN.
                 
                 // Allow Open -> InProgress? User didn't mention InProgress. 
                 // "Açıldı -> Aksiyon Sahibinde -> Tamamlandı (PendingApproval)". 
                 // So Open -> PendingApproval is the path. 
                 // We will block other paths for strict compliance.
                 
                 throw new InvalidOperationException($"Geçersiz durum değişikliği: '{action.Status}' durumundan '{newStatus}' durumuna geçiş yapılamaz. Akış: Aksiyon Sahibinde -> Denetçi Kontrolünde -> Kapandı/Revizyon.");
            }

            // Create history record with evidence image
            var history = new Domain.Entities.ActionHistory
            {
                ActionId = id,
                StatusFrom = action.Status,
                StatusTo = newStatus,
                ChangedBy = userId,
                Comment = comment,
                EvidenceImagePath = imageUrl,
                CreatedAt = DateTime.UtcNow
            };

            var historyRepo = _unitOfWork.Repository<Domain.Entities.ActionHistory>();
            await historyRepo.AddAsync(history);

            // Update action status
            action.Status = newStatus;
            action.UpdatedAt = DateTime.UtcNow;
            
            await _unitOfWork.SaveChangesAsync();

            return (await GetActionByIdAsync(id))!;
        }

        public async Task<IEnumerable<object>> GetActionHistoryAsync(int actionId)
        {
            var historyRepo = _unitOfWork.Repository<Domain.Entities.ActionHistory>();
            var history = await historyRepo.GetQueryable()
                .Where(h => h.ActionId == actionId)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return history.Select(h => new
            {
                h.Id,
                h.ActionId,
                h.StatusFrom,
                h.StatusTo,
                h.ChangedBy,
                h.Comment,
                h.CreatedAt
            });
        }

        private ActionDto MapToActionDto(Domain.Entities.Action action)
        {
            return new ActionDto
            {
                Id = action.Id,
                AuditId = action.AuditId,
                QuestionId = action.QuestionId,
                DepartmentId = action.DepartmentId,
                DepartmentName = action.Department?.Name,
                SectorId = action.SectorId,
                SectorName = action.Sector?.Name,
                DirectorateId = action.DirectorateId,
                DirectorateName = action.Directorate?.Name,
                ImagePath = action.ImagePath,
                EvidenceImagePath = action.EvidenceImagePath,
                Description = action.Description,
                SuggestedActivity = action.SuggestedActivity,
                PlannedActivity = action.PlannedActivity,
                TargetDate = action.TargetDate,
                ResponsiblePerson = action.ResponsiblePerson,
                Status = action.Status,
                StatusText = action.Status switch
                {
                    ActionStatus.Open => "Aksiyon Sahibinde",
                    ActionStatus.InProgress => "Devam Ediyor",
                    ActionStatus.PendingApproval => "Denetçi Kontrolünde",
                    ActionStatus.Closed => "Kapandı",
                    _ => action.Status.ToString()
                },
                Priority = action.Priority,
                QuestionText = action.Question != null ? action.Question.Text : null,
                CategoryName = action.Question != null && action.Question.Category != null ? action.Question.Category.Name : null,
                CreatedAt = action.CreatedAt,
                UpdatedAt = action.UpdatedAt,
                Images = action.Images?.Select(img => new ActionImageDto
                {
                    Id = img.Id,
                    ActionId = img.ActionId,
                    ImagePath = img.ImagePath,
                    ImageType = img.ImageType,
                    CreatedAt = img.CreatedAt
                }).ToList()
            };
        }
    }
}



