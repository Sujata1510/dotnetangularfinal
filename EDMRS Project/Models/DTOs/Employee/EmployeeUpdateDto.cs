using EDMRS_Project.Models.DTOs.Employee;

public class EmployeeUpdateDto : EmployeeCreateDto
{
    public bool IsActive { get; set; }
}