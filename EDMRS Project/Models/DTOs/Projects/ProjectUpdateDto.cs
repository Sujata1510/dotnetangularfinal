namespace EDMRS_Project.Models.DTOs.Projects
{
    public class ProjectUpdateDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectCode { get; set; } = string.Empty;

        public int ClientID { get; set; }
        public int DepartmentID {  get; set; }
        public int? ManagerID { get; set; }
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        public decimal Budget {  get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
