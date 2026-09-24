namespace EDMRS_Project.Models.DTOs.EmployeeProjects;

public class EmployeeProjectReadDto
{
    public int EmployeeID { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int ProjectID { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public decimal AllocationPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
