namespace Application.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Message { get; set; } = "Login successful";
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }
}


