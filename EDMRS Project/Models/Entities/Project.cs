using System.ComponentModel.DataAnnotations.Schema;

namespace EDMRS_Project.Models.Entities
{
    public class Project
    {
        [Column("Id")]
        public int ProjectID { get; set; }
        public string ProjectCode { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        [Column("ClientId")]
        public int ClientID { get; set; }
        [Column("DepartmentId")]
        public int DepartmentID { get; set; }
        [Column("ManagerId")]
        public int? ManagerID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Status { get; set; } = "Planning";
    }
}
