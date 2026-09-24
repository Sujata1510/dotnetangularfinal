import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { LookupService } from '../../../core/services/lookup.service';
import { Employee } from '../../../core/models/employee.model';
import { LookupDto, PagedResult } from '../../../core/models/common.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeListComponent implements OnInit {
  private employeeService: EmployeeService = inject(EmployeeService);
  private lookupService: LookupService = inject(LookupService);
  public authService: AuthService = inject(AuthService);

  employees = signal<Employee[]>([]);
  departments = signal<LookupDto[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(true);

  // Pagination & Filtering state
  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  searchTerm = signal<string>('');
  selectedDepartmentId = signal<number | undefined>(undefined);

  ngOnInit(): void {
    this.loadLookups();
    this.loadEmployees();
  }

  loadLookups(): void {
    this.lookupService.getDepartments().subscribe({
      next: (depts) => this.departments.set(depts),
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.employeeService
      .getEmployees({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
        searchTerm: this.searchTerm(),
        departmentId: this.selectedDepartmentId()
      })
      .subscribe({
        next: (res: PagedResult<Employee>) => {
          this.employees.set(res.items);
          this.totalRecords.set(res.totalRecords);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load employees', err);
          this.isLoading.set(false);
        }
      });
  }

  onSearch(): void {
    this.pageNumber.set(1);
    this.loadEmployees();
  }
}