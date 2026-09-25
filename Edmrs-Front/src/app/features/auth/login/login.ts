import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly mode = signal<'login' | 'register'>('login');

  readonly registerDraft = signal({ employeeCode: '', password: '' });
  readonly registerWarnings = computed(() => {
    const value = this.registerDraft();
    const code = value.employeeCode.trim();
    const codeOk = /^EMP\d{3}$/i.test(code) || /^\d+$/.test(code);
    return {
      employeeCode: code && !codeOk ? 'Employee ID must look like EMP001' : '',
      password: value.password && value.password.length < 6 ? 'Password needs at least 6 characters' : ''
    };
  });

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectUserByRole();
    }
  }

  showRegister(): void {
    this.mode.set('register');
    this.errorMessage.set(null);
    this.notice.set(null);
  }

  showLogin(): void {
    this.mode.set('login');
    this.errorMessage.set(null);
  }

  setRegister<K extends 'employeeCode' | 'password'>(key: K, value: string): void {
    this.registerDraft.update((draft) => ({ ...draft, [key]: value }));
    this.errorMessage.set(null);
  }

  onRegister(): void {
    const value = this.registerDraft();
    const warnings = this.registerWarnings();
    if (!value.employeeCode.trim() || value.password.length < 6 || warnings.employeeCode || warnings.password) {
      this.errorMessage.set('Fix the fields before you register.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.notice.set(null);
    this.authService
      .register({
        employeeCode: value.employeeCode.trim(),
        password: value.password
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.notice.set(res.message || 'You are registered as a Viewer. Sign in to continue.');
          this.mode.set('login');
        },
        error: (err: { status?: number; error?: { message?: string } }) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Could not register.');
        }
      });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.authService.redirectUserByRole();
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.authService.clearSession();
        if (err.status === 0) {
          this.errorMessage.set('Cannot reach the API. Confirm it is running and CORS allows http://localhost:4200.');
        } else if (err.status === 401) {
          this.errorMessage.set(err.error?.message || 'Invalid email or password.');
        } else {
          this.errorMessage.set(err.error?.message || 'Sign in failed. Try again.');
        }
      }
    });
  }
}
