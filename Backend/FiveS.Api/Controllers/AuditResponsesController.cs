using FiveS.Application.DTOs;
using FiveS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace FiveS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuditResponsesController : ControllerBase
    {
        private readonly AuditResponseService _auditResponseService;

        public AuditResponsesController(AuditResponseService auditResponseService)
        {
            _auditResponseService = auditResponseService;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitResponse([FromBody] SubmitAuditResponseDto dto)
        {
            if (dto == null)
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
                await _auditResponseService.SaveAuditResponseAsync(dto);
                return Ok(new { message = "Yanıt başarıyla kaydedildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Yanıt kaydedilirken bir hata oluştu.", 
                    error = ex.Message, 
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("audit/{auditId}")]
        public async Task<IActionResult> GetByAuditId(int auditId)
        {
            try
            {
                var responses = await _auditResponseService.GetAuditResponsesByAuditIdAsync(auditId);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Yanıtlar yüklenirken bir hata oluştu.", 
                    error = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}

