using EDMRS_Project.Data;
using EDMRS_Project.Models.DTOs.Common;
using EDMRS_Project.Models.DTOs.Projects;
using EDMRS_Project.Models.Entities;
using EDMRS_Prpject.Models.DTOs.Common;
using Microsoft.EntityFrameworkCore;
using EDMRS.Api.Repositories.Interfaces;

namespace EDMRS.Api.Repositories.Implementations;

public class ProjectRepository : IProjectRepository
{
    private readonly EdmrsDbContext _context;

    public ProjectRepository(EdmrsDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<ProjectReadDto>> GetPagedAsync(ProjectQueryParameterDto parameters)
    {
        // Removed .Include(p => p.DepartmentID) and .Include(p => p.ManagerID)
        // EF Core automatically handles SQL JOINs during .Select() projection
        var dbQuery = _context.Projects
            .AsNoTracking()
            .AsQueryable();

        // 1. Search Term Filtering
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var term = parameters.SearchTerm.Trim().ToLower();
            dbQuery = dbQuery.Where(p =>
                p.ProjectCode.ToLower().Contains(term) ||
                p.ProjectName.ToLower().Contains(term));
        }

        // 2. Exact Relational Filters
        if (parameters.ClientID.HasValue)
            dbQuery = dbQuery.Where(p => p.ClientID == parameters.ClientID.Value);

        if (parameters.DepartmentID.HasValue)
            dbQuery = dbQuery.Where(p => p.DepartmentID == parameters.DepartmentID.Value);

        if (!string.IsNullOrWhiteSpace(parameters.Status))
            dbQuery = dbQuery.Where(p => p.Status.ToLower() == parameters.Status.ToLower());

        // 3. Dynamic Sorting
        var sortBy = parameters.SortBy?.ToLowerInvariant();

        dbQuery = sortBy switch
        {
            "projectcode" => parameters.IsDescending ? dbQuery.OrderByDescending(p => p.ProjectCode) : dbQuery.OrderBy(p => p.ProjectCode),
            "projectname" => parameters.IsDescending ? dbQuery.OrderByDescending(p => p.ProjectName) : dbQuery.OrderBy(p => p.ProjectName),
            "startdate" => parameters.IsDescending ? dbQuery.OrderByDescending(p => p.StartDate) : dbQuery.OrderBy(p => p.StartDate),
            "budget" => parameters.IsDescending ? dbQuery.OrderByDescending(p => p.Budget) : dbQuery.OrderBy(p => p.Budget),
            _ => parameters.IsDescending ? dbQuery.OrderByDescending(p => p.ProjectID) : dbQuery.OrderBy(p => p.ProjectID)
        };

        // 4. Unpaginated Count
        var totalCount = await dbQuery.CountAsync();

        // 5. Pagination Offset & DTO Projection
        var items = await dbQuery
            .Skip((parameters.PageIndex - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(p => new ProjectReadDto
            {
                ProjectID = p.ProjectID,
                ProjectCode = p.ProjectCode,
                ProjectName = p.ProjectName,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Budget = p.Budget,
                Status = p.Status
            })
            .ToListAsync();

        return new PagedResultDto<ProjectReadDto>
        {
            Items = items,
            PageIndex = parameters.PageIndex,
            PageSize = parameters.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ProjectReadDto?> GetByIdAsync(int id)
    {
        // Removed invalid .Include() statements
        return await _context.Projects
            .AsNoTracking()
            .Where(p => p.ProjectID == id)
            .Select(p => new ProjectReadDto
            {
                ProjectID = p.ProjectID,
                ProjectCode = p.ProjectCode,
                ProjectName = p.ProjectName,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Budget = p.Budget,
                Status = p.Status
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Project> CreateAsync(Project entity)
    {
        _context.Projects.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> UpdateAsync(Project entity)
    {
        var existing = await _context.Projects.FindAsync(entity.ProjectID);
        if (existing == null)
            return false;

        existing.ProjectCode = entity.ProjectCode;
        existing.ProjectName = entity.ProjectName;
        existing.ClientID = entity.ClientID;
        existing.DepartmentID = entity.DepartmentID;
        existing.ManagerID = entity.ManagerID;
        existing.StartDate = entity.StartDate;
        existing.EndDate = entity.EndDate;
        existing.Budget = entity.Budget;
        existing.Status = entity.Status;

        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return false;

        _context.Projects.Remove(project);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> ProjectCodeExistsAsync(string projectCode, int? excludeId = null)
    {
        var query = _context.Projects.AsQueryable();

        if (excludeId.HasValue)
            query = query.Where(p => p.ProjectID != excludeId.Value);

        return await query.AnyAsync(p => p.ProjectCode.ToLower() == projectCode.Trim().ToLower());
    }

    public async Task<bool> ClientExistsAsync(int clientId)
    {
        return await _context.Clients.AnyAsync(c => c.ClientID == clientId);
    }

    public async Task<bool> DepartmentExistsAsync(int departmentId)
    {
        return await _context.Departments.AnyAsync(d => d.DepartmentID == departmentId);
    }

    public async Task<bool> EmployeeExistsAsync(int employeeId)
    {
        return await _context.Employees.AnyAsync(e => e.EmployeeID == employeeId);
    }

    public Task CreateAsync(ProjectCreateDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateAsync(int id, Project entity)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateAsync(int id, ProjectUpdateDto dto)
    {
        throw new NotImplementedException();
    }
}