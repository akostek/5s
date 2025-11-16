using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FiveS.Application.Services
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
                var actionsRepo = _unitOfWork.Repository<FiveS.Domain.Entities.Action>();
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
                var actionsRepo = _unitOfWork.Repository<FiveS.Domain.Entities.Action>();
                var actions = await actionsRepo.GetQueryable()
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Question)
                        .ThenInclude(q => q.Category)
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
                var actionsRepo = _unitOfWork.Repository<FiveS.Domain.Entities.Action>();
                var actions = await actionsRepo.GetQueryable()
                    .Where(a => a.AuditId == auditId)
                    .Include(a => a.Department)
                    .Include(a => a.Sector)
                    .Include(a => a.Directorate)
                    .Include(a => a.Question)
                        .ThenInclude(q => q.Category)
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
                var question = await _unitOfWork.Repository<FiveS.Domain.Entities.Question>()
                    .GetByIdAsync(createActionDto.QuestionId);
                if (question == null)
                {
                    throw new Exception($"Question with ID {createActionDto.QuestionId} not found");
                }

                // Get Audit to retrieve DepartmentId, SectorId, DirectorateId
                var audit = await _unitOfWork.Repository<FiveS.Domain.Entities.Audit>()
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

                var action = new FiveS.Domain.Entities.Action
                {
                    AuditId = createActionDto.AuditId,
                    QuestionId = createActionDto.QuestionId,
                    DepartmentId = departmentId,
                    SectorId = sectorId,
                    DirectorateId = directorateId,
                    ImagePath = createActionDto.ImagePath,
                    Description = createActionDto.Description ?? string.Empty,
                    SuggestedActivity = createActionDto.SuggestedActivity ?? string.Empty,
                    PlannedActivity = createActionDto.PlannedActivity ?? string.Empty,
                    TargetDate = targetDate,
                    ResponsiblePerson = createActionDto.ResponsiblePerson ?? string.Empty,
                    Status = createActionDto.Status,
                    Priority = createActionDto.Priority,
                    CreatedAt = DateTime.UtcNow
                };

                var actionsRepo = _unitOfWork.Repository<FiveS.Domain.Entities.Action>();
                await actionsRepo.AddAsync(action);
                await _unitOfWork.SaveChangesAsync();

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
            var actionsRepo = _unitOfWork.Repository<FiveS.Domain.Entities.Action>();
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
            var actionsRepo = _unitOfWork.Repository<FiveS.Domain.Entities.Action>();
            var action = await actionsRepo.GetByIdAsync(id);

            if (action == null)
                return false;

            actionsRepo.Delete(action);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private ActionDto MapToActionDto(FiveS.Domain.Entities.Action action)
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
                Description = action.Description,
                SuggestedActivity = action.SuggestedActivity,
                PlannedActivity = action.PlannedActivity,
                TargetDate = action.TargetDate,
                ResponsiblePerson = action.ResponsiblePerson,
                Status = action.Status,
                Priority = action.Priority,
                QuestionText = action.Question != null ? action.Question.Text : null,
                CategoryName = action.Question != null && action.Question.Category != null ? action.Question.Category.Name : null,
                CreatedAt = action.CreatedAt,
                UpdatedAt = action.UpdatedAt
            };
        }
    }
}

