using System.ComponentModel.DataAnnotations;

namespace EDMRS_Project.Models.DTOs.User;

public class UserUpdateDto
{
    [Required]
    [MinLength(2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Viewer";
}
