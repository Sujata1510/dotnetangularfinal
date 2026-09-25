using System.ComponentModel.DataAnnotations.Schema;

namespace EDMRS_Project.Models.Entities
{
    public class Employee
    {
        [NotMapped]
        public bool IsActive => Status == "Active";

        [Column("Id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EmployeeID { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public DateTime HireDate { get; set; }

        [Column("DepartmentId")]
        public int DepartmentID { get; set; }
        public Department Department { get; set; } = null!;

        [NotMapped]
        public decimal Salary { get; set; }

        [Column("PositionId")]
        public int PositionID { get; set; }
        public Position Position { get; set; } = null!;

        [Column("LocationId")]
        public int LocationID { get; set; }

        public string Status { get; set; } = "Active";

        //public bool IsActive { get; set; } = true;
        [NotMapped]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        [NotMapped]
        public DateTime? UpdatedDate { get; set; }

      

    }
}
