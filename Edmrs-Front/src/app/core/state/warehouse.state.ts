import { Injectable, computed, signal } from '@angular/core';
import { LookupDto } from '../models/common.model';
import { AssignmentRecord, EmployeeRecord, ProjectRecord, UserRecord } from '../models/warehouse.model';

export type AdminView =
  | 'dashboard'
  | 'projects'
  | 'add-project'
  | 'assign'
  | 'employees'
  | 'add-employee'
  | 'users'
  | 'add-user'
  | 'reports';

export interface MenuItem {
  id: AdminView;
  label: string;
  group?: string;
}

@Injectable({ providedIn: 'root' })
export class WarehouseState {
  readonly projects = signal<ProjectRecord[]>([]);
  readonly assignments = signal<AssignmentRecord[]>([]);
  readonly employees = signal<EmployeeRecord[]>([]);
  readonly users = signal<UserRecord[]>([]);
  readonly departments = signal<LookupDto[]>([]);
  readonly positions = signal<LookupDto[]>([]);
  readonly locations = signal<LookupDto[]>([]);
  readonly clients = signal<LookupDto[]>([]);

  readonly view = signal<AdminView>('dashboard');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly projectSnapshot = signal<ProjectRecord | null>(null);
  readonly selectedId = signal<number | null>(null);

  readonly menu: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Project list', group: 'Manage Projects' },
    { id: 'add-project', label: 'Add project', group: 'Manage Projects' },
    { id: 'assign', label: 'Assign Employee', group: 'Manage Projects' },
    { id: 'employees', label: 'Employee list', group: 'Employees' },
    { id: 'add-employee', label: 'Add employee', group: 'Employees' },
    { id: 'users', label: 'User list', group: 'Manage Users' },
    { id: 'add-user', label: 'Add user', group: 'Manage Users' },
    { id: 'reports', label: 'Reports' }
  ];

  readonly pageTitle = computed(() => this.menu.find((item) => item.id === this.view())?.label ?? 'Admin');

  readonly projectWarningCount = computed(() => this.projects().filter((project) => projectWarnings(project)).length);

  readonly employeeWarningCount = computed(() => this.employees().filter((person) => employeeWarnings(person)).length);

  readonly activeUserCount = computed(() => this.users().filter((user) => user.isActive).length);

  open(view: AdminView): void {
    this.view.set(view);
    this.error.set(null);
    this.notice.set(null);
  }
}

export function employeeWarnings(person: EmployeeRecord): string {
  const issues: string[] = [];
  if (!/^EMP\d{3}$/.test(person.employeeCode ?? '')) {
    issues.push('Code must look like EMP001');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email ?? '')) {
    issues.push('Email is not valid');
  }
  if (person.phone && !/^[0-9+\-\s]{7,20}$/.test(person.phone)) {
    issues.push('Phone is not valid');
  }
  return issues.join('; ');
}

export function projectWarnings(project: ProjectRecord): string {
  const issues: string[] = [];
  if (!/^PRJ\d{3,}$/i.test(project.projectCode ?? '')) {
    issues.push('Code must look like PRJ001');
  }
  if (!project.projectName?.trim()) {
    issues.push('Name is missing');
  }
  if (project.endDate && project.startDate && project.endDate.slice(0, 10) < project.startDate.slice(0, 10)) {
    issues.push('Due date is before the start date');
  }
  return issues.join('; ');
}
