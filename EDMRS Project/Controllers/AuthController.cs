using EDMRS_Project.Models.DTOs;
using EDMRS_Project.Services;
using Microsoft.AspNetCore.Mvc;

namespace EDMRS.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login/login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)


    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            var result = await _authService.AuthenticateAsync(request);

            if (result == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during login for email: {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal server error occurred." });
        }



    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var restrictedRoles = new[] { "Admin" };
        if (!string.IsNullOrEmpty(request.Role) && restrictedRoles.Contains(request.Role, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Registration for administrative roles is not permitted." });
        }

        var success = await _authService.RegisterUserAsync(request.FullName, request.Email, request.Password, request.Role ?? "Viewer");

        if (!success)
            return BadRequest(new { message = "User with this email already exists." });

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("register-seed")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterSeedUser([FromQuery] string email, [FromQuery] string password, [FromQuery] string role = "Admin")
    {
        var success = await _authService.RegisterUserAsync("Admin User", email, password, role);

        if (!success)
            return BadRequest(new { message = "User with this email already exists." });

        return Ok(new { message = "User registered successfully." });
    }
}

//using System.IdentityModel.Tokens.Jwt;
//using System.Security.Claims;
//using System.Text;

//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;

//namespace EdmrsApi.Controllers
//{
//    [ApiController]
//    [Route("api/auth")]
//    public class AuthController : ControllerBase
//    {
//        private readonly DbContext _context;
//        private readonly IConfiguration _config;

//        public AuthController(DbContext context, IConfiguration config)
//        {
//            _context = context;
//            _config = config;
//        }

//        [HttpPost("login")]
//        public async Task<IActionResult> Login([FromBody] LoginDto model)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            // 1. Fetch user from custom database table
//            var user = await _context.Users
//                .FirstOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());

//            // 2. Verify existence and BCrypt password hash
//            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
//            {
//                return Unauthorized(new AuthResponseDto
//                {
//                    IsSuccess = false,
//                    Message = "Invalid email or password."
//                });
//            }

//            if (!user.IsActive)
//            {
//                return StatusCode(403, new AuthResponseDto
//                {
//                    IsSuccess = false,
//                    Message = "Your account has been disabled. Please contact an administrator."
//                });
//            }
