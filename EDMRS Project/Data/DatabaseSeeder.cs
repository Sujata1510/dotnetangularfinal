using EDMRS_Project.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDMRS_Project.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(EdmrsDbContext db)
    {
        await EnsureUser(db, "Admin User", "admin@edmrs.com", "Admin@123", "Admin");
        await EnsureUser(db, "Manager User", "manager@edmrs.com", "Manager@123", "Manager");
        await EnsureUser(db, "Viewer User", "viewer@edmrs.com", "Viewer@123", "Viewer");
        await db.SaveChangesAsync();

        if (await db.Projects.AnyAsync())
        {
            return;
        }

        var engineering = new Department { DepartmentCode = "ENG", DepartmentName = "Engineering", Status = "Active" };
        var delivery = new Department { DepartmentCode = "DEL", DepartmentName = "Delivery", Status = "Active" };
        db.Departments.AddRange(engineering, delivery);
        await db.SaveChangesAsync();

        var developer = new Position { PositionCode = "DEV", PositionName = "Developer", DepartmentID = engineering.DepartmentID, Level = "Mid" };
        var lead = new Position { PositionCode = "LEAD", PositionName = "Project Lead", DepartmentID = delivery.DepartmentID, Level = "Senior" };
        db.Positions.AddRange(developer, lead);

        var kathmandu = new Location { LocationCode = "KTM", LocationName = "Kathmandu HQ", City = "Kathmandu", Country = "Nepal" };
        db.Locations.Add(kathmandu);

        var client = new Client
        {
            ClientCode = "INT",
            ClientName = "IntelSoft",
            Industry = "Software",
            Country = "Singapore",
            ContactEmail = "hello@intelsoft.sg"
        };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        var ada = Employee("EMP001", "Ada", "Sharma", "ada.sharma@edmrs.com", engineering.DepartmentID, developer.ID, kathmandu.LocationID);
        var ben = Employee("EMP002", "Ben", "Gurung", "ben.gurung@edmrs.com", delivery.DepartmentID, lead.ID, kathmandu.LocationID);
        var chia = Employee("EMP003", "Chia", "Rai", "chia.rai@edmrs.com", engineering.DepartmentID, developer.ID, kathmandu.LocationID);
        db.Employees.AddRange(ada, ben, chia);
        await db.SaveChangesAsync();

        var warehouse = new Project
        {
            ProjectCode = "PRJ001",
            ProjectName = "Enterprise Management System",
            ClientID = client.ClientID,
            DepartmentID = engineering.DepartmentID,
            ManagerID = ben.EmployeeID,
            StartDate = DateTime.UtcNow.Date.AddDays(-20),
            EndDate = DateTime.UtcNow.Date.AddDays(40),
            Budget = 250000,
            Status = "Active"
        };
        var portal = new Project
        {
            ProjectCode = "PRJ002",
            ProjectName = "Client Reporting Portal",
            ClientID = client.ClientID,
            DepartmentID = delivery.DepartmentID,
            ManagerID = ben.EmployeeID,
            StartDate = DateTime.UtcNow.Date.AddDays(-5),
            EndDate = DateTime.UtcNow.Date.AddDays(25),
            Budget = 80000,
            Status = "Planning"
        };
        var archive = new Project
        {
            ProjectCode = "PRJ003",
            ProjectName = "Archive Migration",
            ClientID = client.ClientID,
            DepartmentID = engineering.DepartmentID,
            StartDate = DateTime.UtcNow.Date.AddDays(-90),
            EndDate = DateTime.UtcNow.Date.AddDays(-2),
            Budget = 40000,
            Status = "Completed"
        };
        db.Projects.AddRange(warehouse, portal, archive);
        await db.SaveChangesAsync();

        db.EmployeeProjects.AddRange(
            Assignment(ada, warehouse, "Developer", 60),
            Assignment(ada, portal, "Developer", 40),
            Assignment(ben, warehouse, "Manager", 100),
            Assignment(chia, portal, "Analyst", 50));
        await db.SaveChangesAsync();
    }

    private static async Task EnsureUser(EdmrsDbContext db, string name, string email, string password, string role)
    {
        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            return;
        }

        db.Users.Add(User(name, email, password, role));
    }

    private static User User(string name, string email, string password, string role) => new()
    {
        FullName = name,
        Email = email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
        Role = role,
        IsActive = true
    };

    private static Employee Employee(string code, string first, string last, string email, int departmentId, int positionId, int locationId) => new()
    {
        EmployeeCode = code,
        FirstName = first,
        LastName = last,
        Email = email,
        Phone = "9800000000",
        HireDate = DateTime.UtcNow.Date.AddYears(-1),
        DepartmentID = departmentId,
        PositionID = positionId,
        LocationID = locationId,
        Salary = 90000,
        Status = "Active"
    };

    private static EmployeeProject Assignment(Employee employee, Project project, string role, decimal percent) => new()
    {
        EmployeeID = employee.EmployeeID,
        ProjectID = project.ProjectID,
        Role = role,
        AllocationPercentage = percent,
        StartDate = DateTime.UtcNow.Date.AddDays(-10),
        EndDate = DateTime.UtcNow.Date.AddDays(30)
    };
}
