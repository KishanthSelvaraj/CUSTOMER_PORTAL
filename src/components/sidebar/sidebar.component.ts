import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  children?: SidebarItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar" [class.sidebar-collapsed]="collapsed">
      <div class="sidebar-header">
        <button class="sidebar-toggle" (click)="toggleSidebar()">
          <span class="toggle-icon">{{ collapsed ? '→' : '←' }}</span>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div *ngFor="let item of sidebarItems" class="nav-group">
          <div
            class="nav-item"
            [class.nav-item-active]="activeItem === item.id && !item.children"
            [class.nav-item-parent]="item.children && item.children.length > 0"
            [class.nav-item-expanded]="item.expanded"
            (click)="selectItem(item)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
            <span class="nav-expand-icon" *ngIf="item.children && !collapsed">
              {{ item.expanded ? '▼' : '▶' }}
            </span>
          </div>
          
          <div class="nav-children" *ngIf="item.children && item.expanded && !collapsed">
            <div
              *ngFor="let child of item.children"
              class="nav-child-item"
              [class.nav-child-item-active]="activeItem === child.id"
              (click)="selectItem(child)"
            >
              <span class="nav-child-connector"></span>
              <span class="nav-child-icon">{{ child.icon }}</span>
              <span class="nav-child-label">{{ child.label }}</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      background: var(--secondary-bg);
      border-right: 1px solid var(--border-color);
      width: 280px;
      height: 100%;
      transition: width 0.3s ease;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    }

    .sidebar-collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
    }

    .sidebar-toggle {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 10px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .sidebar-toggle:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
      border-color: var(--accent-color);
    }

    .toggle-icon {
      font-size: 12px;
      font-weight: bold;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-group {
      margin-bottom: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      font-weight: 500;
      position: relative;
    }

    .nav-item:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
      border-left-color: var(--accent-color);
    }

    .nav-item-active {
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent-color);
      border-left-color: var(--accent-color);
      font-weight: 600;
    }

    .nav-item-parent {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 15px;
      background: var(--card-bg);
      margin: 8px 12px;
      border-radius: 8px;
      border-left: none;
    }

    .nav-item-parent:hover {
      background: var(--hover-bg);
      border-left: none;
    }

    .nav-item-expanded {
      background: var(--hover-bg);
    }

    .nav-icon {
      font-size: 18px;
      margin-right: 12px;
      min-width: 18px;
      text-align: center;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      flex: 1;
    }

    .nav-expand-icon {
      font-size: 10px;
      margin-left: auto;
      transition: transform 0.2s ease;
    }

    .nav-children {
      background: var(--primary-bg);
      margin: 0 12px 8px 12px;
      border-radius: 0 0 8px 8px;
      border: 1px solid var(--border-color);
      border-top: none;
    }

    .nav-child-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      position: relative;
    }

    .nav-child-item:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }

    .nav-child-item-active {
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-color);
      font-weight: 600;
    }

    .nav-child-connector {
      width: 2px;
      height: 100%;
      background: var(--border-color);
      position: absolute;
      left: 8px;
      top: 0;
    }

    .nav-child-item-active .nav-child-connector {
      background: var(--accent-color);
    }

    .nav-child-icon {
      font-size: 14px;
      margin-right: 10px;
      margin-left: 16px;
      min-width: 14px;
      text-align: center;
    }

    .nav-child-label {
      white-space: nowrap;
      overflow: hidden;
    }

    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
      }
      
      .sidebar-collapsed {
        width: 60px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 60px;
        bottom: 0;
        z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.sidebar-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() activeItem = 'dashboard';
  @Output() itemSelected = new EventEmitter<string>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      id: 'inquiry',
      label: 'Inquiries',
      icon: '📋'
    },
    {
      id: 'sales',
      label: 'Sales Orders',
      icon: '📄'
    },
    {
      id: 'delivery',
      label: 'Delivery Details',
      icon: '📦'
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: '💰',
      expanded: false,
      children: [
        { id: 'invoice', label: 'Invoices', icon: '🧾' },
        { id: 'payment', label: 'Payment & Aging', icon: '💳' },
        { id: 'memo', label: 'Credit/Debit Memo', icon: '📝' },
        { id: 'overall', label: 'Overall Data', icon: '📈' }
      ]
    }
  ];

  selectItem(item: SidebarItem): void {
    if (item.children && item.children.length > 0) {
      // Toggle expansion for parent items
      item.expanded = !item.expanded;
      return;
    }
    
    this.activeItem = item.id;
    this.itemSelected.emit(item.id);
  }

  toggleSidebar(): void {
    this.toggleCollapsed.emit();
  }
}