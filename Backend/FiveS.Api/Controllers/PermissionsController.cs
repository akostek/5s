using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Domain.Entities;
using FiveS.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FiveS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly IAuthService _authService;
        private readonly IUnitOfWork _unitOfWork;

        public PermissionsController(IPermissionService permissionService, IAuthService authService, IUnitOfWork unitOfWork)
        {
            _permissionService = permissionService;
            _authService = authService;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Get all permissions for current user's role
        /// Uses database RoleId instead of JWT token to get latest role changes
        /// </summary>
        [HttpGet("my-permissions")]
        public async Task<IActionResult> GetMyPermissions()
        {
            try
            {
                // Get user ID from token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Get current user from database to get latest RoleId
                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Use RoleId from database (not from JWT token) to get latest permissions
                var permissions = await _permissionService.GetPermissionsByRoleIdAsync(currentUser.RoleId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if user can access a page
        /// Uses database RoleId instead of JWT token to get latest role changes
        /// </summary>
        [HttpGet("can-access-page/{page}")]
        public async Task<IActionResult> CanAccessPage(string page)
        {
            try
            {
                // Get user ID from token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Get current user from database to get latest RoleId
                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Use RoleId from database (not from JWT token)
                var canAccess = await _permissionService.CanAccessPageAsync(currentUser.RoleId, page);
                return Ok(new { canAccess });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if user can access a button
        /// Uses database RoleId instead of JWT token to get latest role changes
        /// </summary>
        [HttpGet("can-access-button/{page}/{button}")]
        public async Task<IActionResult> CanAccessButton(string page, string button)
        {
            try
            {
                // Get user ID from token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Get current user from database to get latest RoleId
                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Use RoleId from database (not from JWT token)
                var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, page, button);
                return Ok(new { canAccess });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get permission details for a page
        /// Uses database RoleId instead of JWT token to get latest role changes
        /// </summary>
        [HttpGet("page/{page}")]
        public async Task<IActionResult> GetPagePermission(string page)
        {
            try
            {
                // Get user ID from token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                // Get current user from database to get latest RoleId
                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Use RoleId from database (not from JWT token)
                var permission = await _permissionService.GetPermissionAsync(currentUser.RoleId, page);
                if (permission == null)
                {
                    return NotFound(new { message = "Permission not found" });
                }

                return Ok(permission);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Debug endpoint - Get current user's role from token
        /// </summary>
        [HttpGet("debug/my-role")]
        public IActionResult GetMyRole()
        {
            try
            {
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
                
                return Ok(new { 
                    role, 
                    allClaims,
                    message = "Bu rol değeri 'yetkiler' tablosundaki 'role' kolonu ile eşleşmeli"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        // ============================================
        // CRUD Operations (Admin only)
        // ============================================

        /// <summary>
        /// Check if user can view Yetkiler tab in Ayarlar page
        /// </summary>
        [HttpGet("can-view-yetkiler-tab")]
        public async Task<IActionResult> CanViewYetkilerTab()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var canView = await _permissionService.CanViewYetkilerTabAsync(currentUser.RoleId);
                return Ok(new { canView });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all roles (for dropdown in permission form)
        /// </summary>
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                // Get roles from database
                var roles = await _unitOfWork.Repository<Role>()
                    .GetQueryable()
                    .Where(r => r.IsActive)
                    .OrderBy(r => r.Ad)
                    .Select(r => new { id = r.Id, name = r.Ad })
                    .ToListAsync();

                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all permissions (Admin only)
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                // Check if user is Admin
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Check if user can access Ayarlar page (Admin only)
                var canAccess = await _permissionService.CanAccessPageAsync(currentUser.RoleId, "Ayarlar");
                if (!canAccess)
                {
                    return Forbid();
                }

                var permissions = await _permissionService.GetAllPermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get permission by ID (Admin only)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var canAccess = await _permissionService.CanAccessPageAsync(currentUser.RoleId, "Ayarlar");
                if (!canAccess)
                {
                    return Forbid();
                }

                var permission = await _permissionService.GetPermissionByIdAsync(id);
                if (permission == null)
                {
                    return NotFound(new { message = "Permission not found" });
                }

                return Ok(permission);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Create new permission (Admin only)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePermissionDto createDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, "Ayarlar", "new");
                if (!canAccess)
                {
                    return Forbid();
                }

                var permission = await _permissionService.CreatePermissionAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = permission.Id }, permission);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Update permission (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePermissionDto updateDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, "Ayarlar", "edit");
                if (!canAccess)
                {
                    return Forbid();
                }

                var permission = await _permissionService.UpdatePermissionAsync(id, updateDto);
                return Ok(permission);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete permission (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var currentUser = await _authService.GetCurrentUserAsync(userId);
                if (currentUser == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, "Ayarlar", "delete");
                if (!canAccess)
                {
                    return Forbid();
                }

                await _permissionService.DeletePermissionAsync(id);
                return Ok(new { message = "Permission deleted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }
    }
}

