import { Component, inject, OnInit } from '@angular/core';
import { EmployeeService } from '../../core/services/employee.service';
import { ProjectService } from '../../core/services/project.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { WarehouseState } from '../../core/state/warehouse.state';
import { WorkspaceComponent } from '../../shared/components/workspace/workspace';
import { ProjectBoardComponent } from '../../shared/components/project-board/project-board';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [WorkspaceComponent, ProjectBoardComponent],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.scss'
})
export class ManagerDashboardComponent implements OnInit {
  private readonly projectsApi = inject(ProjectService);
  private readonly assignmentsApi = inject(AssignmentService);
  private readonly employeesApi = inject(EmployeeService);
  private readonly state = inject(WarehouseState);

  readonly projects = this.state.projects;
  readonly assignments = this.state.assignments;
  readonly employees = this.state.employees;
  readonly selectedId = this.state.selectedId;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  ngOnInit(): void {
    this.projectsApi.getProjects().subscribe({
      next: (page) => {
        const items = page.items ?? [];
        this.projects.set(items);
        this.loading.set(false);
        if (items[0]) {
          this.openProject(items[0].projectID);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Projects could not be loaded for the Manager role.');
      }
    });

    this.employeesApi.getDirectory().subscribe({
      next: (page) => this.employees.set(page.items ?? []),
      error: () => this.error.set('The employee directory is not available for this session.')
    });
  }

  openProject(projectId: number): void {
    this.selectedId.set(projectId);
    this.assignmentsApi.getByProject(projectId).subscribe({
      next: (rows) => this.assignments.set(rows),
      error: () => this.assignments.set([])
    });
  }
}
