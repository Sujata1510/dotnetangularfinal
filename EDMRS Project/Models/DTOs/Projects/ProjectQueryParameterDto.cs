namespace EDMRS_Project.Models.DTOs.Projects
{
    public class ProjectQueryParameterDto
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public int? ClientID { get; set; }

        public string? Status { get; set; } 
        public int? DepartmentID { get; set; }
        public bool IsDescending { get; set; }
        public string? SortBy { get; internal set; }
    }
}
