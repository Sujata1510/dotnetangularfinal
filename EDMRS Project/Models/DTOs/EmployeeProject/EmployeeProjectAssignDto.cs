namespace EDMRS_Project.Models.DTOs.EmployeeProjects;

public class EmployeeProjectAssignDto
{
    public int EmployeeID { get; set; }
    public int ProjectID { get; set; }
    public string Role { get; set; } = string.Empty;
    public decimal AllocationPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}