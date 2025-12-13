using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;
        private readonly IAuthService _authService;

        public UsersController(IUserService userService, IPermissionService permissionService, IAuthService authService)
        {
            _userService = userService;
            _permissionService = permissionService;
            _authService = authService;
        }

        /// <summary>
        /// Get all users - permission checked via yetkiler table
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                // Check permission from yetkiler table using RoleId
                var canAccess = await _permissionService.CanAccessPageAsync(roleId, "Kullanicilar");
                if (!canAccess)
                {
                    return Forbid();
                }

                // Get current user info for filtering
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                int? filterSectorId = null;
                int? filterDirectorateId = null;
                
                // If roleId=2 (Denetci), filter by user's sector and directorate
                if (roleId == 2)
                {
                    if (int.TryParse(userIdClaim, out var userId))
                    {
                        var currentUser = await _authService.GetCurrentUserAsync(userId);
                        if (currentUser != null)
                        {
                            filterSectorId = currentUser.SectorId;
                            filterDirectorateId = currentUser.DirectorateId;
                        }
                    }
                }

                var users = await _userService.GetAllUsersAsync(filterSectorId, filterDirectorateId);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get user by ID - permission checked via yetkiler table
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                var canAccess = await _permissionService.CanAccessPageAsync(roleId, "Kullanicilar");
                if (!canAccess)
                {
                    return Forbid();
                }

                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                return Ok(new { user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Create new user - permission checked via yetkiler table
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(roleId, "Kullanicilar", "new");
                if (!canAccess)
                {
                    return Forbid();
                }

                var user = await _userService.CreateUserAsync(createUserDto);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, new { message = "User created successfully", user });
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
        /// Update user - permission checked via yetkiler table
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(roleId, "Kullanicilar", "edit");
                if (!canAccess)
                {
                    return Forbid();
                }

                var user = await _userService.UpdateUserAsync(id, updateUserDto);
                return Ok(new { message = "User updated successfully", user });
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
        /// Delete user - permission checked via yetkiler table
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(roleId, "Kullanicilar", "delete");
                if (!canAccess)
                {
                    return Forbid();
                }

                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (id == currentUserId)
                {
                    return BadRequest(new { message = "Cannot delete your own account" });
                }

                await _userService.DeleteUserAsync(id);
                return Ok(new { message = "User deleted successfully" });
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

        /// <summary>
        /// Reset user password - permission checked via yetkiler table
        /// </summary>
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                var canAccess = await _permissionService.CanAccessButtonAsync(roleId, "Kullanicilar", "edit");
                if (!canAccess)
                {
                    return Forbid();
                }

                await _userService.ResetPasswordAsync(id, resetPasswordDto.NewPassword);
                return Ok(new { message = "Password reset successfully" });
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

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}


