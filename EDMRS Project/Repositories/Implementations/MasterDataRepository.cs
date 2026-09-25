using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Data;
using EDMRS_Project.Models.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace EDMRS.Api.Repositories.Implementations;

public class MasterDataRepository : IMasterDataRepository
{
    private readonly EdmrsDbContext _context;

    public MasterDataRepository(EdmrsDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LookupDto>> GetDepartmentsLookupAsync()
    {
        return await _context.Departments
            .AsNoTracking()
            .OrderBy(d => d.DepartmentName)
            .Select(d => new LookupDto
            {
                Id = d.DepartmentID,
                Name = d.DepartmentName
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDto>> GetPositionsLookupAsync()
    {
        return await _context.Positions
            .AsNoTracking()
            .OrderBy(p => p.PositionName)
            .Select(p => new LookupDto
            {
                Id = p.ID,
                Name = p.PositionName
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDto>> GetLocationsLookupAsync()
    {
        return await _context.Locations
            .AsNoTracking()
            .OrderBy(l => l.LocationName)
            .Select(l => new LookupDto
            {
                Id = l.LocationID,
                Name = l.LocationName
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDto>> GetClientsLookupAsync()
    {
        return await _context.Clients
            .AsNoTracking()
            .OrderBy(c => c.ClientName)
            .Select(c => new LookupDto
            {
                Id = c.ClientID,
                Name = c.ClientName
            })
            .ToListAsync();
    }
}