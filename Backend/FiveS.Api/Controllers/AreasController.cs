using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FiveS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AreasController : ControllerBase
    {
        private readonly IAreaService _areaService;
        private readonly ILogger<AreasController> _logger;

        public AreasController(
            IAreaService areaService,
            ILogger<AreasController> logger)
        {
            _areaService = areaService;
            _logger = logger;
        }

        /// <summary>
        /// Get all areas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AreaDto>>> GetAll()
        {
            try
            {
                var areas = await _areaService.GetAllAreasAsync();
                return Ok(areas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving areas");
                return StatusCode(500, new { message = "An error occurred while retrieving areas" });
            }
        }

        /// <summary>
        /// Get areas by department ID
        /// </summary>
        [HttpGet("department/{departmentId}")]
        public async Task<ActionResult<IEnumerable<AreaDto>>> GetByDepartment(int departmentId)
        {
            try
            {
                var areas = await _areaService.GetAreasByDepartmentAsync(departmentId);
                return Ok(areas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving areas for department {DepartmentId}", departmentId);
                return StatusCode(500, new { message = "An error occurred while retrieving areas" });
            }
        }

        /// <summary>
        /// Get area by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AreaDto>> GetById(int id)
        {
            try
            {
                var area = await _areaService.GetAreaByIdAsync(id);
                if (area == null)
                    return NotFound(new { message = $"Area with ID {id} not found" });

                return Ok(area);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving area {AreaId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the area" });
            }
        }

        /// <summary>
        /// Create a new area
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<AreaDto>> Create([FromBody] CreateAreaDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var area = await _areaService.CreateAreaAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = area.Id }, area);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating area");
                return StatusCode(500, new { message = "An error occurred while creating the area" });
            }
        }

        /// <summary>
        /// Update an existing area
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<AreaDto>> Update(int id, [FromBody] UpdateAreaDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var area = await _areaService.UpdateAreaAsync(id, updateDto);
                return Ok(area);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating area {AreaId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the area" });
            }
        }

        /// <summary>
        /// Delete an area (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _areaService.DeleteAreaAsync(id);
                if (!result)
                    return NotFound(new { message = $"Area with ID {id} not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting area {AreaId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the area" });
            }
        }
    }
}

