namespace EDMRS_Project.Models.Entities
{
    public class Client
    {
        public int ClientID { get; set; }
        public string ClientCode { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
    }
}
