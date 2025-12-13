using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces
{
    public interface IActionNotificationService
    {
        Task NotifyActionCreatedAsync(Domain.Entities.Action action);
        Task NotifyStatusChangedAsync(Domain.Entities.Action action, ActionStatus newStatus, string? comment, string? userId);
    }
}
