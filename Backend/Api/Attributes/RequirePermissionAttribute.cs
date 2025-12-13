using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace Api.Attributes
{
    /// <summary>
    /// Attribute to check page access permission
    /// </summary>
    public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _page;
        private readonly string? _button;

        public RequirePermissionAttribute(string page, string? button = null)
        {
            _page = page;
            _button = button;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var roleIdClaim = user.FindFirst("role_id")?.Value;
            if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
            {
                context.Result = new ForbidResult();
                return;
            }

            var permissionService = context.HttpContext.RequestServices.GetRequiredService<IPermissionService>();

            bool hasPermission;
            if (string.IsNullOrEmpty(_button))
            {
                hasPermission = permissionService.CanAccessPageAsync(roleId, _page).GetAwaiter().GetResult();
            }
            else
            {
                hasPermission = permissionService.CanAccessButtonAsync(roleId, _page, _button).GetAwaiter().GetResult();
            }

            if (!hasPermission)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}


