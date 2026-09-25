import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { EmployeeService } from '../../core/services/employee.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { EmployeeRecord, ProjectRecord } from '../../core/models/warehouse.model';
import { AuthService } from '../../core/services/auth.service';
import { WarehouseState, employeeWarnings, projectWarnings } from '../../core/state/warehouse.state';

type ViewerView = 'dashboard' | 'projects' | 'employees' | 'users';

@Component({
  selector: 'app-viewer-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './viewer-dashboard.html',
  styleUrl: './viewer-dashboard.scss'
})
export class ViewerDashboardComponent implements OnInit {
  private readonly projectsApi = inject(ProjectService);
  private readonly employeesApi = inject(EmployeeService);
  private readonly usersApi = inject(UserService);
  private readonly state = inject(WarehouseState);
  readonly auth = inject(AuthService);

  readonly menu: { id: ViewerView; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Project list' },
    { id: 'employees', label: 'Employee list' },
    { id: 'users', label: 'User list' }
  ];

  readonly view = signal<ViewerView>('dashboard');
  readonly projects = this.state.projects;
  readonly employees = this.state.employees;
  readonly users = this.state.users;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.loading.set(true);
    this.projectsApi.getAllProjects().subscribe({
      next: (items) => {
        this.projects.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Projects could not be loaded.');
      }
    });
    this.employeesApi.getAllDirectory().subscribe({
      next: (items) => this.employees.set(items),
      error: () => this.error.set('The employee list could not be loaded.')
    });
    this.usersApi.getUsers().subscribe({
      next: (items) => this.users.set(items),
      error: () => this.error.set('The user list could not be loaded.')
    });
  }

 

  open(view: ViewerView): void {
    this.view.set(view);
    this.error.set(null);
  }

  pageTitle(): string {
    return this.menu.find((item) => item.id === this.view())?.label ?? 'Viewer';
  }

  employeeWarnings(person: EmployeeRecord): string {
    return employeeWarnings(person);
  }

  projectWarnings(project: ProjectRecord): string {
    return projectWarnings(project);
  }
}
