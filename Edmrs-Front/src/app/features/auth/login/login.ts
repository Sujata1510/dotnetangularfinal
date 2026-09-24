import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 80vh;">
      <div style="width: 100%; max-width: 400px; padding: 30px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
        <h2>EDMRS Portal Sign In</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Enter your credentials to access your dashboard</p>

        <div *ngIf="errorMessage()" style="padding: 10px; background: #f8d7da; color: #721c24; border-radius: 4px; margin-bottom: 15px;">
          {{ errorMessage() }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email Address</label>
            <input type="email" formControlName="email" placeholder="admin@edmrs.com" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" />
            <small *ngIf="email?.invalid && email?.touched" style="color: red; font-size: 12px;">Valid email is required</small>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Password</label>
            <input type="password" formControlName="password" placeholder="••••••••" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;" />
            <small *ngIf="password?.invalid && password?.touched" style="color: red; font-size: 12px;">Password is required</small>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading()" style="width: 100%; padding: 12px; background: #0056b3; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectUserByRole();
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value as any).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.isSuccess) {
          this.authService.redirectUserByRole();
        } else {
          this.errorMessage.set(res.message || 'Authentication failed.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 0) {
          this.errorMessage.set('Cannot reach .NET API server. Check if API is running & CORS is enabled.');
        } else {
          this.errorMessage.set(err.error?.message || 'Invalid email or password.');
        }
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}