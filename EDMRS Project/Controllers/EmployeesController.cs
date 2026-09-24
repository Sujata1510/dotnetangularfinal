
using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Models.DTOs.Employee;
using EDMRS_Project.Models.Entities;
using EDMRS_Prpject.Models.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDMRS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class EmployeesController : ControllerBase
{
    private readonly IEmployeeRepository _employeeRepository;

    public EmployeesController(IEmployeeRepository employeeRepository)
    {
        _employeeRepository = employeeRepository;
    }

    /// <summary>
    /// Retrieves a paginated list of employees with optional search, filtering, and sorting.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin, DataManager")]
    [ProducesResponseType(typeof(PagedResultDto<EmployeeReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<EmployeeReadDto>>> GetEmployees([FromQuery] EmployeeQueryParametersDto parameters)
    {
        var result = await _employeeRepository.GetPagedAsync(parameters);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a specific employee by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin, DataManager")]
    [ProducesResponseType(typeof(EmployeeReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeReadDto>> GetEmployeeById(int id)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        return Ok(employee);
    }

    /// <summary>
    /// Creates a new employee record.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(EmployeeReadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EmployeeReadDto>> CreateEmployee([FromBody] EmployeeCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Check for duplicate EmployeeCode
        if (await _employeeRepository.EmployeeCodeExistsAsync(dto.EmployeeCode))
            return Conflict(new { message = $"Employee Code '{dto.EmployeeCode}' is already in use." });

        // Check for duplicate Email
        if (await _employeeRepository.EmailExistsAsync(dto.Email))
            return Conflict(new { message = $"Email '{dto.Email}' is already registered." });

        var entity = new Employee
        {
            EmployeeCode = dto.EmployeeCode,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            HireDate = dto.HireDate,
            Salary = dto.Salary,
            DepartmentID = dto.DepartmentID,
            PositionID = dto.PositionID,
            LocationID = dto.LocationID,
            IsActive = true
        };

        var createdEntity = await _employeeRepository.CreateAsync(entity);
        var createdDto = await _employeeRepository.GetByIdAsync(createdEntity.EmployeeID);

        return CreatedAtAction(nameof(GetEmployeeById), new { id = createdEntity.EmployeeID }, createdDto);
    }

    /// <summary>
    /// Updates an existing employee record.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] EmployeeUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = await _employeeRepository.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { message = $"Employee with ID {id} was not found." });

        // Check uniqueness excluding current record
        if (await _employeeRepository.EmployeeCodeExistsAsync(dto.EmployeeCode, id))
            return Conflict(new { message = $"Employee Code '{dto.EmployeeCode}' is already used by another record." });

        if (await _employeeRepository.EmailExistsAsync(dto.Email, id))
            return Conflict(new { message = $"Email '{dto.Email}' is already used by another record." });

        var entityToUpdate = new Employee
        {
            EmployeeID = id,
            EmployeeCode = dto.EmployeeCode,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth,
            HireDate = dto.HireDate,
            Salary = dto.Salary,
            DepartmentID = dto.DepartmentID,
            PositionID = dto.PositionID,
            LocationID = dto.LocationID,
            IsActive = dto.IsActive
        };

        var updated = await _employeeRepository.UpdateAsync(entityToUpdate);
        if (!updated)
            return StatusCode(500, new { message = "Failed to update employee record." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes an employee (sets IsActive = false).
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var deleted = await _employeeRepository.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Employee with ID {id} was not found or already deactivated." });

        return NoContent();
    }
}