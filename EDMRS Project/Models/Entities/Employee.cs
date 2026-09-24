using System.ComponentModel.DataAnnotations.Schema;

namespace EDMRS_Project.Models.Entities
{
    public class Employee
    {
        internal bool IsActive;

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmployeeID { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }

        public int DepartmentID { get; set; }
        public Department Department { get; set; } = null!;

        [Column(TypeName = "decimal(18,2")]
        public decimal Salary { get; set; }

        public int PositionID { get; set; }
        public Position Position { get; set; } = null!;

        public int LocationID { get; set; }

        public string Status { get; set; } = "Active";

        //public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

      

    }
}
