namespace EDMRS_Project.Models.Entities
{
    public class Location
    {
        public int LocationID { get; set; }
        public string LocationCode { get; set; } = string.Empty;
        public string LocationName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
    }
}
