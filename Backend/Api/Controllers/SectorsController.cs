using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectorsController : ControllerBase
    {
        private readonly ISectorService _sectorService;
        private readonly ILogger<SectorsController> _logger;

        public SectorsController(ISectorService sectorService, ILogger<SectorsController> logger)
        {
            _sectorService = sectorService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SectorDto>>> GetAll()
        {
            try
            {
                var sectors = await _sectorService.GetAllSectorsAsync();
                return Ok(sectors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sectors");
                return StatusCode(500, new { message = "Sektörler getirilirken bir hata oluştu" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<SectorDto>> GetById(int id)
        {
            try
            {
                var sector = await _sectorService.GetSectorByIdAsync(id);
                if (sector == null)
                    return NotFound(new { message = "Sektör bulunamadı" });

                return Ok(sector);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sector {Id}", id);
                return StatusCode(500, new { message = "Sektör getirilirken bir hata oluştu" });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SectorDto>> Create([FromBody] CreateSectorDto createDto)
        {
            try
            {
                var sector = await _sectorService.CreateSectorAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = sector.Id }, sector);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sector");
                return StatusCode(500, new { message = "Sektör oluşturulurken bir hata oluştu" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SectorDto>> Update(int id, [FromBody] UpdateSectorDto updateDto)
        {
            try
            {
                var sector = await _sectorService.UpdateSectorAsync(id, updateDto);
                return Ok(sector);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Sektör bulunamadı" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sector {Id}", id);
                return StatusCode(500, new { message = "Sektör güncellenirken bir hata oluştu" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _sectorService.DeleteSectorAsync(id);
                if (!result)
                    return NotFound(new { message = "Sektör bulunamadı" });

                return Ok(new { message = "Sektör başarıyla silindi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sector {Id}", id);
                return StatusCode(500, new { message = "Sektör silinirken bir hata oluştu" });
            }
        }
    }
}


