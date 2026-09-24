using EDMRS.Api.Repositories.Interfaces;
using EDMRS_Project.Models.DTOs.Common;
using Microsoft.AspNetCore.Mvc;

namespace EDMRS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookupsController : ControllerBase
{
    private readonly IMasterDataRepository _masterDataRepository;

    public LookupsController(IMasterDataRepository masterDataRepository)
    {
        _masterDataRepository = masterDataRepository;
    }

    [HttpGet("departments")]
    [ProducesResponseType(typeof(IEnumerable<LookupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDepartments()
    {
        var data = await _masterDataRepository.GetDepartmentsLookupAsync();
        return Ok(data);
    }

    [HttpGet("positions")]
    [ProducesResponseType(typeof(IEnumerable<LookupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPositions()
    {
        var data = await _masterDataRepository.GetPositionsLookupAsync();
        return Ok(data);
    }

    [HttpGet("locations")]
    [ProducesResponseType(typeof(IEnumerable<LookupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLocations()
    {
        var data = await _masterDataRepository.GetLocationsLookupAsync();
        return Ok(data);
    }

    [HttpGet("clients")]
    [ProducesResponseType(typeof(IEnumerable<LookupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClients()
    {
        var data = await _masterDataRepository.GetClientsLookupAsync();
        return Ok(data);
    }
}
