using FiveS.Application.Interfaces;
using System.Security.Claims;

namespace FiveS.Api.Helpers
{
    public static class PermissionHelper
    {
        public static async Task<IQueryable<T>> ApplyRowLevelSecurity<T>(
            IQueryable<T> query,
            ClaimsPrincipal user,
            IPermissionService permissionService,
            string page,
            Func<T, int?> getSektorId,
            Func<T, int?> getDirektorlukId)
        {
            var roleIdClaim = user.FindFirst("role_id")?.Value;
            if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                return query;

            var permission = await permissionService.GetPermissionAsync(roleId, page);
            if (permission == null)
                return query;

            // Admin için filtreleme yok
            if (!permission.FilterSektor && !permission.FilterDirektorluk)
                return query;

            // Kullanıcının sektör ve direktörlük bilgilerini al
            var userSektorId = int.Parse(user.FindFirst("sector_id")?.Value ?? "0");
            var userDirektorlukId = int.Parse(user.FindFirst("directorate_id")?.Value ?? "0");

            // Sektör filtresi
            if (permission.FilterSektor && userSektorId > 0)
            {
                query = query.Where(item => getSektorId(item) == userSektorId);
            }

            // Direktörlük filtresi
            if (permission.FilterDirektorluk && userDirektorlukId > 0)
            {
                query = query.Where(item => getDirektorlukId(item) == userDirektorlukId);
            }

            return query;
        }
    }
}

