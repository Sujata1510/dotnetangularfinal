using EDMRS_Project.Models.Entities;
using Microsoft.EntityFrameworkCore;


namespace EDMRS_Project.Data
{
    public class EdmrsDbContext : DbContext
    {
        public EdmrsDbContext(DbContextOptions<EdmrsDbContext> options) : base(options) { }

        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Position> Positions => Set<Position>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<User> Users => Set<User>();

        public DbSet<EmployeeProject> EmployeeProjects => Set<EmployeeProject>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique indexes matching SQL schema
            modelBuilder.Entity<Department>().HasIndex(d => d.DepartmentCode).IsUnique();
            modelBuilder.Entity<Location>().HasIndex(l => l.LocationCode).IsUnique();
            modelBuilder.Entity<Position>().HasIndex(p => p.PositionCode).IsUnique();
            modelBuilder.Entity<Client>().HasIndex(c => c.ClientCode).IsUnique();
            modelBuilder.Entity<Employee>().HasIndex(e => e.EmployeeCode).IsUnique();
            modelBuilder.Entity<Employee>().HasIndex(e => e.Email).IsUnique();
            modelBuilder.Entity<Project>().HasIndex(p => p.ProjectCode).IsUnique();
            modelBuilder.Entity<Project>().Property(p => p.Budget).HasPrecision(18, 2);

            // Unique Assignment per Employee-Project pair
            modelBuilder.Entity<EmployeeProject>()
                .HasKey(ep => new { ep.EmployeeID, ep.ProjectID });
            modelBuilder.Entity<EmployeeProject>().Property(ep => ep.AllocationPercentage).HasPrecision(18, 2);
        }
    }
}
