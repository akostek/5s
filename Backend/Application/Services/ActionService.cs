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
        private readonly IMailService _mailService;

        public ActionService(IUnitOfWork unitOfWork, IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _mailService = mailService;
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

                // Send email notification defined by business rules
                // New Action -> Notify Responsible Person
                await SendEmailNotification(action.Id, "Yeni Aksiyon Atandı",
                    $"Size yeni bir aksiyon atandı.<br>Aksiyon ID: {action.Id}<br>Açıklama: {action.Description}<br>Hedef Tarih: {action.TargetDate}",
                    isStatusChange: false);

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

            // Define email rules based on status change
            string subject = "";
            bool sendToAuditor = false;
            bool sendToResponsible = false;
            bool ccAuditor = false;
            bool ccResponsible = false;

            // Determine status transition
            // Note: We don't have the OLD status here unless we query it before updates, but we can infer intent from the NEW status
            
            if (newStatus == ActionStatus.PendingApproval) // "Denetçiye Gönder" logic
            {
                subject = "Aksiyon Onayınıza Sunuldu";
                sendToAuditor = true;       // To: Denetçi
                ccResponsible = true;       // CC: Alan Sorumlusu
            }
            else if (newStatus == ActionStatus.Open) // "Revizyon İstendi" logic (assuming Open comes from PendingApproval) or generic Open
            {
                // If this is a reopening/revision
                subject = "Aksiyon İçin Revizyon İstendi";
                sendToResponsible = true;   // To: Alan Sorumlusu
                ccAuditor = true;           // CC: Denetçi
            }
            else if (newStatus == ActionStatus.Closed) // "Tamamlandı" logic
            {
                subject = "Aksiyon Tamamlandı/Kapatıldı";
                sendToResponsible = true;   // To: Alan Sorumlusu
                ccAuditor = true;           // CC: Denetçi
            }

            if (!string.IsNullOrEmpty(subject))
            {
                 await SendEmailNotification(id, subject, 
                     $"Aksiyon durumu güncellendi: {newStatus}<br>Aksiyon ID: {id}", 
                     isStatusChange: true,
                     toAuditor: sendToAuditor,
                     toResponsible: sendToResponsible,
                     ccAuditor: ccAuditor,
                     ccResponsible: ccResponsible);
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

        private async Task SendEmailNotification(int actionId, string subject, string body, 
            bool isStatusChange = false,
            bool toAuditor = false, 
            bool toResponsible = false,
            bool ccAuditor = false,
            bool ccResponsible = false)
        {
            try 
            {
                var actionRepo = _unitOfWork.Repository<Domain.Entities.Action>();
                var action = await actionRepo.GetQueryable()
                    .Include(a => a.ResponsiblePerson)
                    .Include(a => a.Audit)
                        .ThenInclude(au => au.Auditor)
                    .FirstOrDefaultAsync(a => a.Id == actionId);

                if (action == null) return;

                var responsibleEmail = action.ResponsiblePerson?.Email;
                var auditorEmail = action.Audit?.Auditor?.Email;

                // Determine recipients
                string to = "";
                string cc = "";

                // Default logic for Create Action (if not status change rules)
                if (!isStatusChange)
                {
                    to = responsibleEmail ?? "";
                    // No default CC for creation unless requested
                }
                else
                {
                    // Apply Status Change Rules
                    var toList = new List<string>();
                    var ccList = new List<string>();

                    if (toAuditor && !string.IsNullOrEmpty(auditorEmail)) toList.Add(auditorEmail);
                    if (toResponsible && !string.IsNullOrEmpty(responsibleEmail)) toList.Add(responsibleEmail);

                    if (ccAuditor && !string.IsNullOrEmpty(auditorEmail)) ccList.Add(auditorEmail);
                    if (ccResponsible && !string.IsNullOrEmpty(responsibleEmail)) ccList.Add(responsibleEmail);

                    // Join lists
                    to = string.Join(";", toList);
                    cc = string.Join(";", ccList);
                }

                if (!string.IsNullOrEmpty(to))
                {
                   await _mailService.SendEmailAsync(to, subject, body, cc);
                }
                else
                {
                   System.Console.WriteLine($"[Warning] No TO email recipients found for action {actionId}. Responsible: {responsibleEmail}, Auditor: {auditorEmail}");
                }
            }
            catch(Exception ex) 
            {
                System.Console.WriteLine($"[Error] Failed to send email: {ex.Message}");
            }
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



