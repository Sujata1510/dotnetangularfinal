using EDMRS_Project.Models.DTOs.Employee;
using FluentValidation;

namespace EDMRS_Project.Validators;

public class EmployeeCreateDtoValidator : AbstractValidator<EmployeeCreateDto>
{
    public EmployeeCreateDtoValidator()
    {
        RuleFor(x => x.EmployeeCode)
            .NotEmpty().WithMessage("Employee Code is required.")
            .Matches(@"^EMP\d{3}$").WithMessage("Employee Code must be in the format EMP000.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email format is required.");

        RuleFor(x => x.Salary)
            .GreaterThan(0).WithMessage("Salary must be greater than zero.");

        RuleFor(x => x.HireDate)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Hire date cannot be in the future.");
    }
}