using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace FiveS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionService _questionService;
        private readonly IAuthService _authService;
        private readonly FiveS.Application.Services.AuditService _auditService;
        private readonly IPermissionService _permissionService;

        public QuestionsController(QuestionService questionService, IAuthService authService, FiveS.Application.Services.AuditService auditService, IPermissionService permissionService)
        {
            _questionService = questionService;
            _authService = authService;
            _auditService = auditService;
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetQuestions([FromQuery] int? categoryId = null, [FromQuery] bool includeInactive = false, [FromQuery] int? auditId = null)
        {
            try
            {
                string? sectorName = null;
                string? directorateName = null;
                string? departmentName = null;
                string? areaName = null;

                // If auditId is provided, use audit's sector, directorate, department, area
                if (auditId.HasValue && auditId.Value > 0)
                {
                    var audit = await _auditService.GetAuditByIdAsync(auditId.Value);
                    if (audit != null)
                    {
                        sectorName = audit.SectorName;
                        directorateName = audit.DirectorateName;
                        departmentName = audit.DepartmentName;
                        areaName = audit.AreaName;
                    }
                }
                else
                {
                    // Otherwise, use current user info from JWT token
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                        ?? "0";

                    if (int.TryParse(userIdClaim, out var userId))
                    {
                        var currentUser = await _authService.GetCurrentUserAsync(userId);
                        if (currentUser != null)
                        {
                            // Admin (roleId = 1) sees all questions - no filtering
                            // Denetci (roleId = 2) sees only questions matching their sector and directorate
                            if (currentUser.RoleId == 1 || currentUser.Role == "Admin")
                            {
                                // Admin: no filtering, show all questions
                                sectorName = null;
                                directorateName = null;
                                departmentName = null;
                                areaName = null;
                            }
                            else if (currentUser.RoleId == 2 || currentUser.Role == "Denetci")
                            {
                                // Denetci: filter by sector and directorate only
                                sectorName = currentUser.Sector;
                                directorateName = currentUser.Directorate;
                                departmentName = null; // Don't filter by department
                                areaName = null; // Don't filter by area
                            }
                            else
                            {
                                // Other roles: filter by all fields
                                sectorName = currentUser.Sector;
                                directorateName = currentUser.Directorate;
                                departmentName = currentUser.DepartmentName;
                                areaName = null; // Users don't have area, only audits do
                            }
                        }
                    }
                }

                var questions = includeInactive 
                    ? await _questionService.GetAllQuestionsAsync(categoryId, sectorName, directorateName, departmentName, areaName)
                    : await _questionService.GetActiveQuestionsAsync(categoryId, sectorName, directorateName, departmentName, areaName);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sorular yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _questionService.GetCategoriesAsync();
                return Ok(new { categories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kategoriler yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("level-thresholds")]
        public async Task<IActionResult> GetLevelThresholds()
        {
            try
            {
                var levelThresholds = await _questionService.GetLevelThresholdsAsync();
                return Ok(new { thresholds = levelThresholds });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Seviye eşikleri yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuestionDto createDto)
        {
            try
            {
                // Debug: Log received data
                var logger = HttpContext.RequestServices.GetRequiredService<ILogger<QuestionsController>>();
                logger.LogInformation("Create question request received. CategoryId: {CategoryId}, Text length: {TextLength}", 
                    createDto?.CategoryId ?? 0, createDto?.Text?.Length ?? 0);

                // Check permission using yetkiler table
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (int.TryParse(userIdClaim, out var userId))
                {
                    var currentUser = await _authService.GetCurrentUserAsync(userId);
                    if (currentUser != null)
                    {
                        var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, "Ayarlar", "new");
                        if (!canAccess)
                        {
                            return Forbid();
                        }
                    }
                }

                if (createDto == null)
                {
                    logger.LogWarning("Create question request: createDto is null");
                    return BadRequest(new { message = "Request body is required" });
                }

                // Manual validation check with detailed logging
                if (createDto.CategoryId <= 0)
                {
                    logger.LogWarning("Create question validation failed: CategoryId is {CategoryId}", createDto.CategoryId);
                    return BadRequest(new { message = "Geçerli bir kategori seçilmelidir.", errors = new[] { new { field = "CategoryId", errors = new[] { "Category ID must be greater than 0" } } } });
                }

                if (string.IsNullOrWhiteSpace(createDto.Text))
                {
                    logger.LogWarning("Create question validation failed: Text is empty");
                    return BadRequest(new { message = "Soru metni zorunludur.", errors = new[] { new { field = "Text", errors = new[] { "Question text is required" } } } });
                }

                if (createDto.Text.Length < 5)
                {
                    logger.LogWarning("Create question validation failed: Text length is {Length}, minimum is 5", createDto.Text.Length);
                    return BadRequest(new { message = "Soru metni en az 5 karakter olmalıdır.", errors = new[] { new { field = "Text", errors = new[] { "Question text must be at least 5 characters" } } } });
                }

                // Log ModelState errors if any
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .Select(x => new { field = x.Key, errors = x.Value?.Errors.Select(e => e.ErrorMessage) })
                        .ToList();
                    logger.LogWarning("Create question ModelState validation failed: {Errors}", System.Text.Json.JsonSerializer.Serialize(errors));
                    return BadRequest(new { message = "Validation failed", errors });
                }

                var question = await _questionService.CreateQuestionAsync(createDto);
                return CreatedAtAction(nameof(GetQuestions), new { id = question.Id }, question);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log inner exception for debugging
                var innerException = ex.InnerException != null ? $"{ex.Message}. Inner: {ex.InnerException.Message}" : ex.Message;
                return StatusCode(500, new { message = "Soru oluşturulurken bir hata oluştu.", error = innerException, stackTrace = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionDto updateDto)
        {
            try
            {
                // Check permission using yetkiler table
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (int.TryParse(userIdClaim, out var userId))
                {
                    var currentUser = await _authService.GetCurrentUserAsync(userId);
                    if (currentUser != null)
                    {
                        var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, "Ayarlar", "edit");
                        if (!canAccess)
                        {
                            return Forbid();
                        }
                    }
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .Select(x => new { field = x.Key, errors = x.Value?.Errors.Select(e => e.ErrorMessage) })
                        .ToList();
                    return BadRequest(new { message = "Validation failed", errors });
                }

                if (updateDto == null)
                {
                    return BadRequest(new { message = "Request body is required" });
                }

                var question = await _questionService.UpdateQuestionAsync(id, updateDto);
                return Ok(question);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Soru güncellenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Check permission using yetkiler table
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                
                if (int.TryParse(userIdClaim, out var userId))
                {
                    var currentUser = await _authService.GetCurrentUserAsync(userId);
                    if (currentUser != null)
                    {
                        var canAccess = await _permissionService.CanAccessButtonAsync(currentUser.RoleId, "Ayarlar", "delete");
                        if (!canAccess)
                        {
                            return Forbid();
                        }
                    }
                }

                var result = await _questionService.DeleteQuestionAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Soru bulunamadı" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Soru silinirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpPost("level-thresholds")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateLevelThreshold([FromBody] CreateLevelThresholdDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var levelThreshold = await _questionService.CreateLevelThresholdAsync(createDto);
                return CreatedAtAction(nameof(GetLevelThresholds), new { id = levelThreshold.Id }, levelThreshold);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Seviye eşiği oluşturulurken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpPut("level-thresholds/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLevelThreshold(int id, [FromBody] UpdateLevelThresholdDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var levelThreshold = await _questionService.UpdateLevelThresholdAsync(id, updateDto);
                return Ok(levelThreshold);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Seviye eşiği güncellenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpDelete("level-thresholds/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLevelThreshold(int id)
        {
            try
            {
                var result = await _questionService.DeleteLevelThresholdAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Seviye eşiği bulunamadı" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Seviye eşiği silinirken bir hata oluştu.", error = ex.Message });
            }
        }
    }
}

