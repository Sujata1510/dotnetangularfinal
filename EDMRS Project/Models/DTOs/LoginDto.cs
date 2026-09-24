using System.ComponentModel.DataAnnotations;

namespace EDMRS_Project.Models.DTOs
{
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; }
    }
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set;  } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
