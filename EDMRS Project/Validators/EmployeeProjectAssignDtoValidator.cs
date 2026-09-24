using EDMRS_Project.Models.DTOs.EmployeeProjects;
using FluentValidation;

namespace EDMRS_Project.Validators;

public class EmployeeProjectAssignDtoValidator : AbstractValidator<EmployeeProjectAssignDto>
{
    public EmployeeProjectAssignDtoValidator()
    {
        RuleFor(x => x.EmployeeID)
            .GreaterThan(0).WithMessage("A valid EmployeeID is required.");

        RuleFor(x => x.ProjectID)
            .GreaterThan(0).WithMessage("A valid ProjectID is required.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .MaximumLength(50).WithMessage("Role description cannot exceed 50 characters.");

        RuleFor(x => x.AllocationPercentage)
            .InclusiveBetween(1.00m, 100.00m)
            .WithMessage("Allocation percentage must be between 1% and 100%.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start Date is required.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("End Date must be on or after the Start Date.");
    }
}