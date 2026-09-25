import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../core/services/assignment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LookupService } from '../../core/services/lookup.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { AssignmentRecord, EmployeeRecord, ProjectRecord, UserRecord } from '../../core/models/warehouse.model';
import { AuthService } from '../../core/services/auth.service';
import { AdminView, WarehouseState, employeeWarnings, projectWarnings } from '../../core/state/warehouse.state';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly projectsApi = inject(ProjectService);
  private readonly assignmentsApi = inject(AssignmentService);
  private readonly employeesApi = inject(EmployeeService);
  private readonly usersApi = inject(UserService);
  private readonly lookupsApi = inject(LookupService);
  private readonly state = inject(WarehouseState);
  readonly auth = inject(AuthService);

  readonly roles = ['Admin', 'Manager', 'Viewer'];
  readonly statuses = ['Planning', 'Active', 'On Hold', 'Completed', 'Deadlock'];

  readonly canChange = computed(() => this.auth.isAdmin());
  readonly menu = computed(() =>
    this.canChange()
      ? this.state.menu
      : this.state.menu.filter((item) => item.id !== 'add-project' && item.id !== 'assign' && item.id !== 'add-employee' && item.id !== 'add-user')
  );
  readonly view = this.state.view;
  readonly projects = this.state.projects;
  readonly assignments = this.state.assignments;
  readonly employees = this.state.employees;
  readonly users = this.state.users;
  readonly departments = this.state.departments;
  readonly positions = this.state.positions;
  readonly locations = this.state.locations;
  readonly clients = this.state.clients;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly notice = this.state.notice;
  readonly saving = this.state.saving;
  readonly editingId = this.state.editingId;
  readonly pageTitle = this.state.pageTitle;
  readonly warnCountProjects = this.state.projectWarningCount;
  readonly warnCountEmployees = this.state.employeeWarningCount;

  readonly today = todayKey();

  readonly projectDraft = signal(emptyProject());
  readonly employeeDraft = signal(emptyEmployee());
  readonly userDraft = signal(emptyUser());
  readonly assignDraft = signal(emptyAssign());
  readonly projectStrict = signal(false);
  readonly employeeStrict = signal(false);
  readonly userStrict = signal(false);
  readonly assignStrict = signal(false);

  readonly projectFieldWarnings = computed(() => projectFieldWarnings(this.projectDraft(), this.projectStrict()));
  readonly employeeFieldWarnings = computed(() => employeeFieldWarnings(this.employeeDraft(), this.today, this.employeeStrict()));
  readonly userFieldWarnings = computed(() => userFieldWarnings(this.userDraft(), this.userStrict()));
  readonly assignFieldWarnings = computed(() =>
    assignFieldWarnings(this.assignDraft(), this.today, this.freeShare(), this.assignStrict())
  );

  readonly freeShare = computed(() => {
    const draft = this.assignDraft();
    const employeeId = draft.employeeID;
    const start = draft.startDate;
    if (!employeeId || !start) {
      return 100;
    }
    const end = draft.endDate || '9999-12-31';
    return Math.min(100, Math.max(0, 100 - peakOverlap(this.assignments(), employeeId, start, end)));
  });

  ngOnInit(): void {
    if (!this.canChange()) {
      const view = this.view();
      if (view === 'add-project' || view === 'assign' || view === 'add-employee' || view === 'add-user') {
        this.open('dashboard');
      }
    }
    this.loadAll();
    if (!this.canChange()) {
      return;
    }
    this.lookupsApi.getDepartments().subscribe({ next: (rows) => this.departments.set(rows) });
    this.lookupsApi.getPositions().subscribe({ next: (rows) => this.positions.set(rows) });
    this.lookupsApi.getLocations().subscribe({ next: (rows) => this.locations.set(rows) });
    this.lookupsApi.getClients().subscribe({ next: (rows) => this.clients.set(rows) });
  }

  setProject<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]): void {
    this.projectDraft.update((draft) => ({ ...draft, [key]: value }));
    this.notice.set(null);
  }

  setEmployee<K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]): void {
    this.employeeDraft.update((draft) => ({ ...draft, [key]: value }));
    this.notice.set(null);
  }

  setUser<K extends keyof UserDraft>(key: K, value: UserDraft[K]): void {
    this.userDraft.update((draft) => ({ ...draft, [key]: value }));
    this.notice.set(null);
  }

  setAssign<K extends keyof AssignDraft>(key: K, value: AssignDraft[K]): void {
    this.assignDraft.update((draft) => ({ ...draft, [key]: value }));
    this.notice.set(null);
  }

  open(view: AdminView): void {
    this.state.open(view);
  }

  employeeWarnings(person: EmployeeRecord): string {
    return employeeWarnings(person);
  }

  projectWarnings(project: ProjectRecord): string {
    return projectWarnings(project);
  }

  dateOnly(value: string | null): string {
    return value ? value.slice(0, 10) : '';
  }

  startEdit(project: ProjectRecord): void {
    this.state.projectSnapshot.set({ ...project });
    this.editingId.set(project.projectID);
    this.error.set(null);
    this.notice.set(null);
  }

  cancelEdit(): void {
    const snapshot = this.state.projectSnapshot();
    if (snapshot) {
      this.projects.update((list) => list.map((item) => (item.projectID === snapshot.projectID ? snapshot : item)));
    }
    this.editingId.set(null);
    this.state.projectSnapshot.set(null);
  }

  deleteProject(project: ProjectRecord): void {
    this.saving.set(true);
    this.error.set(null);
    this.projectsApi.deleteProject(project.projectID).subscribe({
      next: () => {
        this.saving.set(false);
        this.projects.update((list) => list.filter((item) => item.projectID !== project.projectID));
        this.assignments.update((rows) => rows.filter((row) => row.projectID !== project.projectID));
        this.notice.set(`${project.projectName} was deleted. People on it were cleared.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(readError(err, 'Could not delete the project.'));
      }
    });
  }

  saveProject(project: ProjectRecord): void {
    if (!project.projectName.trim() || !project.status.trim()) {
      this.error.set('Project name and status are needed.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.projectsApi
      .updateProject(project.projectID, {
        projectName: project.projectName.trim(),
        endDate: project.endDate ? project.endDate.slice(0, 10) : null,
        status: project.status.trim()
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.editingId.set(null);
          this.state.projectSnapshot.set(null);
          const released = project.status.trim().toLowerCase() === 'deadlock';
          if (released) {
            this.assignments.update((rows) => rows.filter((row) => row.projectID !== project.projectID));
          }
          this.notice.set(
            released
              ? `${project.projectName} is Deadlock. People on it were cleared.`
              : `${project.projectName} was saved.`
          );
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(readError(err, 'Could not save the project.'));
        }
      });
  }

  saveNewProject(): void {
    this.projectStrict.set(true);
    const value = this.projectDraft();
    if (hasText(this.projectFieldWarnings())) {
      return;
    }
    if (value.endDate && value.endDate < value.startDate) {
      this.error.set('Due date cannot be before the start date.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.projectsApi
      .createProject({
        projectCode: value.projectCode.trim().toUpperCase(),
        projectName: value.projectName.trim(),
        clientID: value.clientID,
        departmentID: value.departmentID,
        startDate: value.startDate,
        endDate: value.endDate || null,
        budget: Number(value.budget),
        status: value.status
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notice.set('Project added.');
          this.projectDraft.set(emptyProject());
          this.projectStrict.set(false);
          this.loadAll();
          this.open('projects');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(readError(err, 'Could not add the project.'));
        }
      });
  }

  deleteEmployee(person: EmployeeRecord): void {
    this.saving.set(true);
    this.error.set(null);
    this.employeesApi.deleteEmployee(person.employeeID).subscribe({
      next: () => {
        this.saving.set(false);
        this.employees.update((list) => list.filter((item) => item.employeeID !== person.employeeID));
        this.assignments.update((rows) => rows.filter((row) => row.employeeID !== person.employeeID));
        this.notice.set(`${person.fullName} was deleted.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(readError(err, 'Could not delete the employee.'));
      }
    });
  }

  deleteUser(user: UserRecord): void {
    const mine = this.auth.currentUser()?.email?.trim().toLowerCase();
    if (mine && user.email.trim().toLowerCase() === mine) {
      this.error.set('You cannot delete the account you are using.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.usersApi.deleteUser(user.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.users.update((list) => list.filter((item) => item.id !== user.id));
        this.notice.set(`${user.fullName} was deleted.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(readError(err, 'Could not delete the user.'));
      }
    });
  }

  saveEmployee(): void {
    this.employeeStrict.set(true);
    const value = this.employeeDraft();
    if (hasText(this.employeeFieldWarnings())) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const code = value.employeeCode.trim().toLowerCase();
    const email = value.email.trim().toLowerCase();
    const duplicate = this.employees().some(
      (person) => person.employeeCode.toLowerCase() === code || person.email.toLowerCase() === email
    );
    if (duplicate) {
      this.saving.set(false);
      this.error.set('An employee with this code already exists.');
      return;
    }
    this.employeesApi.addEmployee({ ...value, salary: Number(value.salary) }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notice.set('Employee added.');
        this.employeeDraft.set(emptyEmployee());
        this.employeeStrict.set(false);
        this.loadAll();
        this.view.set('employees');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(readError(err, 'Could not add the employee.'));
      }
    });
  }

  saveNewUser(): void {
    this.userStrict.set(true);
    const value = this.userDraft();
    if (hasText(this.userFieldWarnings())) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.usersApi
      .addUser({
        fullName: value.fullName.trim(),
        email: value.email.trim(),
        password: value.password,
        role: value.role
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notice.set('User added.');
          this.userDraft.set(emptyUser());
          this.userStrict.set(false);
          this.loadUsers();
          this.open('users');
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(readError(err, 'Could not add the user.'));
        }
      });
  }

  usedOn(employeeId: number, day = todayKey()): number {
    return this.assignments()
      .filter((row) => row.employeeID === employeeId && covers(row, day))
      .reduce((sum, row) => sum + Number(row.allocationPercentage), 0);
  }

  freeOn(employeeId: number): string | null {
    const rows = this.assignments().filter((row) => row.employeeID === employeeId);
    if (this.usedOn(employeeId) < 100) {
      return todayKey();
    }
    const candidates = rows
      .map((row) => row.endDate?.slice(0, 10))
      .filter((day): day is string => !!day)
      .map((day) => addDays(day, 1))
      .filter((day) => day >= todayKey())
      .sort();
    return candidates.find((day) => this.usedOn(employeeId, day) < 100) ?? null;
  }

  saveAssignment(): void {
    this.assignStrict.set(true);
    const value = this.assignDraft();
    const start = value.startDate;
    if (hasText(this.assignFieldWarnings())) {
      this.error.set('Fix the warnings before you save.');
      return;
    }
    const remaining = this.freeShare();
    const requested = Number(value.allocationPercentage);
    if (requested > 100) {
      this.error.set('Work share cannot be more than 100%.');
      return;
    }
    if (remaining <= 0) {
      this.error.set('This person is fully booked for those dates.');
      return;
    }
    if (requested > remaining) {
      this.error.set(`Only ${remaining}% is free in that date range.`);
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.assignmentsApi
      .assign({
        employeeID: value.employeeID,
        projectID: value.projectID,
        role: value.role,
        allocationPercentage: requested,
        startDate: value.startDate,
        endDate: value.endDate || null
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.notice.set(res.message || 'Person was put on the project.');
          this.assignDraft.set(emptyAssign());
          this.assignStrict.set(false);
          this.loadAll();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(readError(err, 'Could not assign the person.'));
        }
      });
  }

  private loadAll(): void {
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
      error: () => this.error.set('People list could not be loaded.')
    });
    this.assignmentsApi.getAll().subscribe({
      next: (items) => this.assignments.set(items ?? []),
      error: () => this.assignments.set([])
    });
    this.loadUsers();
  }

  private loadUsers(): void {
    this.usersApi.getUsers().subscribe({
      next: (items) => this.users.set(items),
      error: () => this.error.set('Users could not be loaded.')
    });
  }
}

interface ProjectDraft {
  projectCode: string;
  projectName: string;
  clientID: number;
  departmentID: number;
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
}

interface EmployeeDraft {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  departmentID: number;
  positionID: number;
  locationID: number;
}

interface UserDraft {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

interface AssignDraft {
  employeeID: number;
  projectID: number;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

function emptyProject(): ProjectDraft {
  return {
    projectCode: '',
    projectName: '',
    clientID: 0,
    departmentID: 0,
    startDate: todayKey(),
    endDate: '',
    budget: 0,
    status: 'Active'
  };
}

function emptyEmployee(): EmployeeDraft {
  return {
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: '',
    salary: 0,
    departmentID: 0,
    positionID: 0,
    locationID: 0
  };
}

function emptyUser(): UserDraft {
  return { fullName: '', email: '', password: '', role: 'Viewer' };
}

function emptyAssign(): AssignDraft {
  return { employeeID: 0, projectID: 0, role: '', allocationPercentage: 1, startDate: todayKey(), endDate: '' };
}

function projectFieldWarnings(value: ProjectDraft, strict: boolean): ProjectDraftWarnings {
  const code = value.projectCode.trim();
  return {
    projectCode: code && !/^PRJ\d{3,}$/i.test(code) ? 'Code must look like PRJ001' : !code && strict ? 'Code is needed' : '',
    projectName: value.projectName.trim() ? '' : strict ? 'Name is needed' : '',
    clientID: value.clientID > 0 ? '' : strict ? 'Pick a client' : '',
    departmentID: value.departmentID > 0 ? '' : strict ? 'Pick a department' : '',
    endDate: value.endDate && value.startDate && value.endDate < value.startDate ? 'Due date is before the start date' : '',
    budget: Number(value.budget) < 0 ? 'Budget cannot be less than 0' : ''
  };
}

function employeeFieldWarnings(value: EmployeeDraft, today: string, strict: boolean): EmployeeDraftWarnings {
  const code = value.employeeCode.trim();
  const email = value.email.trim();
  return {
    employeeCode: code && !/^EMP\d{3}$/.test(code) ? 'Code must look like EMP001' : !code && strict ? 'Code is needed' : '',
    firstName: value.firstName.trim() ? '' : strict ? 'First name is needed' : '',
    lastName: value.lastName.trim() ? '' : strict ? 'Last name is needed' : '',
    email: email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Email is not valid' : !email && strict ? 'Email is needed' : '',
    phone: value.phone && !/^[0-9+\-\s]{7,20}$/.test(value.phone) ? 'Phone is not valid' : '',
    hireDate: !value.hireDate ? (strict ? 'Hire date is needed' : '') : value.hireDate > today ? 'Hire date cannot be in the future' : '',
    salary: Number(value.salary) > 0 ? '' : strict ? 'Salary must be more than 0' : '',
    departmentID: value.departmentID > 0 ? '' : strict ? 'Pick a department' : '',
    positionID: value.positionID > 0 ? '' : strict ? 'Pick a position' : '',
    locationID: value.locationID > 0 ? '' : strict ? 'Pick a location' : ''
  };
}

function userFieldWarnings(value: UserDraft, strict: boolean): UserDraftWarnings {
  const email = value.email.trim();
  return {
    fullName: value.fullName.trim() ? '' : strict ? 'Name is needed' : '',
    email: email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Email is not valid' : !email && strict ? 'Email is needed' : '',
    password: value.password && value.password.length < 6 ? 'Password needs at least 6 characters' : !value.password && strict ? 'Password is needed' : ''
  };
}

function assignFieldWarnings(value: AssignDraft, today: string, free: number, strict: boolean): AssignDraftWarnings {
  const share = Number(value.allocationPercentage);
  return {
    employeeID: value.employeeID > 0 ? '' : strict ? 'Pick a person' : '',
    projectID: value.projectID > 0 ? '' : strict ? 'Pick a project' : '',
    role: value.role.trim() ? '' : strict ? 'Job on project is needed' : '',
    allocationPercentage: share < 1 || share > 100 ? 'Work share must be from 1 to 100' : share > free ? `Only ${free}% is free` : '',
    startDate: !value.startDate ? (strict ? 'Start date is needed' : '') : value.startDate < today ? 'Start date cannot be before today' : '',
    endDate: value.endDate && value.startDate && value.endDate < value.startDate ? 'End date is before the start date' : ''
  };
}

function hasText(warnings: object): boolean {
  return Object.values(warnings).some((text) => !!text);
}

interface ProjectDraftWarnings {
  projectCode: string;
  projectName: string;
  clientID: string;
  departmentID: string;
  endDate: string;
  budget: string;
}

interface EmployeeDraftWarnings {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: string;
  departmentID: string;
  positionID: string;
  locationID: string;
}

interface UserDraftWarnings {
  fullName: string;
  email: string;
  password: string;
}

interface AssignDraftWarnings {
  employeeID: string;
  projectID: string;
  role: string;
  allocationPercentage: string;
  startDate: string;
  endDate: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(day: string, count: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

function covers(row: AssignmentRecord, day: string): boolean {
  const start = row.startDate.slice(0, 10);
  const end = row.endDate ? row.endDate.slice(0, 10) : '9999-12-31';
  return start <= day && day <= end;
}

function peakOverlap(rows: AssignmentRecord[], employeeId: number, start: string, end: string): number {
  const mine = rows.filter((row) => row.employeeID === employeeId);
  const points = new Set<string>([start]);
  for (const row of mine) {
    const rowStart = row.startDate.slice(0, 10);
    if (rowStart >= start && rowStart <= end) {
      points.add(rowStart);
    }
  }
  let peak = 0;
  for (const day of points) {
    const used = mine
      .filter((row) => covers(row, day) && covers({ ...row, startDate: start, endDate: end }, day))
      .reduce((sum, row) => sum + Number(row.allocationPercentage), 0);
    peak = Math.max(peak, used);
  }
  const usedAtStart = mine.filter((row) => covers(row, start)).reduce((sum, row) => sum + Number(row.allocationPercentage), 0);
  return Math.max(peak, usedAtStart);
}

function readError(err: { error?: { message?: string; Message?: string; title?: string } }, fallback: string): string {
  return err.error?.message || err.error?.Message || err.error?.title || fallback;
}
