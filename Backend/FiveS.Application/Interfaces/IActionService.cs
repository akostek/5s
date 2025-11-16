using FiveS.Application.DTOs;

namespace FiveS.Application.Interfaces
{
    public interface IActionService
    {
        Task<ActionDto?> GetActionByIdAsync(int id);
        Task<IEnumerable<ActionDto>> GetActionsByAuditIdAsync(int auditId);
        Task<IEnumerable<ActionDto>> GetAllActionsAsync();
        Task<ActionDto> CreateActionAsync(CreateActionDto createActionDto);
        Task<ActionDto> UpdateActionAsync(int id, UpdateActionDto updateActionDto);
        Task<bool> DeleteActionAsync(int id);
    }
}



