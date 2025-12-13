using Application.DTOs;
using Application.DTOs.Auth;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto);
        Task<LoginResponseDto> LoginWithKeycloakAsync(string code);
        Task<UserDto> GetCurrentUserAsync(int userId);
        Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
    }
}


