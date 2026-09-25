import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  AssignmentRecord,
  BoardBucket,
  ProjectRecord,
  boardBucket,
  statusTone
} from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-project-board',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './project-board.html',
  styleUrl: './project-board.scss'
})
export class ProjectBoardComponent {
  readonly projects = input<ProjectRecord[]>([]);
  readonly assignments = input<AssignmentRecord[]>([]);
  readonly selectedId = input<number | null>(null);
  readonly showBudget = input(false);
  readonly showAssigneeCode = input(false);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly selected = output<number>();

  readonly buckets: { id: BoardBucket; label: string }[] = [
    { id: 'todo', label: 'To do' },
    { id: 'doing', label: 'Doing' },
    { id: 'done', label: 'Done' }
  ];

  projectsIn(bucket: BoardBucket): ProjectRecord[] {
    return this.projects().filter((project) => boardBucket(project.status) === bucket);
  }

  tone(status: string): string {
    return statusTone(status);
  }

  selectedProject(): ProjectRecord | undefined {
    return this.projects().find((project) => project.projectID === this.selectedId());
  }
}
