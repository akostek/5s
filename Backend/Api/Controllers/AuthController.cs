using Application.DTOs.Auth;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// User login
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            try
            {
                if (loginDto == null)
                {
                    return BadRequest(new { message = "Login request is required" });
                }

                if (string.IsNullOrWhiteSpace(loginDto.Email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                _logger?.LogInformation("Login attempt for email: {Email}", loginDto.Email);
                var response = await _authService.LoginAsync(loginDto);
                _logger?.LogInformation("Login successful for email: {Email}", loginDto.Email);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger?.LogWarning("Login failed for email: {Email}, reason: {Reason}", loginDto?.Email, ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during login for email: {Email}, Error: {Error}, InnerException: {InnerException}", 
                    loginDto?.Email, ex.Message, ex.InnerException?.Message);
                return StatusCode(500, new { 
                    message = "Server error", 
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Keycloak login callback
        /// </summary>
        [HttpPost("keycloak-login")]
        [AllowAnonymous]
        public async Task<IActionResult> KeycloakLogin([FromBody] KeycloakLoginRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Code))
                {
                    return BadRequest(new { message = "Code is required" });
                }

                var response = await _authService.LoginWithKeycloakAsync(request.Code);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Keycloak login failed");
                return StatusCode(500, new { message = "Login failed", error = ex.Message });
            }
        }

        /// <summary>
        /// Get current user information
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            try
            {
                // JWT token uses Sub claim (JwtRegisteredClaimNames.Sub)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                var userId = int.Parse(userIdClaim);
                var user = await _authService.GetCurrentUserAsync(userId);
                return Ok(new { user });
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
        /// Change password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                // JWT token uses Sub claim (JwtRegisteredClaimNames.Sub)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                    ?? "0";
                var userId = int.Parse(userIdClaim);
                await _authService.ChangePasswordAsync(userId, changePasswordDto);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Logout (client-side token removal)
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout successful" });
        }
    }
}


