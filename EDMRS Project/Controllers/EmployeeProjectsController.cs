
using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Models.DTOs.EmployeeProjects;
using EDMRS_Project.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDMRS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class EmployeeProjectsController : ControllerBase
{
    private readonly IEmployeeProjectRepository _repository;

    public EmployeeProjectsController(IEmployeeProjectRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Assigns an employee to a project with allocation validation.
    /// </summary>
    [HttpPost("assign")]
    [Authorize(Roles = "Admin, Manager")]

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AssignEmployee([FromBody] EmployeeProjectAssignDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!await _repository.EmployeeExistsAsync(dto.EmployeeID))
            return BadRequest(new { message = $"Employee with ID {dto.EmployeeID} was not found." });

        if (!await _repository.ProjectExistsAsync(dto.ProjectID))
            return BadRequest(new { message = $"Project with ID {dto.ProjectID} was not found." });

        if (await _repository.IsAssignedAsync(dto.EmployeeID, dto.ProjectID))
            return Conflict(new { message = "Employee is already assigned to this project." });

        // Business Rule: Total allocation across projects must not exceed 100%
        var currentTotal = await _repository.GetTotalAllocationForEmployeeAsync(dto.EmployeeID);
        if (currentTotal + dto.AllocationPercentage > 100.00m)
        {
            return BadRequest(new
            {
                message = $"Allocation limit exceeded. Current total allocation: {currentTotal}%. Attempted addition: {dto.AllocationPercentage}%."
            });
        }

        var entity = new EmployeeProject
        {
            EmployeeID = dto.EmployeeID,
            ProjectID = dto.ProjectID,
            Role = dto.Role,
            AllocationPercentage = dto.AllocationPercentage,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        await _repository.AssignAsync(entity);
        return Ok(new { message = "Employee successfully assigned to project." });
    }

    /// <summary>
    /// Gets all employee assignments for a specific project.
    /// </summary>
    [HttpGet("project/{projectId:int}")]
    [Authorize(Roles = "Admin, Manager, Viewer, Data Analyst")]

    [ProducesResponseType(typeof(IEnumerable<EmployeeProjectReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EmployeeProjectReadDto>>> GetByProject(int projectId)
    {
        var assignments = await _repository.GetAssignmentsByProjectAsync(projectId);
        return Ok(assignments);
    }

    /// <summary>
    /// Gets all project assignments for a specific employee.
    /// </summary>s
    [HttpGet("employee/{employeeId:int}")]
    [Authorize(Roles = "Admin, Manager, Viewer, Data Analyst")]

    [ProducesResponseType(typeof(IEnumerable<EmployeeProjectReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EmployeeProjectReadDto>>> GetByEmployee(int employeeId)
    {
        var assignments = await _repository.GetAssignmentsByEmployeeAsync(employeeId);
        return Ok(assignments);
    }

    /// <summary>
    /// Removes an employee's assignment from a project.
    /// </summary>
    /// [Authorize(Roles = "Admin, DataManager")]
    [Authorize(Roles = "Admin")]

    [HttpDelete("project/{projectId:int}/employee/{employeeId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveAssignment(int projectId, int employeeId)
    {
        var removed = await _repository.RemoveAsync(employeeId, projectId);
        if (!removed)
            return NotFound(new { message = "Assignment record not found." });

        return NoContent();
    }
}