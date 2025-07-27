import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card fade-in">
        <div class="login-header">
          <h1>Vendor Portal</h1>
          <p>Sign in to access your dashboard</p>
        </div>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="vendorId">Vendor ID</label>
            <input
              type="text"
              id="vendorId"
              name="vendorId"
              [(ngModel)]="credentials.vendorId"
              required
              class="form-control"
              placeholder="Enter your vendor ID"
              [disabled]="isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              required
              class="form-control"
              placeholder="Enter your password"
              [disabled]="isLoading"
            />
          </div>
          
          <button
            type="submit"
            class="login-button"
            [disabled]="!loginForm.valid || isLoading"
          >
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
      
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
      padding: 20px;
    }

    .login-card {
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--border-color);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .login-header p {
      color: var(--text-secondary);
      font-size: 16px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s ease;
      background-color: var(--secondary-bg);
      color: var(--text-primary);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--accent-color);
      background-color: var(--card-bg);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-button {
      width: 100%;
      padding: 14px 24px;
      background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    }

    .login-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .loading-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .login-footer {
      text-align: center;
      padding: 16px;
      background-color: var(--secondary-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .login-footer p {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 2px 0;
    }

    .login-footer p:first-child {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px;
        margin: 20px;
      }
      
      .login-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent {
  credentials = { vendorId: '', password: '' };
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

onLogin(): void {
  if (!this.credentials.vendorId || !this.credentials.password) {
    this.toastService.error('Please enter both vendor ID and password');
    return;
  }

  // ✅ Skip API and login directly if vendorId and password are 'admin'
  if (this.credentials.vendorId === 'admin' && this.credentials.password === 'admin') {
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;

      // Dummy session values
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('customerId', '0000001234');

      this.toastService.success('Login successful');

      // Redirect to dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    }, 1000);

    return; // Exit early to avoid calling real API
  }

  // ❌ Comment out or disable real API call for testing
  /*
  this.isLoading = true;

  this.authService.login(this.credentials).subscribe({
    next: (result) => {
      this.isLoading = false;
      if (result.success) {
        this.toastService.success(result.message);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } else {
        this.toastService.error(result.message);
      }
    },
    error: (error) => {
      this.isLoading = false;
      this.toastService.error('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  });
  */
}

}