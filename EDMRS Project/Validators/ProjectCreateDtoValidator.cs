using EDMRS_Project.Models.DTOs.Projects;
using FluentValidation;

namespace EDMRS_Project.Validators;

public class ProjectCreateDtoValidator : AbstractValidator<ProjectCreateDto>
{
    public ProjectCreateDtoValidator()
    {
        RuleFor(x => x.ProjectCode)
            .NotEmpty().WithMessage("Project Code is required.")
            .Matches(@"^PRJ\d{3,}$").WithMessage("Project Code must start with 'PRJ' followed by at least 3 digits (e.g., PRJ001).");

        RuleFor(x => x.ProjectName)
            .NotEmpty().WithMessage("Project Name is required.")
            .MaximumLength(150).WithMessage("Project Name cannot exceed 150 characters.");

        RuleFor(x => x.ClientID)
            .GreaterThan(0).WithMessage("A valid ClientID is required.");

        RuleFor(x => x.DepartmentID)
            .GreaterThan(0).WithMessage("A valid DepartmentID is required.");

        RuleFor(x => x.Budget)
            .GreaterThanOrEqualTo(0).WithMessage("Budget cannot be a negative amount.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start Date is required.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("End Date must be on or after the Start Date.");
    }
}