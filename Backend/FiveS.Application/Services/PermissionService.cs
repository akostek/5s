using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Domain.Entities;
using FiveS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FiveS.Application.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PermissionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> CanAccessPageAsync(int roleId, string page)
        {
            var permission = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .FirstOrDefaultAsync(p => p.RoleId == roleId && p.Page == page && p.Button == null);

            return permission?.CanView ?? false;
        }

        public async Task<bool> CanAccessButtonAsync(int roleId, string page, string button)
        {
            var permission = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .FirstOrDefaultAsync(p => p.RoleId == roleId && p.Page == page && p.Button == button);

            return permission?.CanView ?? false;
        }

        public async Task<PermissionDto?> GetPermissionAsync(int roleId, string page, string? button = null)
        {
            var permission = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .Include(p => p.Role)
                .FirstOrDefaultAsync(p => p.RoleId == roleId && p.Page == page && p.Button == button);

            if (permission == null)
                return null;

            return new PermissionDto
            {
                Id = permission.Id,
                Role = permission.Role?.Ad ?? "",
                RoleId = permission.RoleId,
                Page = permission.Page,
                Button = permission.Button,
                FilterSektor = permission.FilterSektor,
                FilterDirektorluk = permission.FilterDirektorluk,
                ShowPlanlananTarih = permission.ShowPlanlananTarih,
                ShowPlanlandiDurum = permission.ShowPlanlandiDurum,
                CanView = permission.CanView,
                CanViewYetkilerTab = permission.CanViewYetkilerTab
            };
        }

        public async Task<IEnumerable<PermissionDto>> GetPermissionsByRoleIdAsync(int roleId)
        {
            var permissions = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .Include(p => p.Role)
                .Where(p => p.RoleId == roleId)
                .ToListAsync();

            return permissions.Select(p => new PermissionDto
            {
                Id = p.Id,
                Role = p.Role?.Ad ?? "",
                RoleId = p.RoleId,
                Page = p.Page,
                Button = p.Button,
                FilterSektor = p.FilterSektor,
                FilterDirektorluk = p.FilterDirektorluk,
                ShowPlanlananTarih = p.ShowPlanlananTarih,
                ShowPlanlandiDurum = p.ShowPlanlandiDurum,
                CanView = p.CanView,
                CanViewYetkilerTab = p.CanViewYetkilerTab
            });
        }

        public async Task<bool> ShouldFilterBySektorAsync(int roleId, string page)
        {
            var permission = await GetPermissionAsync(roleId, page);
            return permission?.FilterSektor ?? false;
        }

        public async Task<bool> ShouldFilterByDirektorlukAsync(int roleId, string page)
        {
            var permission = await GetPermissionAsync(roleId, page);
            return permission?.FilterDirektorluk ?? false;
        }

        public async Task<bool> ShouldShowPlanlananTarihAsync(int roleId, string page)
        {
            var permission = await GetPermissionAsync(roleId, page);
            return permission?.ShowPlanlananTarih ?? false;
        }

        public async Task<bool> ShouldShowPlanlandiDurumAsync(int roleId, string page)
        {
            var permission = await GetPermissionAsync(roleId, page);
            return permission?.ShowPlanlandiDurum ?? false;
        }

        public async Task<bool> CanViewYetkilerTabAsync(int roleId)
        {
            var permission = await GetPermissionAsync(roleId, "Ayarlar");
            return permission?.CanViewYetkilerTab ?? false;
        }

        // CRUD operations
        public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
        {
            var permissions = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .Include(p => p.Role)
                .OrderBy(p => p.RoleId)
                .ThenBy(p => p.Page)
                .ThenBy(p => p.Button ?? "")
                .ToListAsync();

            return permissions.Select(MapToDto);
        }

        public async Task<PermissionDto?> GetPermissionByIdAsync(int id)
        {
            var permission = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .Include(p => p.Role)
                .FirstOrDefaultAsync(p => p.Id == id);

            return permission != null ? MapToDto(permission) : null;
        }

        public async Task<PermissionDto> CreatePermissionAsync(CreatePermissionDto createDto)
        {
            // Check if permission already exists
            var existing = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .FirstOrDefaultAsync(p => 
                    p.RoleId == createDto.RoleId && 
                    p.Page == createDto.Page && 
                    p.Button == createDto.Button);

            if (existing != null)
            {
                throw new InvalidOperationException("Permission already exists for this role, page, and button combination.");
            }

            var permission = new Permission
            {
                RoleId = createDto.RoleId,
                Page = createDto.Page,
                Button = createDto.Button,
                FilterSektor = createDto.FilterSektor,
                FilterDirektorluk = createDto.FilterDirektorluk,
                ShowPlanlananTarih = createDto.ShowPlanlananTarih,
                ShowPlanlandiDurum = createDto.ShowPlanlandiDurum,
                CanView = createDto.CanView,
                CanViewYetkilerTab = createDto.CanViewYetkilerTab,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Permission>().AddAsync(permission);
            await _unitOfWork.SaveChangesAsync();

            // Reload with Role navigation
            var created = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .Include(p => p.Role)
                .FirstOrDefaultAsync(p => p.Id == permission.Id);

            return MapToDto(created!);
        }

        public async Task<PermissionDto> UpdatePermissionAsync(int id, UpdatePermissionDto updateDto)
        {
            var permission = await _unitOfWork.Repository<Permission>()
                .GetByIdAsync(id);

            if (permission == null)
            {
                throw new KeyNotFoundException("Permission not found");
            }

            // Check if updating would create a duplicate
            if (updateDto.RoleId.HasValue || updateDto.Page != null || updateDto.Button != null)
            {
                var newRoleId = updateDto.RoleId ?? permission.RoleId;
                var newPage = updateDto.Page ?? permission.Page;
                var newButton = updateDto.Button ?? permission.Button;

                var existing = await _unitOfWork.Repository<Permission>()
                    .GetQueryable()
                    .FirstOrDefaultAsync(p => 
                        p.Id != id &&
                        p.RoleId == newRoleId && 
                        p.Page == newPage && 
                        p.Button == newButton);

                if (existing != null)
                {
                    throw new InvalidOperationException("Permission already exists for this role, page, and button combination.");
                }
            }

            if (updateDto.RoleId.HasValue)
                permission.RoleId = updateDto.RoleId.Value;
            if (updateDto.Page != null)
                permission.Page = updateDto.Page;
            if (updateDto.Button != null)
                permission.Button = updateDto.Button;
            if (updateDto.FilterSektor.HasValue)
                permission.FilterSektor = updateDto.FilterSektor.Value;
            if (updateDto.FilterDirektorluk.HasValue)
                permission.FilterDirektorluk = updateDto.FilterDirektorluk.Value;
            if (updateDto.ShowPlanlananTarih.HasValue)
                permission.ShowPlanlananTarih = updateDto.ShowPlanlananTarih.Value;
            if (updateDto.ShowPlanlandiDurum.HasValue)
                permission.ShowPlanlandiDurum = updateDto.ShowPlanlandiDurum.Value;
            if (updateDto.CanView.HasValue)
                permission.CanView = updateDto.CanView.Value;
            if (updateDto.CanViewYetkilerTab.HasValue)
                permission.CanViewYetkilerTab = updateDto.CanViewYetkilerTab.Value;

            permission.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<Permission>().UpdateAsync(permission);
            await _unitOfWork.SaveChangesAsync();

            // Reload with Role navigation
            var updated = await _unitOfWork.Repository<Permission>()
                .GetQueryable()
                .Include(p => p.Role)
                .FirstOrDefaultAsync(p => p.Id == id);

            return MapToDto(updated!);
        }

        public async Task DeletePermissionAsync(int id)
        {
            var permission = await _unitOfWork.Repository<Permission>()
                .GetByIdAsync(id);

            if (permission == null)
            {
                throw new KeyNotFoundException("Permission not found");
            }

            _unitOfWork.Repository<Permission>().Delete(permission);
            await _unitOfWork.SaveChangesAsync();
        }

        private PermissionDto MapToDto(Permission permission)
        {
            return new PermissionDto
            {
                Id = permission.Id,
                Role = permission.Role?.Ad ?? "",
                RoleId = permission.RoleId,
                Page = permission.Page,
                Button = permission.Button,
                FilterSektor = permission.FilterSektor,
                FilterDirektorluk = permission.FilterDirektorluk,
                ShowPlanlananTarih = permission.ShowPlanlananTarih,
                ShowPlanlandiDurum = permission.ShowPlanlandiDurum,
                CanView = permission.CanView,
                CanViewYetkilerTab = permission.CanViewYetkilerTab
            };
        }
    }
}

