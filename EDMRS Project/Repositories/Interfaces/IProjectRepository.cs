
using EDMRS_Project.Models.DTOs.Common;
using EDMRS_Project.Models.DTOs.Projects;
using EDMRS_Project.Models.Entities;
using EDMRS_Prpject.Models.DTOs.Common;

namespace EDMRS.Api.Repositories.Interfaces;

public interface IProjectRepository
{
    Task<PagedResultDto<ProjectReadDto>> GetPagedAsync(ProjectQueryParameterDto parameters);
    Task<ProjectReadDto?> GetByIdAsync(int id);
    Task<Project> CreateAsync(Project entity);
    Task<bool> UpdateAsync(int id, Project entity);
    Task<bool> DeleteAsync(int id);
    Task<bool> ProjectCodeExistsAsync(string projectCode, int? excludeId = null);
    Task<bool> ClientExistsAsync(int clientId);
    Task<bool> DepartmentExistsAsync(int departmentId);
    Task<bool> EmployeeExistsAsync(int employeeId);
    Task CreateAsync(ProjectCreateDto dto);
    Task<bool> UpdateAsync(int id, ProjectUpdateDto dto);
}

