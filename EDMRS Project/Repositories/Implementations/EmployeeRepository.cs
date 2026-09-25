using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Data;
using EDMRS_Project.Models.DTOs.Employee;
using EDMRS_Project.Models.Entities;
using EDMRS_Prpject.Models.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace EDMRS.Api.Repositories.Implementations;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly EdmrsDbContext _context;

    public EmployeeRepository(EdmrsDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<EmployeeReadDto>> GetPagedAsync(EmployeeQueryParametersDto parameters)
    {
        var query = _context.Employees
            .AsNoTracking()
            .AsQueryable();

        // 1. Filtering by SearchTerm (Index-friendly search using EF.Functions.Like)
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var term = parameters.SearchTerm.Trim();
            var searchPattern = $"%{term}%";

            query = query.Where(e =>
                EF.Functions.Like(e.EmployeeCode, searchPattern) ||
                EF.Functions.Like(e.FirstName, searchPattern) ||
                EF.Functions.Like(e.LastName, searchPattern) ||
                EF.Functions.Like(e.Email, searchPattern));
        }

        // 2. Foreign Key & Active Status Filters
        if (parameters.DepartmentID.HasValue)
            query = query.Where(e => e.DepartmentID == parameters.DepartmentID.Value);

        if (parameters.PositionID.HasValue)
            query = query.Where(e => e.PositionID == parameters.PositionID.Value);

        if (parameters.IsActive.HasValue)
            query = query.Where(e => parameters.IsActive.Value ? e.Status == "Active" : e.Status != "Active");
        else
            query = query.Where(e => e.Status == "Active");

        // 3. Dynamic Sorting
        var sortBy = parameters.SortBy?.ToLowerInvariant();

        query = sortBy switch
        {
            "employeecode" => parameters.IsDescending ? query.OrderByDescending(e => e.EmployeeCode) : query.OrderBy(e => e.EmployeeCode),
            "firstname" => parameters.IsDescending ? query.OrderByDescending(e => e.FirstName) : query.OrderBy(e => e.FirstName),
            "email" => parameters.IsDescending ? query.OrderByDescending(e => e.Email) : query.OrderBy(e => e.Email),
            "hiredate" => parameters.IsDescending ? query.OrderByDescending(e => e.HireDate) : query.OrderBy(e => e.HireDate),
            "salary" => parameters.IsDescending ? query.OrderByDescending(e => e.Salary) : query.OrderBy(e => e.Salary),
            _ => parameters.IsDescending ? query.OrderByDescending(e => e.LastName) : query.OrderBy(e => e.LastName)
        };

        // 4. Count total items before applying pagination
        var totalCount = await query.CountAsync();

        // 5. Pagination projection to DTO
        var items = await query
            .Skip((parameters.PageIndex - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(e => new EmployeeReadDto
            {
                EmployeeID = e.EmployeeID,
                EmployeeCode = e.EmployeeCode,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone ?? string.Empty,
                HireDate = e.HireDate,
                IsActive = e.Status == "Active",
                DepartmentID = e.DepartmentID,
                DepartmentName = e.Department != null ? e.Department.DepartmentName : string.Empty,
                PositionID = e.PositionID,
                LocationID = e.LocationID
            })
            .ToListAsync();

        return new PagedResultDto<EmployeeReadDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = parameters.PageIndex,
            PageSize = parameters.PageSize
        };
    }

    public async Task<EmployeeReadDto?> GetByIdAsync(int id)
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeID == id)
            .Select(e => new EmployeeReadDto
            {
                EmployeeID = e.EmployeeID,
                EmployeeCode = e.EmployeeCode,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone ?? string.Empty,
                HireDate = e.HireDate,
                IsActive = e.Status == "Active",
                DepartmentID = e.DepartmentID,
                DepartmentName = e.Department != null ? e.Department.DepartmentName : string.Empty,
                PositionID = e.PositionID,
                LocationID = e.LocationID
            })
            .FirstOrDefaultAsync();
    }

    public async Task<Employee> CreateAsync(Employee employee)
    {
        employee.CreatedDate = DateTime.UtcNow;
        await _context.Employees.AddAsync(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task<bool> UpdateAsync(Employee employee)
    {
        employee.UpdatedDate = DateTime.UtcNow;
        _context.Employees.Update(employee);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var exists = await _context.Employees.AnyAsync(e => e.EmployeeID == id && e.Status == "Active");
        if (!exists)
            return false;

        await _context.EmployeeProjects.Where(ep => ep.EmployeeID == id).ExecuteDeleteAsync();
        var updated = await _context.Employees
            .Where(e => e.EmployeeID == id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(e => e.Status, "Inactive"));
        return updated > 0;
    }

    public async Task<bool> EmployeeCodeExistsAsync(string employeeCode, int? excludeId = null)
    {
        var cleanCode = employeeCode.Trim();
        return await _context.Employees
            .AnyAsync(e => e.EmployeeCode == cleanCode && (!excludeId.HasValue || e.EmployeeID != excludeId.Value));
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
    {
        var cleanEmail = email.Trim();
        return await _context.Employees
            .AnyAsync(e => e.Email == cleanEmail && (!excludeId.HasValue || e.EmployeeID != excludeId.Value));
    }
}