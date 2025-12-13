using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> CanAccessPageAsync(int roleId, string page);
        Task<bool> CanAccessButtonAsync(int roleId, string page, string button);
        Task<PermissionDto?> GetPermissionAsync(int roleId, string page, string? button = null);
        Task<IEnumerable<PermissionDto>> GetPermissionsByRoleIdAsync(int roleId);
        Task<bool> ShouldFilterBySektorAsync(int roleId, string page);
        Task<bool> ShouldFilterByDirektorlukAsync(int roleId, string page);
        Task<bool> ShouldShowPlanlananTarihAsync(int roleId, string page);
        Task<bool> ShouldShowPlanlandiDurumAsync(int roleId, string page);
        Task<bool> CanViewYetkilerTabAsync(int roleId);
        
        // CRUD operations
        Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();
        Task<PermissionDto?> GetPermissionByIdAsync(int id);
        Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto createDto);
        Task<PermissionDto> UpdatePermissionAsync(int id, UpdatePermissionDto updateDto);
        Task DeletePermissionAsync(int id);
    }
}


