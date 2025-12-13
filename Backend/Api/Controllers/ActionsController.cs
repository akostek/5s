using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Linq;
using System.Security.Claims;
using Domain.Enums;
namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ActionsController : ControllerBase
    {
        private readonly IActionService _actionService;

        public ActionsController(IActionService actionService)
        {
            _actionService = actionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var actions = await _actionService.GetAllActionsAsync();
                return Ok(actions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Aksiyonlar yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("audit/{auditId}")]
        public async Task<IActionResult> GetByAuditId(int auditId)
        {
            try
            {
                var actions = await _actionService.GetActionsByAuditIdAsync(auditId);
                return Ok(actions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Aksiyonlar yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var action = await _actionService.GetActionByIdAsync(id);
            if (action == null)
                return NotFound(new { message = "Aksiyon bulunamadı" });

            return Ok(action);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateActionDto createActionDto)
        {
            if (createActionDto == null)
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
                var action = await _actionService.CreateActionAsync(createActionDto);
                return CreatedAtAction(nameof(GetById), new { id = action.Id }, action);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Aksiyon kaydedilirken bir hata oluştu.", 
                    error = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateActionDto updateActionDto)
        {
            try
            {
                var action = await _actionService.UpdateActionAsync(id, updateActionDto);
                return Ok(action);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _actionService.DeleteActionAsync(id);
            if (!result)
                return NotFound(new { message = "Aksiyon bulunamadı" });

            return NoContent();
        }
        [HttpPost("{id}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var action = await _actionService.ChangeStatusAsync(id, dto.Status, dto.Comment, userId);
                return Ok(action);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Durum güncellenirken bir hata oluştu.", error = ex.Message });
            }
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetHistory(int id)
        {
            try
            {
                var history = await _actionService.GetActionHistoryAsync(id);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tarihçe yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }
    }
}




