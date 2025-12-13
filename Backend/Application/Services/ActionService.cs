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
        private readonly IActionNotificationService _notificationService;

        public ActionService(IUnitOfWork unitOfWork, IActionNotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
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
                    .Include(a => a.Images)
                    .Include(a => a.ResponsiblePerson) // Include User
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
                    .Include(a => a.ResponsiblePerson) // Include User
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
                    .Include(a => a.ResponsiblePerson) // Include User
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

                // Get Audit
                var audit = await _unitOfWork.Repository<Domain.Entities.Audit>()
                    .GetByIdAsync(createActionDto.AuditId);
                if (audit == null)
                {
                    throw new Exception($"Audit with ID {createActionDto.AuditId} not found");
                }

                // Use Audit's details if not provided
                int? departmentId = createActionDto.DepartmentId ?? audit.DepartmentId;
                int? sectorId = createActionDto.SectorId ?? audit.SectorId;
                int? directorateId = createActionDto.DirectorateId ?? audit.DirectorateId;

                DateTime? targetDate = createActionDto.TargetDate;
                if (targetDate.HasValue && targetDate.Value.Kind == DateTimeKind.Unspecified)
                {
                    targetDate = DateTime.SpecifyKind(targetDate.Value, DateTimeKind.Utc);
                }

                // Create Action entity
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
                    ResponsiblePersonId = createActionDto.ResponsiblePersonId, // Use ID
                    Status = createActionDto.Status,
                    Priority = createActionDto.Priority,
                    CreatedAt = DateTime.UtcNow,
                    Images = new List<Domain.Entities.ActionImage>()
                };

                if (createActionDto.ImageUrls != null && createActionDto.ImageUrls.Count > 0)
                {
                    foreach (var imageUrl in createActionDto.ImageUrls)
                    {
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            action.Images.Add(new Domain.Entities.ActionImage
                            {
                                ImagePath = imageUrl,
                                ImageType = "Aksiyon",
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                }

                var actionsRepo = _unitOfWork.Repository<Domain.Entities.Action>();
                await actionsRepo.AddAsync(action);
                await _unitOfWork.SaveChangesAsync();

                // Load navigation properties for notification
                var fullAction = await actionsRepo.GetQueryable()
                    .Include(a => a.ResponsiblePerson)
                    .FirstOrDefaultAsync(a => a.Id == action.Id);

                if (fullAction != null)
                {
                    await _notificationService.NotifyActionCreatedAsync(fullAction);
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

            if (updateActionDto.Description != null)
                action.Description = updateActionDto.Description;

            if (updateActionDto.SuggestedActivity != null)
                action.SuggestedActivity = updateActionDto.SuggestedActivity;

            if (updateActionDto.PlannedActivity != null)
                action.PlannedActivity = updateActionDto.PlannedActivity;

            if (updateActionDto.TargetDate.HasValue)
                action.TargetDate = updateActionDto.TargetDate;

            if (updateActionDto.ResponsiblePersonId != null) // Update ID
                action.ResponsiblePersonId = updateActionDto.ResponsiblePersonId;

            if (updateActionDto.Status.HasValue)
                action.Status = updateActionDto.Status.Value;

            if (updateActionDto.Priority != null)
                action.Priority = updateActionDto.Priority;

            action.UpdatedAt = DateTime.UtcNow;

            await actionsRepo.UpdateAsync(action);
            
            // Update images if provided
            if (updateActionDto.ImageUrls != null)
            {
                var imageRepo = _unitOfWork.Repository<Domain.Entities.ActionImage>();
                var existingImages = await imageRepo.GetQueryable()
                    .Where(img => img.ActionId == id && img.ImageType == "Aksiyon")
                    .ToListAsync();

                foreach (var img in existingImages)
                {
                    imageRepo.Delete(img);
                }
                
                foreach (var url in updateActionDto.ImageUrls)
                {
                     if (!string.IsNullOrEmpty(url))
                     {
                         await imageRepo.AddAsync(new Domain.Entities.ActionImage
                         {
                             ActionId = id,
                             ImagePath = url,
                             ImageType = "Aksiyon",
                             CreatedAt = DateTime.UtcNow
                         });
                     }
                }
            }

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

            if (action.Status == ActionStatus.Open && newStatus == ActionStatus.PendingApproval)
            {
                if (string.IsNullOrEmpty(imageUrl))
                {
                    throw new InvalidOperationException("Aksiyonu denetçiye göndermek için kanıt (görsel) yüklenmesi zorunludur.");
                }
                
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
            else if (action.Status == ActionStatus.PendingApproval && newStatus == ActionStatus.Open)
            {
                if (string.IsNullOrWhiteSpace(comment))
                {
                    throw new InvalidOperationException("Revizyon için açıklama girilmesi zorunludur.");
                }
            }
            else if (action.Status == newStatus)
            {
                // No change, allowed.
            }
            else if (newStatus == ActionStatus.Closed)
            {
                 // Allow Closing
            }
            else
            {
                 // Check validity strictness if needed, currently relaxed to allow Closed from other states if admin/auditor calls it
            }

            // Parse userId to int
            int performedById = 0;
            int.TryParse(userId, out performedById);

            // Create history record
            var history = new Domain.Entities.ActionHistory
            {
                ActionId = id,
                StatusFrom = action.Status,
                StatusTo = newStatus,
                PerformedById = performedById, // Use ID
                Comment = comment,
                EvidenceImagePath = imageUrl,
                CreatedAt = DateTime.UtcNow
            };

            var historyRepo = _unitOfWork.Repository<Domain.Entities.ActionHistory>();
            await historyRepo.AddAsync(history);

            action.Status = newStatus;
            action.UpdatedAt = DateTime.UtcNow;
            
            await _unitOfWork.SaveChangesAsync();

            // Notify via NotificationService
            // Load necessary navigation properties
            var fullAction = await actionsRepo.GetQueryable()
                .Include(a => a.ResponsiblePerson)
                .Include(a => a.Audit)
                    .ThenInclude(au => au!.Auditor)
                .FirstOrDefaultAsync(a => a.Id == id);
            
            if (fullAction != null)
            {
                await _notificationService.NotifyStatusChangedAsync(fullAction, newStatus, comment, userId);
            }

            return (await GetActionByIdAsync(id))!;
        }

        public async Task<IEnumerable<object>> GetActionHistoryAsync(int actionId)
        {
            var historyRepo = _unitOfWork.Repository<Domain.Entities.ActionHistory>();
            var history = await historyRepo.GetQueryable()
                .Where(h => h.ActionId == actionId)
                .Include(h => h.PerformedByUser) // Include User to get Name
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return history.Select(h => new
            {
                h.Id,
                h.ActionId,
                h.StatusFrom,
                h.StatusTo,
                ChangedBy = h.PerformedByUser?.Name ?? h.PerformedById.ToString(), // Return Name
                h.Comment,
                h.CreatedAt,
                h.EvidenceImagePath
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
                Description = action.Description,
                SuggestedActivity = action.SuggestedActivity,
                PlannedActivity = action.PlannedActivity,
                TargetDate = action.TargetDate,
                ResponsiblePersonId = action.ResponsiblePersonId, // Map ID
                ResponsiblePersonName = action.ResponsiblePerson?.Name, // Map Name
                ResponsiblePerson = action.ResponsiblePerson?.Name, // Backward compat for Frontend display
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





