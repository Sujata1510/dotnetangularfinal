
using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Data;
using EDMRS_Project.Models.DTOs.EmployeeProjects;
using EDMRS_Project.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDMRS.Api.Repositories.Implementations;

public class EmployeeProjectRepository : IEmployeeProjectRepository
{
    private readonly EdmrsDbContext _context;

    public EmployeeProjectRepository(EdmrsDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EmployeeProjectReadDto>> GetAssignmentsByProjectAsync(int projectId)
    {
        return await _context.EmployeeProjects
            .Include(ep => ep.Employee)
            .Include(ep => ep.Project)
            .AsNoTracking()
            .Where(ep => ep.ProjectID == projectId)
            .Select(ep => new EmployeeProjectReadDto
            {
                EmployeeID = ep.EmployeeID,
                EmployeeCode = ep.Employee.EmployeeCode,
                EmployeeName = $"{ep.Employee.FirstName} {ep.Employee.LastName}",
                ProjectID = ep.ProjectID,
                ProjectName = ep.Project.ProjectName,
                Role = ep.Role,
                AllocationPercentage = ep.AllocationPercentage,
                StartDate = ep.StartDate,
                EndDate = ep.EndDate
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<EmployeeProjectReadDto>> GetAssignmentsByEmployeeAsync(int employeeId)
    {
        return await _context.EmployeeProjects
            .Include(ep => ep.Employee)
            .Include(ep => ep.Project)
            .AsNoTracking()
            .Where(ep => ep.EmployeeID == employeeId)
            .Select(ep => new EmployeeProjectReadDto
            {
                EmployeeID = ep.EmployeeID,
                EmployeeCode = ep.Employee.EmployeeCode,
                EmployeeName = $"{ep.Employee.FirstName} {ep.Employee.LastName}",
                ProjectID = ep.ProjectID,
                ProjectName = ep.Project.ProjectName,
                Role = ep.Role,
                AllocationPercentage = ep.AllocationPercentage,
                StartDate = ep.StartDate,
                EndDate = ep.EndDate
            })
            .ToListAsync();
    }

    public async Task<decimal> GetTotalAllocationForEmployeeAsync(int employeeId, int? excludeProjectId = null)
    {
        var query = _context.EmployeeProjects.Where(ep => ep.EmployeeID == employeeId);

        if (excludeProjectId.HasValue)
            query = query.Where(ep => ep.ProjectID != excludeProjectId.Value);

        return await query.SumAsync(ep => (decimal?)ep.AllocationPercentage) ?? 0m;
    }

    public async Task<bool> IsAssignedAsync(int employeeId, int projectId)
    {
        return await _context.EmployeeProjects.AnyAsync(ep => ep.EmployeeID == employeeId && ep.ProjectID == projectId);
    }

    public async Task<EmployeeProject> AssignAsync(EmployeeProject entity)
    {
        _context.EmployeeProjects.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> RemoveAsync(int employeeId, int projectId)
    {
        var assignment = await _context.EmployeeProjects
            .FirstOrDefaultAsync(ep => ep.EmployeeID == employeeId && ep.ProjectID == projectId);

        if (assignment == null)
            return false;

        _context.EmployeeProjects.Remove(assignment);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> EmployeeExistsAsync(int employeeId)
    {
        return await _context.Employees.AnyAsync(e => e.EmployeeID == employeeId);
    }

    public async Task<bool> ProjectExistsAsync(int projectId)
    {
        return await _context.Projects.AnyAsync(p => p.ProjectID == projectId);
    }
}