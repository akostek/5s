using Application.DTOs;
using Domain.Enums;

namespace Application.Interfaces
{
    public interface IActionService
    {
        Task<ActionDto?> GetActionByIdAsync(int id);
        Task<IEnumerable<ActionDto>> GetActionsByAuditIdAsync(int auditId);
        Task<IEnumerable<ActionDto>> GetAllActionsAsync();
        Task<ActionDto> CreateActionAsync(CreateActionDto createActionDto);
        Task<ActionDto> UpdateActionAsync(int id, UpdateActionDto updateActionDto);
        Task<bool> DeleteActionAsync(int id);
        Task<ActionDto> ChangeStatusAsync(int id, ActionStatus newStatus, string? comment, string? userId);
        Task<IEnumerable<object>> GetActionHistoryAsync(int actionId);
    }
}




