import { Component, input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-workspace',
  standalone: true,
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss'
})
export class WorkspaceComponent {
  readonly auth = inject(AuthService);
  readonly roleLabel = input.required<string>();
  readonly section = input('Projects');
}
