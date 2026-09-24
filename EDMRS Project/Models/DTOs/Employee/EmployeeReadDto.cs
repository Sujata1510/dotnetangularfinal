using EDMRS_Project.Models.DTOs.Employee;



public class EmployeeReadDto
{
    public int EmployeeID { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public bool IsActive { get; set; }

    // Relational display properties
    public int DepartmentID { get; set; }
    public string DepartmentName { get; set; } = string.Empty;

    public int PositionID { get; set; }
    public string PositionTitle { get; set; } = string.Empty;

    public int LocationID { get; set; }
    public string LocationName { get; set; } = string.Empty;
}