using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDMRS_Project.Models.Entities
{
    public class EmployeeProject
    {
        
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssignmentID { get; set; }
        public int EmployeeID { get; set; }
        public Employee Employee { get; set; } = null!;
        public int ProjectID { get; set; }
        public Project Project { get; set; } = null!;
        public string Role { get; set; } = string.Empty;
        public decimal AllocationPercentage { get; set; } = 100.00m;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

}
