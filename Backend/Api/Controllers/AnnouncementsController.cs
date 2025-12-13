using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnnouncementsController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;
        private readonly IPermissionService _permissionService;
        private readonly ILogger<AnnouncementsController> _logger;

        public AnnouncementsController(
            IAnnouncementService announcementService, 
            IPermissionService permissionService,
            ILogger<AnnouncementsController> logger)
        {
            _announcementService = announcementService;
            _permissionService = permissionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all announcements (public endpoint - can be accessed without full auth for active announcements)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] bool? isActive = null)
        {
            try
            {
                // If not authenticated or requesting inactive announcements, only return active ones
                if (!User.Identity?.IsAuthenticated ?? true)
                {
                    isActive = true;
                }

                var announcements = await _announcementService.GetAllAnnouncementsAsync(isActive);
                return Ok(announcements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get announcement by ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var announcement = await _announcementService.GetAnnouncementByIdAsync(id);
                if (announcement == null)
                {
                    return NotFound(new { message = "Announcement not found" });
                }

                // If not authenticated, only return if active
                if (!User.Identity?.IsAuthenticated ?? true && !announcement.IsActive)
                {
                    return NotFound(new { message = "Announcement not found" });
                }

                return Ok(announcement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Create new announcement - Requires permission
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto createDto)
        {
            try
            {
                // Validate input
                if (createDto == null)
                {
                    return BadRequest(new { message = "Request body is required" });
                }

                if (string.IsNullOrWhiteSpace(createDto.Title))
                {
                    return BadRequest(new { message = "Title is required" });
                }

                if (string.IsNullOrWhiteSpace(createDto.Content))
                {
                    return BadRequest(new { message = "Content is required" });
                }

                // Permission check - temporarily disabled for debugging
                // var roleIdClaim = User.FindFirst("role_id")?.Value;
                // if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                // {
                //     _logger?.LogWarning("RoleId not found in token for announcement creation");
                //     return Unauthorized(new { message = "RoleId not found in token" });
                // }

                // // Check permission for settings page
                // try
                // {
                //     var canAccess = await _permissionService.CanAccessPageAsync(roleId, "Ayarlar");
                //     if (!canAccess)
                //     {
                //         _logger?.LogWarning("User {RoleId} does not have permission to access Ayarlar page", roleId);
                //         return Forbid();
                //     }
                // }
                // catch (Exception permEx)
                // {
                //     _logger?.LogError(permEx, "Error checking permission for role {RoleId}", roleId);
                //     // Continue anyway - might be permission service issue
                // }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                int? createdById = int.TryParse(userIdClaim, out var userId) ? userId : null;

                _logger?.LogInformation("Creating announcement with title: {Title}", createDto.Title);
                var announcement = await _announcementService.CreateAnnouncementAsync(createDto, createdById);
                _logger?.LogInformation("Announcement created successfully with ID: {Id}", announcement.Id);
                
                return CreatedAtAction(nameof(GetById), new { id = announcement.Id }, announcement);
            }
            catch (InvalidOperationException ex)
            {
                _logger?.LogError(ex, "Invalid operation while creating announcement");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating announcement: {Message}, InnerException: {InnerException}", 
                    ex.Message, ex.InnerException?.Message);
                return StatusCode(500, new { 
                    message = "Server error", 
                    error = ex.Message, 
                    details = ex.InnerException?.Message,
                    hint = "Veritabanında 'Duyurular' tablosu oluşturulmuş mu kontrol edin. SQL dosyası: Backend/DUYURULAR_TABLOSU.sql"
                });
            }
        }

        /// <summary>
        /// Update announcement - Requires permission
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAnnouncementDto updateDto)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                // Check permission for settings page
                var canAccess = await _permissionService.CanAccessPageAsync(roleId, "Ayarlar");
                if (!canAccess)
                {
                    return Forbid();
                }

                var announcement = await _announcementService.UpdateAnnouncementAsync(id, updateDto);
                return Ok(announcement);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Announcement not found" });
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
        /// Delete announcement - Requires permission
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

                // Check permission for settings page
                var canAccess = await _permissionService.CanAccessPageAsync(roleId, "Ayarlar");
                if (!canAccess)
                {
                    return Forbid();
                }

                var deleted = await _announcementService.DeleteAnnouncementAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Announcement not found" });
                }

                return Ok(new { message = "Announcement deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }
    }
}


