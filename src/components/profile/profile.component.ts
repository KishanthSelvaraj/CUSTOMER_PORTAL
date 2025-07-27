import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Vendor } from '../../models/vendor.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="profile-container" *ngIf="vendor">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            {{ getInitials(vendor.name) }}
          </div>
          <div class="profile-title">
            <h2>{{ vendor.name }}</h2>
            <p class="vendor-id">
              <mat-icon class="id-icon">badge</mat-icon>
              Vendor ID: {{ vendor.customerId }}
            </p>
            <div class="profile-status">
              <span class="status-badge active">
                <mat-icon>check_circle</mat-icon>
                Active Account
              </span>
              <span class="last-login">
                <mat-icon>schedule</mat-icon>
                Last login: {{ lastLoginTime }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="profile-content">
          <div class="profile-section">
            <h3>
              <mat-icon class="section-icon">business</mat-icon>
              Company Information
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <label>
                  <mat-icon class="info-icon">apartment</mat-icon>
                  Company Name
                </label>
                <span>{{ vendor.name }}</span>
              </div>
              <div class="info-item">
                <label>
                  <mat-icon class="info-icon">fingerprint</mat-icon>
                  Vendor ID
                </label>
                <span>{{ vendor.customerId }}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-section">
            <h3>
              <mat-icon class="section-icon">location_on</mat-icon>
              Location Details
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <label>
                  <mat-icon class="info-icon">location_city</mat-icon>
                  City
                </label>
                <span>{{ vendor.city || 'Not specified' }}</span>
              </div>
              <div class="info-item">
                <label>
                  <mat-icon class="info-icon">public</mat-icon>
                  Country
                </label>
                <span>{{ vendor.country || 'Not specified' }}</span>
              </div>
              <div class="info-item">
                <label>
                  <mat-icon class="info-icon">markunread_mailbox</mat-icon>
                  Pincode
                </label>
                <span>{{ vendor.pincode || 'Not specified' }}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-section" *ngIf="vendor.email || vendor.phone">
            <h3>
              <mat-icon class="section-icon">contacts</mat-icon>
              Contact Information
            </h3>
            <div class="info-grid">
              <div class="info-item" *ngIf="vendor.email">
                <label>
                  <mat-icon class="info-icon">email</mat-icon>
                  Email
                </label>
                <span>
                  <a href="mailto:{{ vendor.email }}" class="contact-link">
                    {{ vendor.email }}
                  </a>
                </span>
              </div>
              <div class="info-item" *ngIf="vendor.phone">
                <label>
                  <mat-icon class="info-icon">call</mat-icon>
                  Phone
                </label>
                <span>
                  <a href="tel:{{ vendor.phone }}" class="contact-link">
                    {{ vendor.phone }}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-actions">
        <button mat-raised-button color="primary" class="action-button">
          <mat-icon>edit</mat-icon>
          Edit Profile
        </button>
        <button mat-stroked-button color="primary" class="action-button">
          <mat-icon>lock</mat-icon>
          Change Password
        </button>
        <button mat-stroked-button color="warn" class="action-button">
          <mat-icon>logout</mat-icon>
          Sign Out
        </button>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .profile-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
      font-family: 'Inter', sans-serif;
    }

    .profile-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      overflow: hidden;
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .profile-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.12);
    }

    .profile-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 3rem 2.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      position: relative;
      overflow: hidden;
    }

    .profile-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      border: 3px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(5px);
      z-index: 1;
      flex-shrink: 0;
    }

    .profile-title {
      z-index: 1;
    }

    .profile-title h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.5px;
    }

    .vendor-id {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .id-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .profile-status {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .status-badge mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .last-login {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .last-login mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .profile-content {
      padding: 2.5rem;
    }

    .profile-section {
      margin-bottom: 2.5rem;
    }

    .profile-section:last-child {
      margin-bottom: 0;
    }

    .profile-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-icon {
      color: #3b82f6;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .info-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }

    .info-item label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #94a3b8;
    }

    .info-item span {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
      line-height: 1.5;
    }

    .contact-link {
      color: #3b82f6;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .contact-link:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    .profile-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-button mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 0 1rem;
      }

      .profile-header {
        padding: 2rem 1.5rem;
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }
      
      .profile-avatar {
        width: 80px;
        height: 80px;
        font-size: 1.8rem;
      }
      
      .profile-title h2 {
        font-size: 1.5rem;
      }
      
      .profile-content {
        padding: 1.5rem;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .profile-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
      
      .action-button {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .profile-status {
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  vendor: Vendor | null = null;
  lastLoginTime: string = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.vendor = this.authService.getCurrentVendor();
    // Simulate last login time (in a real app, this would come from your auth service)
    const now = new Date();
    this.lastLoginTime = now.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }
}