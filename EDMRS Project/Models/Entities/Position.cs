using System.ComponentModel.DataAnnotations.Schema;

namespace EDMRS_Project.Models.Entities
{
    public class Position
    {
        public int ID { get; set; }
        public string PositionCode { get; set; } = string.Empty;
        public string PositionName { get; set; } = string.Empty;
        [Column("DepartmentId")]
        public int DepartmentID { get; set; }
        public string Level { get; set; } = "Mid";
        public string Status { get; set; } = "Active";

        // Navigation
        public Department Department { get; set; } = null!;
    }
}
