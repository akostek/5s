using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FiveS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DirectoratesController : ControllerBase
    {
        private readonly IDirectorateService _directorateService;
        private readonly ILogger<DirectoratesController> _logger;

        public DirectoratesController(IDirectorateService directorateService, ILogger<DirectoratesController> logger)
        {
            _directorateService = directorateService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DirectorateDto>>> GetAll()
        {
            try
            {
                var directorates = await _directorateService.GetAllDirectoratesAsync();
                return Ok(directorates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting directorates");
                return StatusCode(500, new { message = "Direktörlükler getirilirken bir hata oluştu" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<DirectorateDto>> GetById(int id)
        {
            try
            {
                var directorate = await _directorateService.GetDirectorateByIdAsync(id);
                if (directorate == null)
                    return NotFound(new { message = "Direktörlük bulunamadı" });

                return Ok(directorate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting directorate {Id}", id);
                return StatusCode(500, new { message = "Direktörlük getirilirken bir hata oluştu" });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DirectorateDto>> Create([FromBody] CreateDirectorateDto createDto)
        {
            try
            {
                var directorate = await _directorateService.CreateDirectorateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = directorate.Id }, directorate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating directorate");
                return StatusCode(500, new { message = "Direktörlük oluşturulurken bir hata oluştu" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DirectorateDto>> Update(int id, [FromBody] UpdateDirectorateDto updateDto)
        {
            try
            {
                var directorate = await _directorateService.UpdateDirectorateAsync(id, updateDto);
                return Ok(directorate);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Direktörlük bulunamadı" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating directorate {Id}", id);
                return StatusCode(500, new { message = "Direktörlük güncellenirken bir hata oluştu" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _directorateService.DeleteDirectorateAsync(id);
                if (!result)
                    return NotFound(new { message = "Direktörlük bulunamadı" });

                return Ok(new { message = "Direktörlük başarıyla silindi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting directorate {Id}", id);
                return StatusCode(500, new { message = "Direktörlük silinirken bir hata oluştu" });
            }
        }
    }
}

