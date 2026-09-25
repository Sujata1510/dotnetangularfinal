
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

    public async Task<IEnumerable<EmployeeProjectReadDto>> GetAllAssignmentsAsync()
    {
        return await ProjectAssignments(_context.EmployeeProjects).ToListAsync();
    }

    public async Task<IEnumerable<EmployeeProjectReadDto>> GetAssignmentsByProjectAsync(int projectId)
    {
        return await ProjectAssignments(_context.EmployeeProjects.Where(ep => ep.ProjectID == projectId)).ToListAsync();
    }

    public async Task<IEnumerable<EmployeeProjectReadDto>> GetAssignmentsByEmployeeAsync(int employeeId)
    {
        return await ProjectAssignments(_context.EmployeeProjects.Where(ep => ep.EmployeeID == employeeId)).ToListAsync();
    }

    public async Task<decimal> GetOverlappingAllocationAsync(int employeeId, DateTime start, DateTime? end, int? excludeProjectId = null)
    {
        var windowEnd = end ?? DateTime.MaxValue;
        var rows = await _context.EmployeeProjects
            .AsNoTracking()
            .Where(ep => ep.EmployeeID == employeeId && (!excludeProjectId.HasValue || ep.ProjectID != excludeProjectId.Value))
            .Select(ep => new { ep.AllocationPercentage, ep.StartDate, ep.EndDate })
            .ToListAsync();

        return rows
            .Where(ep => ep.StartDate <= windowEnd && start <= (ep.EndDate ?? DateTime.MaxValue))
            .Sum(ep => ep.AllocationPercentage);
    }

    private static IQueryable<EmployeeProjectReadDto> ProjectAssignments(IQueryable<EmployeeProject> query)
    {
        return query
            .AsNoTracking()
            .Select(ep => new EmployeeProjectReadDto
            {
                EmployeeID = ep.EmployeeID,
                EmployeeCode = ep.Employee.EmployeeCode,
                EmployeeName = ep.Employee.FirstName + " " + ep.Employee.LastName,
                ProjectID = ep.ProjectID,
                ProjectName = ep.Project.ProjectName,
                Role = ep.Role,
                AllocationPercentage = ep.AllocationPercentage,
                StartDate = ep.StartDate,
                EndDate = ep.EndDate
            });
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

    public async Task RemoveAllForProjectAsync(int projectId)
    {
        var rows = await _context.EmployeeProjects.Where(ep => ep.ProjectID == projectId).ToListAsync();
        if (rows.Count == 0)
            return;

        _context.EmployeeProjects.RemoveRange(rows);
        await _context.SaveChangesAsync();
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