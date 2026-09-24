using EDMRS_Project.Models.DTOs.Common;

namespace EDMRS.Api.Repositories.Interfaces;

public interface IMasterDataRepository
{
    Task<IEnumerable<LookupDto>> GetDepartmentsLookupAsync();
    Task<IEnumerable<LookupDto>> GetPositionsLookupAsync();
    Task<IEnumerable<LookupDto>> GetLocationsLookupAsync();
    Task<IEnumerable<LookupDto>> GetClientsLookupAsync();
}