
using EDMRS_Project.Models.DTOs.Employee;
using EDMRS_Project.Models.Entities;
using EDMRS_Prpject.Models.DTOs.Common;

namespace EDMRS.Api.Repositories.Interfaces;

public interface IEmployeeRepository
{
    Task<PagedResultDto<EmployeeReadDto>> GetPagedAsync(EmployeeQueryParametersDto parameters);
    Task<EmployeeReadDto?> GetByIdAsync(int id);
    Task<Employee> CreateAsync(Employee employee);
    Task<bool> UpdateAsync(Employee employee);
    Task<bool> DeleteAsync(int id);
    Task<bool> EmployeeCodeExistsAsync(string employeeCode, int? excludeId = null);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
}