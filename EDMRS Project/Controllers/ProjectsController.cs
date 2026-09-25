using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Models.DTOs.Common;
using EDMRS_Project.Models.DTOs.Projects;
using EDMRS_Project.Models.Entities;
using EDMRS_Prpject.Models.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDMRS_Project.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly IEmployeeProjectRepository _employeeProjects;

    public ProjectsController(IProjectRepository projectRepository, IEmployeeProjectRepository employeeProjects)
    {
        _projectRepository = projectRepository;
        _employeeProjects = employeeProjects;
    }

    /// <summary>
    /// GET: api/Projects
    /// Retrieves a paginated, filtered, and sorted list of projects.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin, Manager, Viewer")]
    public async Task<ActionResult<PagedResultDto<ProjectReadDto>>> GetProjects([FromQuery] ProjectQueryParameterDto query)
    {
        var result = await _projectRepository.GetPagedAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// GET: api/Projects/5
    /// Retrieves a single project by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin, Manager, Viewer")]
    public async Task<ActionResult<ProjectReadDto>> GetProject(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);

        if (project == null)
        {
            return NotFound(new { Message = $"Project with ID {id} was not found." });
        }

        return Ok(project);
    }

    /// <summary>
    /// POST: api/Projects
    /// Creates a new project with business validation rules.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectReadDto>> CreateProject([FromBody] ProjectCreateDto dto)
    {
        // 1. Foreign Key Validations
        if (!await _projectRepository.ClientExistsAsync(dto.ClientID))
            return BadRequest(new { Message = $"Invalid ClientID: {dto.ClientID}. Record does not exist." });

        if (!await _projectRepository.DepartmentExistsAsync(dto.DepartmentID))
            return BadRequest(new { Message = $"Invalid DepartmentID: {dto.DepartmentID}. Record does not exist." });

        if (dto.ManagerID.HasValue && !await _projectRepository.EmployeeExistsAsync(dto.ManagerID.Value))
            return BadRequest(new { Message = $"Invalid ManagerID: {dto.ManagerID.Value}. Employee record does not exist." });

        // 2. Prevent Duplicate Project Code
        if (await _projectRepository.ProjectCodeExistsAsync(dto.ProjectCode))
            return Conflict(new { Message = $"A project with code '{dto.ProjectCode}' already exists." });

        // 3. Map DTO to Entity
        var project = new Project
        {
            ProjectCode = dto.ProjectCode,
            ProjectName = dto.ProjectName,
            ClientID = dto.ClientID,
            DepartmentID = dto.DepartmentID,
            ManagerID = dto.ManagerID,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Budget = dto.Budget,
            Status = dto.Status
        };

        // 4. Save via Repository
        await _projectRepository.CreateAsync(project); // Call directly without assigning to 'var'

        // 5. Fetch fully populated Read DTO
        var createdDto = await _projectRepository.GetByIdAsync(project.ProjectID);
        if (createdDto == null)
            return StatusCode(500, new { Message = "An error occurred while retrieving the created project." });

        return CreatedAtAction(nameof(GetProject), new { id = project.ProjectID }, createdDto);
    }

    /// <summary>
    /// PUT: api/Projects/5
    /// Updates an existing project.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectUpdateDto dto)
    {
        // 1. Check Existence
        var existingProject = await _projectRepository.GetByIdAsync(id);
        if (existingProject == null)
        {
            return NotFound(new { Message = $"Project with ID {id} was not found." });
        }

        // 2. Validate Foreign Keys
        if (dto.ClientID > 0 && !await _projectRepository.ClientExistsAsync(dto.ClientID))
        {
            return BadRequest(new { message = $"Invalid ClientID: {dto.ClientID}." });
        }

        if (dto.DepartmentID > 0 && !await _projectRepository.DepartmentExistsAsync(dto.DepartmentID))
        {
            return BadRequest(new { message = $"Invalid DepartmentID: {dto.DepartmentID}." });
        }

        if (dto.ManagerID.HasValue && !await _projectRepository.EmployeeExistsAsync(dto.ManagerID.Value))
        {
            return BadRequest(new { Message = $"Invalid ManagerID: {dto.ManagerID.Value}." });
        }

        // 3. Execute Update
        var updated = await _projectRepository.UpdateAsync(id, dto);
        if (!updated)
        {
            return StatusCode(500, new { Message = "An error occurred while updating the project." });
        }

        if (string.Equals(dto.Status?.Trim(), "Deadlock", StringComparison.OrdinalIgnoreCase))
        {
            await _employeeProjects.RemoveAllForProjectAsync(id);
        }

        return NoContent();
    }

    /// <summary>
    /// DELETE: api/Projects/5
    /// Deletes a project by ID.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var existing = await _projectRepository.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound(new { message = $"Project with ID {id} was not found." });
        }

        await _employeeProjects.RemoveAllForProjectAsync(id);
        var deleted = await _projectRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"Project with ID {id} was not found." });
        }

        return NoContent();
    }
}