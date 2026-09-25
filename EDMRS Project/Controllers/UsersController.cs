using EDMRS_Project.Data;
using EDMRS_Project.Models.DTOs;
using EDMRS_Project.Models.DTOs.User;
using EDMRS_Project.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EDMRS_Project.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Admin", "Manager", "Viewer"
    };

    private readonly EdmrsDbContext _db;
    private readonly IAuthService _auth;

    public UsersController(EdmrsDbContext db, IAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    [HttpGet]
    [Authorize(Roles = "Admin, Viewer")]
    public async Task<ActionResult<IEnumerable<UserReadDto>>> GetUsers()
    {
        var users = await _db.Users
            .OrderBy(u => u.FullName)
            .Select(u => new UserReadDto
            {
                Id = u.ID,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedDate = u.CreatedDate
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddUser([FromBody] RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is needed." });
        }

        var email = request.Email.Trim();
        var role = string.IsNullOrWhiteSpace(request.Role) ? "Viewer" : request.Role.Trim();
        if (!AllowedRoles.Contains(role))
        {
            return BadRequest(new { message = "Role must be Admin, Manager, or Viewer." });
        }

        var ok = await _auth.RegisterUserAsync(request.FullName, email, request.Password, role);
        if (!ok)
        {
            return BadRequest(new { message = "A user with this email already exists." });
        }

        return Ok(new { message = "User added." });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.ID == id);
        if (user == null)
        {
            return NotFound(new { message = "User was not found." });
        }

        var role = dto.Role.Trim();
        if (!AllowedRoles.Contains(role))
        {
            return BadRequest(new { message = "Role must be Admin, Manager, or Viewer." });
        }

        var email = dto.Email.Trim();
        if (await _db.Users.AnyAsync(u => u.ID != id && u.Email.ToLower() == email.ToLower()))
        {
            return BadRequest(new { message = "Another user already uses this email." });
        }

        user.FullName = dto.FullName.Trim();
        user.Email = email;
        user.Role = AllowedRoles.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.ID == id);
        if (user == null)
        {
            return NotFound(new { message = "User was not found." });
        }

        var admins = await _db.Users.CountAsync(u => u.Role == "Admin" && u.IsActive);
        if (string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase) && user.IsActive && admins <= 1)
        {
            return BadRequest(new { message = "The last admin cannot be deleted." });
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetActive(int id, [FromBody] SetActiveDto body)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.ID == id);
        if (user == null)
        {
            return NotFound(new { message = "User was not found." });
        }

        user.IsActive = body.IsActive;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class SetActiveDto
{
    public bool IsActive { get; set; }
}
