using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Application.Services;
using FiveS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace FiveS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuditsController : ControllerBase
    {
        private readonly AuditService _auditService;
        private readonly IPermissionService _permissionService;

        public AuditsController(AuditService auditService, IPermissionService permissionService)
        {
            _auditService = auditService;
            _permissionService = permissionService;
        }

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

                // Check page permission from yetkiler table using RoleId
                var canAccess = await _permissionService.CanAccessPageAsync(roleId, "Denetimler");
                if (!canAccess)
                {
                    return Forbid();
                }

                // Get permission for Denetimler page (for filtering settings)
                var permission = await _permissionService.GetPermissionAsync(roleId, "Denetimler");
                
                int? filterSektorId = null;
                int? filterDirektorlukId = null;

                // Apply row-level security filtering
                if (permission != null)
                {
                    if (permission.FilterSektor)
                    {
                        var userSektorId = User.FindFirst("sector_id")?.Value;
                        if (!string.IsNullOrEmpty(userSektorId) && int.TryParse(userSektorId, out var sektorId))
                        {
                            filterSektorId = sektorId;
                        }
                    }

                    if (permission.FilterDirektorluk)
                    {
                        var userDirektorlukId = User.FindFirst("directorate_id")?.Value;
                        if (!string.IsNullOrEmpty(userDirektorlukId) && int.TryParse(userDirektorlukId, out var direktorlukId))
                        {
                            filterDirektorlukId = direktorlukId;
                        }
                    }
                }

                var audits = await _auditService.GetAllAuditsAsync(filterSektorId, filterDirektorlukId);
                return Ok(audits);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Denetimler yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var audit = await _auditService.GetAuditByIdAsync(id);
                if (audit == null)
                    return NotFound(new { message = "Denetim bulunamadı" });

                return Ok(audit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Denetim yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpPost("plan")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateAuditPlanDto createDto)
        {
            try
            {
                var roleIdClaim = User.FindFirst("role_id")?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out var roleId))
                {
                    return Unauthorized(new { message = "RoleId not found in token" });
                }

                // Check button permission from yetkiler table using RoleId
                var canAccess = await _permissionService.CanAccessButtonAsync(roleId, "Denetimler", "new");
                if (!canAccess)
                {
                    return Forbid();
                }
            }
            catch
            {
                // Continue to original validation
            }

            if (createDto == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .Select(x => new { field = x.Key, errors = x.Value?.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                var audit = await _auditService.CreateAuditPlanAsync(createDto);
                return Ok(audit);
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging
                var innerException = ex.InnerException != null ? ex.InnerException.Message : "None";
                return StatusCode(500, new { 
                    message = "Denetim planı oluşturulurken bir hata oluştu.", 
                    error = ex.Message,
                    innerException = innerException,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("{id}/publish")]
        public async Task<IActionResult> PublishAudit(int id)
        {
            try
        {
                var result = await _auditService.PublishAuditAsync(id);
                if (result)
                {
                    return Ok(new { message = "Denetim başarıyla yayınlandı." });
                }
                return BadRequest(new { message = "Denetim yayınlanamadı." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Denetim yayınlanırken bir hata oluştu.", error = ex.Message });
            }
        }
    }
}

