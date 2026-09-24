namespace EDMRS_Project.Models.DTOs.Employee
{
    public class EmployeeQueryParametersDto
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 10;

        public int PageIndex { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        public string? SearchTerm { get; set; }
        public int? DepartmentID { get; set; }
        public int? PositionID { get; set; }
        public bool? IsActive { get; set; }

        public string SortBy { get; set; } = "LastName";
        public bool IsDescending { get; set; } = false;
    
}
}
