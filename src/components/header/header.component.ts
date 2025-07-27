import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Vendor } from '../../models/vendor.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
 <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="header-title">Customer Portal</h1>
        </div>

        <div class="header-right" *ngIf="currentVendor">
          <div class="profile-section">
            <button class="profile-button" (click)="toggleProfileModal()">
              <div class="profile-avatar">
                {{ getInitials(currentVendor.name) }}
              </div>
              <span class="profile-name">{{ currentVendor.name }}</span>
              <span class="profile-arrow">{{ showProfileModal ? '▲' : '▼' }}</span>
            </button>
          </div>

          <button class="logout-button" (click)="logout()">
            <span class="logout-icon">⏻</span>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Profile Modal -->
    <div
      class="profile-modal-overlay"
      *ngIf="showProfileModal && currentVendor"
      (click)="closeProfileModal()"
    >
      <div class="profile-modal" (click)="$event.stopPropagation()">
        <div class="profile-modal-header">
          <div class="profile-modal-avatar">
            {{ getInitials(currentVendor?.name || '') }}
          </div>
          <div class="profile-modal-title">
            <h2>{{ currentVendor?.name }}</h2>
            <p class="vendor-id">{{ currentVendor?.customerId }}</p>
          </div>
          <button class="close-button" (click)="closeProfileModal()">×</button>
        </div>

        <div class="profile-modal-content">
          <div class="profile-section">
            <h3>Company Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Company Name</label>
                <span>{{ currentVendor?.name || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Vendor ID</label>
                <span>{{ currentVendor?.customerId || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <h3>Location Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>City</label>
                <span>{{ currentVendor?.city || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Country</label>
                <span>{{ currentVendor?.country || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Pincode</label>
                <span>{{ currentVendor?.pincode || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="profile-section" *ngIf="currentVendor?.email || currentVendor?.phone">
            <h3>Contact Information</h3>
            <div class="info-grid">
              <div class="info-item" *ngIf="currentVendor?.email">
                <label>Email</label>
                <span>{{ currentVendor?.email }}</span>
              </div>
              <div class="info-item" *ngIf="currentVendor?.phone">
                <label>Phone</label>
                <span>{{ currentVendor?.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header {
      background: var(--secondary-bg);
      color: var(--text-primary);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--border-color);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .profile-section {
      position: relative;
    }

    .profile-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }

    .profile-button:hover {
      background: var(--hover-bg);
      border-color: var(--accent-color);
    }

    .profile-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }

    .profile-name {
      font-size: 14px;
      font-weight: 500;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-arrow {
      font-size: 10px;
      color: var(--text-muted);
    }

    .logout-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;
    }

    .logout-button:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.5);
    }

    .logout-icon {
      font-size: 16px;
    }

    /* Profile Modal Styles */
    .profile-modal-header {
      background: var(--accent-color);
      color: white;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
    }

    .profile-modal-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .profile-modal-title h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .vendor-id {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }

    .close-button {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .profile-modal-content {
      padding: 24px;
    }

    .profile-section {
      margin-bottom: 24px;
    }

    .profile-section:last-child {
      margin-bottom: 0;
    }

    .profile-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 12px 16px;
      }
      
      .header-title {
        font-size: 18px;
      }
      
      .profile-name {
        display: none;
      }
      
      .logout-button {
        padding: 6px 12px;
        font-size: 12px;
      }

      .profile-modal {
        margin: 20px;
        max-width: calc(100vw - 40px);
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentVendor: Vendor | null = null;
  showProfileModal = false;
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.currentVendor$.subscribe((vendor) => {
      this.currentVendor = vendor;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getInitials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  toggleProfileModal(): void {
    this.showProfileModal = !this.showProfileModal;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('You have been logged out successfully');
    this.router.navigate(['/login']);
  }
}