using BCrypt.Net;
using EDMRS_Project.Data;
using EDMRS_Project.Models.DTOs;
using EDMRS_Project.Models.Entities;

using EDMRS_Project.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EDMRS.Api.Services;

public class AuthService : IAuthService
{
    private readonly EdmrsDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(EdmrsDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        // ADD THIS LINE: Embeds the user's role into the token
        new Claim(ClaimTypes.Role, user.Role) // e.g. "Admin" or "DataManager"
    };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public async Task<bool> RegisterUserAsync(string username, string email, string password, string role)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return false;

        var user = new User
        {
            FullName = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<LoginResponseDto?> AuthenticateAsync(LoginRequestDto request)
    {
        Console.WriteLine("Login Step 2 Querying database for user");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            Console.WriteLine("Login step 2.1 User not found");

            return null;
        }
        Console.WriteLine("Login step2.2 User Found");

        //verify password
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!isPasswordValid)
        {
            Console.WriteLine("login2.3 Password verification failed");
            return null;
        }
        Console.WriteLine("Login step 2.4 Password valid");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = tokenDescriptor.Expires.Value
        };
    }

}