using EDMRS_Project.Models.DTOs;

namespace EDMRS_Project.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> AuthenticateAsync(LoginRequestDto request);
        Task<bool> RegisterUserAsync(string username, string email, string password, string role);
    }
}
