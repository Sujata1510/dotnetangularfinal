using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDMRS_Project.Models.DTOs.Employee;

public class EmployeeCreateDto

{
    [Required, StringLength(20)]
    public string EmployeeCode { get; set; } = string.Empty;

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EmployeeID { get; set; }


    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Phone, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public DateTime HireDate { get; set; }

    public DateOnly? DateOfBirth { get; set; }


    [Range(0, 999999999.99)]
    public decimal Salary { get; set; }

    [Required]
    public int DepartmentID { get; set; }

    [Required]
    public int PositionID { get; set; }

    [Required]
    public int LocationID { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime? UpdatedDate { get; set; }


}