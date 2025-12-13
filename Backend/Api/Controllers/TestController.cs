using Application.Services;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IMailService _mailService;

        public TestController(IMailService mailService)
        {
            _mailService = mailService;
        }

        [HttpPost("email")]
        public async Task<IActionResult> TestEmail()
        {
            try
            {
                await _mailService.SendEmailAsync("test@example.com", "Test Email", "Bu bir test emailidir.");
                return Ok(new { message = "Test email sent successfully." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to send test email: {ex.Message}" });
            }
        }
    }
}
