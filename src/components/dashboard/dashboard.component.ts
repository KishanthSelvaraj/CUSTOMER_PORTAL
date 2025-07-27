import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DataTableComponent, TableColumn } from '../data-table/data-table.component';
import { ProfileComponent } from '../profile/profile.component';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    SidebarComponent, 
    DataTableComponent, 
    ProfileComponent,
    BaseChartDirective
  ],
  template: `
    <div class="dashboard-layout">
      <app-header></app-header>
      
      <div class="dashboard-content">
        <app-sidebar
          [collapsed]="sidebarCollapsed"
          [activeItem]="activeSection"
          (itemSelected)="onSectionChange($event)"
          (toggleCollapsed)="toggleSidebar()"
        ></app-sidebar>
        
        <main class="main-content" [class.main-content-expanded]="sidebarCollapsed">
          <div class="content-header fade-in">
            <h1 class="content-title">{{ getSectionTitle() }}</h1>
            <p class="content-description">{{ getSectionDescription() }}</p>
            
            <!-- Display customer info for memo section -->
            <div *ngIf="activeSection === 'memo' && currentData.length > 0" class="customer-info">
              <h3>Customer: {{ currentData[0].customerName }} (ID: {{ currentData[0].customerId }})</h3>
            </div>
          </div>
          
          <div class="content-body">
            <!-- Dashboard Overview -->
            <div *ngIf="activeSection === 'dashboard'" class="dashboard-overview fade-in">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">📋</div>
                  <div class="stat-content">
                    <h3>Active Inquires</h3>
                    <p class="stat-number">{{ rfqCount }}</p>
                    <span class="stat-change positive">+{{ rfqCount }} total</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📄</div>
                  <div class="stat-content">
                    <h3>Purchase Orders</h3>
                    <p class="stat-number">{{ poCount }}</p>
                    <span class="stat-change neutral">{{ poCount }} active</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">💰</div>
                  <div class="stat-content">
                    <h3>Invoices</h3>
                    <p class="stat-number">{{ invoiceCount }}</p>
                    <span class="stat-change positive">{{ invoiceCount }} pending</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📦</div>
                  <div class="stat-content">
                    <h3>Delivery Details</h3>
                    <p class="stat-number">{{ grCount }}</p>
                    <span class="stat-change positive">{{ grCount }} received</span>
                  </div>
                </div>
              </div>
              
              <div class="dashboard-charts">
                <div class="chart-placeholder">
                  <h3>Recent Activity</h3>
                  <p>Your recent transactions and updates will appear here</p>
                </div>
              </div>
            </div>
            
            <!-- Profile Section -->
            <app-profile *ngIf="activeSection === 'profile'" class="fade-in"></app-profile>
            
            <!-- Data Tables -->
            <div *ngIf="shouldShowTable() && activeSection !== 'overall'" class="table-section fade-in">
              <app-data-table
                [data]="currentData"
                [columns]="currentColumns"
                [pageSize]="10"
                [showDownload]="activeSection === 'invoice'"
                (downloadPDF)="downloadInvoicePDF($event)"
              ></app-data-table>
            </div>
            
            <!-- Overall Data Charts -->
            <div *ngIf="activeSection === 'overall'" class="charts-container fade-in">
              <div class="chart-row">
                <div class="chart-card">
                  <h3>Orders vs Invoices</h3>
                  <div class="chart-wrapper">
                    <canvas baseChart
                      [data]="pieChartData"
                      [type]="'pie'"
                      [options]="pieChartOptions"
                      [plugins]="pieChartPlugins"
                      [legend]="true">
                    </canvas>
                  </div>
                </div>
                
                <div class="chart-card">
                  <h3>Financial Overview ({{currency}})</h3>
                  <div class="chart-wrapper">
                    <canvas baseChart
                      [datasets]="barChartData"
                      [labels]="barChartLabels"
                      [options]="barChartOptions"
                      [plugins]="barChartPlugins"
                      [legend]="true"
                      [type]="'bar'">
                    </canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="isLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--primary-bg);
    }

    .dashboard-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      transition: all 0.3s ease;
    }

    .main-content-expanded {
      margin-left: 0;
    }

    .content-header {
      background: var(--secondary-bg);
      padding: 32px 40px 24px;
      border-bottom: 1px solid var(--border-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .content-title {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .content-description {
      font-size: 16px;
      color: var(--text-secondary);
      margin: 0;
    }

    .content-body {
      flex: 1;
      padding: 32px 40px;
    }

    /* Dashboard Overview */
    .dashboard-overview {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: var(--card-bg);
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      border-color: var(--accent-color);
    }

    .stat-icon {
      font-size: 32px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
      border-radius: 12px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .stat-change {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
    }

    .stat-change.positive {
      background: rgba(16, 185, 129, 0.2);
      color: var(--success-color);
    }

    .stat-change.negative {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error-color);
    }

    .stat-change.neutral {
      background: var(--hover-bg);
      color: var(--text-secondary);
    }

    .dashboard-charts {
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .chart-placeholder {
      padding: 40px;
      text-align: center;
      color: var(--text-secondary);
    }

    .chart-placeholder h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    .table-section {
      animation: fadeIn 0.3s ease-in-out;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-radius: 50%;
      border-top-color: var(--accent-color);
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    /* Charts Container */
    .charts-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .chart-card {
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      padding: 24px;
      transition: all 0.2s ease;
    }

    .chart-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .chart-card h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--text-primary);
      text-align: center;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 1200px) {
      .content-header, .content-body {
        padding-left: 24px;
        padding-right: 24px;
      }
    }

    @media (max-width: 768px) {
      .content-header, .content-body {
        padding-left: 16px;
        padding-right: 16px;
      }
      
      .content-title {
        font-size: 24px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .stat-card {
        padding: 16px;
      }

      .chart-row {
        grid-template-columns: 1fr;
      }

      .chart-card {
        padding: 16px;
      }

      .chart-wrapper {
        height: 250px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  sidebarCollapsed = false;
  activeSection = 'dashboard';
  currentData: any[] = [];
  currentColumns: TableColumn[] = [];
  isLoading = false;
  vendorId = '';
  currency: string = '';

  // Dashboard stats
  rfqCount = 0;
  poCount = 0;
  invoiceCount = 0;
  grCount = 0;

  // Chart data for overall section
  pieChartData: ChartData<'pie', number[], string> = {
    labels: ['Total Orders', 'Total Invoices'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#FF6384', '#36A2EB']
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };
  pieChartPlugins = [];

  barChartData = [
    { 
      data: [0, 0, 0],
      label: 'Financial Data',
      backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40']
    }
  ];
  barChartLabels: string[] = ['Total Sales', 'Total Payments', 'Best Payment'];
  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    }
  };
  barChartPlugins = [];

  // Column definitions for different sections
  private readonly columnDefinitions = {
    inquiry: [
      { key: 'inquiryNumber', label: 'Inquiry Number', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { key: 'material', label: 'Material', sortable: true },
      { key: 'quantity', label: 'Quantity', type: 'number' as const, sortable: true },
      { key: 'unit', label: 'Unit', sortable: true },
      { key: 'requestDate', label: 'Request Date', type: 'date' as const, sortable: true },
      { key: 'issueDate', label: 'Issue Date', type: 'date' as const, sortable: true },
      { key: 'dueDate', label: 'Due Date', type: 'date' as const, sortable: true },
      { key: 'amount', label: 'Amount', type: 'currency' as const, sortable: true },
      { key: 'currency', label: 'Currency', sortable: true },
      { key: 'status', label: 'Status', type: 'status' as const, sortable: true }
    ],
    sales: [
      { key: 'salesNumber', label: 'Sales Number', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { key: 'material', label: 'Material', sortable: true },
      { key: 'quantity', label: 'Quantity', type: 'number' as const, sortable: true },
      { key: 'unit', label: 'Unit', sortable: true },
      { key: 'requestDate', label: 'Request Date', type: 'date' as const, sortable: true },
      // { key: 'issueDate', label: 'Issue Date', type: 'date' as const, sortable: true },
      // { key: 'dueDate', label: 'Due Date', type: 'date' as const, sortable: true },
      { key: 'amount', label: 'Amount', type: 'currency' as const, sortable: true },
      { key: 'currency', label: 'Currency', sortable: true },
      { key: 'status', label: 'Status', type: 'status' as const, sortable: true }
    ],
    delivery: [
      { key: 'deliveryNumber', label: 'Delivery Number', sortable: true },
      // { key: 'createdBy', label: 'Created By', sortable: true },
      { key: 'deliveryDate', label: 'Delivery Date', type: 'date' as const, sortable: true },
      { key: 'shippingPoint', label: 'Shipping Point', sortable: true },
      { key: 'deliveryType', label: 'Delivery Type', sortable: true },
      { key: 'position', label: 'Position', sortable: true },
      { key: 'material', label: 'Material', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { key: 'quantity', label: 'Quantity', type: 'number' as const, sortable: true }
    ],
    invoice: [
      { key: 'invoiceNumber', label: 'Invoice Number', sortable: true },
      { key: 'itemNo', label: 'Item No', sortable: true },
      { key: 'billDate', label: 'Bill Date', type: 'date' as const, sortable: true },
      { key: 'currency', label: 'Currency', sortable: true },
      { key: 'itemPrice', label: 'Item Price', sortable: true },
      { key: 'itemName', label: 'Item Name', sortable: true },
      { key: 'material', label: 'Material', sortable: true },
      // { key: 'customerName', label: 'Customer Name', sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'country', label: 'Country', sortable: true },
      { key: 'postalCode', label: 'Postal Code', sortable: true }
    ],
    payment: [
      { key: 'paymentId', label: 'Payment ID', sortable: true },
      { key: 'invoiceNumber', label: 'Invoice Number', sortable: true },
      { key: 'paymentDate', label: 'Payment Date', type: 'date' as const, sortable: true },
      { key: 'dueDate', label: 'Due Date', type: 'date' as const, sortable: true },
      { key: 'amount', label: 'Amount', type: 'currency' as const, sortable: true },
      { key: 'currency', label: 'Currency', sortable: true },
      { key: 'status', label: 'Status', type: 'status' as const, sortable: true }
    ],
    memo: [
      { key: 'documentNo', label: 'Memo Number', sortable: true },
      { key: 'billingDate', label: 'Billing Date', type: 'date' as const, sortable: true },
      { key: 'itemPrice', label: 'Amount', type: 'currency' as const, sortable: true },
      { key: 'currency', label: 'Currency', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { key: 'materialNo', label: 'Material No', sortable: true },
      { key: 'memoType', label: 'Memo Type', sortable: true }
    ],
    overall: []
  };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.vendorId = this.authService.getCustomerId();
    this.loadDashboardStats();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onSectionChange(section: string): void {
    this.activeSection = section;
    if (this.shouldShowTable()) {
      this.loadSectionData(section);
    } else if (section === 'overall') {
      this.loadOverallData();
    }
  }

  shouldShowTable(): boolean {
    return ['inquiry', 'sales', 'delivery', 'invoice', 'payment', 'memo'].includes(this.activeSection);
  }

  private loadDashboardStats(): void {
    if (!this.vendorId) return;

    this.dataService.getInquiries(this.vendorId).subscribe(data => this.rfqCount = data.length);
    this.dataService.getSales(this.vendorId).subscribe(data => this.poCount = data.length);
    this.dataService.getInvoices(this.vendorId).subscribe(data => this.invoiceCount = data.length);
    this.dataService.getDeliverys(this.vendorId).subscribe(data => this.grCount = data.length);
  }

  private loadOverallData(): void {
    this.isLoading = true;
  
    this.dataService.getOverallData(this.vendorId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
  
        if (response && Array.isArray(response) && response.length > 0) {
          const overallData = response[0];
          this.currency = overallData.currency || '';
  
          const totalOrders = Number(overallData.totalOrders) || 0;
          const totalInvoices = Number(overallData.totalInvoices) || 0;
          const totalSales = Number(overallData.totalSales) || 0;
          const totalPayments = Number(overallData.totalPayments) || 0;
          const bestPayment = Number(overallData.bestPayment) || 0;
  
          this.pieChartData = {
            labels: ['Total Orders', 'Total Invoices'],
            datasets: [{
              data: [totalOrders, totalInvoices],
              backgroundColor: ['#FF6384', '#36A2EB']
            }]
          };
  
          this.barChartData = [{
            data: [totalSales, totalPayments, bestPayment],
            label: 'Financial Data',
            backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40']
          }];
        } else {
          console.warn('Empty or invalid data received:', response);
          this.toastService.error('No overall data available.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API error:', err);
        this.toastService.error('Failed to load overall data');
      }
    });
  }

  private loadSectionData(section: string): void {
    if (!this.vendorId) {
      this.toastService.error('Vendor ID not found. Please login again.');
      return;
    }

    this.isLoading = true;
    this.currentColumns = this.columnDefinitions[section as keyof typeof this.columnDefinitions] || [];

    switch (section) {
      case 'inquiry':
        this.dataService.getInquiries(this.vendorId).subscribe({
          next: data => {
            this.currentData = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastService.error('Failed to load Inquiry data');
          }
        });
        break;
      case 'sales':
        this.dataService.getSales(this.vendorId).subscribe({
          next: data => {
            this.currentData = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastService.error('Failed to load PO data');
          }
        });
        break;
      case 'delivery':
        this.dataService.getDeliverys(this.vendorId).subscribe({
          next: data => {
            this.currentData = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastService.error('Failed to load GR data');
          }
        });
        break;
      case 'invoice':
        this.dataService.getInvoices(this.vendorId).subscribe({
          next: data => {
            this.currentData = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastService.error('Failed to load Invoice data');
          }
        });
        break;
      case 'payment':
        this.dataService.getPayments(this.vendorId).subscribe({
          next: data => {
            this.currentData = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastService.error('Failed to load Payment data');
          }
        });
        break;
      case 'memo':
        this.dataService.getMemos(this.vendorId).subscribe({
          next: data => {
            this.currentData = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastService.error('Failed to load Memo data');
          }
        });
        break;
      default:
        this.isLoading = false;
    }
  }

  downloadInvoicePDF(invoiceNo: string): void {
    this.dataService.downloadPDF(invoiceNo).subscribe({
      next: res => {
        if (res.success && res.base64) {
          const byteCharacters = atob(res.base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `Invoice_${invoiceNo}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          this.toastService.success('PDF downloaded successfully');
        } else {
          this.toastService.error('Invalid PDF data');
        }
      },
      error: () => {
        this.toastService.error('Failed to download PDF');
      }
    });
  }

  getSectionTitle(): string {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      inquiry: 'Inquiry Datas',
      sales: 'Sales Orders (SO)',
      delivery: 'Delivery Details (GR)',
      invoice: 'Invoices',
      payment: 'Payment & Aging',
      memo: 'Credit/Debit Memos',
      overall: 'Analytics Dashboard',
      profile: 'Vendor Profile'
    };
    return titles[this.activeSection] || 'Dashboard';
  }

  getSectionDescription(): string {
    const descriptions: { [key: string]: string } = {
      dashboard: 'Overview of your vendor account activity and key metrics',
      inquiry: 'Manage your inquiry datas submissions and responses',
      sales: 'View and track your purchase orders and delivery schedules',
      delivery: 'Monitor goods receipts and delivery confirmations',
      invoice: 'Track invoice submissions and payment status',
      payment: 'View payment history and aging reports',
      memo: 'Manage credit and debit memos for adjustments',
      profile: 'View and manage your vendor profile information',
      overall: 'Visual analytics of your vendor performance and trends'
    };
    return descriptions[this.activeSection] || '';
  }
}