using FiveS.Application.DTOs;
using FiveS.Application.DTOs.Auth;

namespace FiveS.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto);
        Task<UserDto> GetCurrentUserAsync(int userId);
        Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
    }
}

