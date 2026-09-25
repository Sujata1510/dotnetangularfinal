
using EDMRS_Project.Models.DTOs.EmployeeProjects;
using EDMRS_Project.Models.Entities;

namespace EDMRS.Api.Repositories.Interfaces;

public interface IEmployeeProjectRepository
{
    Task<IEnumerable<EmployeeProjectReadDto>> GetAllAssignmentsAsync();
    Task<IEnumerable<EmployeeProjectReadDto>> GetAssignmentsByProjectAsync(int projectId);
    Task<IEnumerable<EmployeeProjectReadDto>> GetAssignmentsByEmployeeAsync(int employeeId);
    Task<decimal> GetTotalAllocationForEmployeeAsync(int employeeId, int? excludeProjectId = null);
    Task<decimal> GetOverlappingAllocationAsync(int employeeId, DateTime start, DateTime? end, int? excludeProjectId = null);
    Task<bool> IsAssignedAsync(int employeeId, int projectId);
    Task<EmployeeProject> AssignAsync(EmployeeProject entity);
    Task<bool> RemoveAsync(int employeeId, int projectId);
    Task RemoveAllForProjectAsync(int projectId);
    Task<bool> EmployeeExistsAsync(int employeeId);
    Task<bool> ProjectExistsAsync(int projectId);
}
