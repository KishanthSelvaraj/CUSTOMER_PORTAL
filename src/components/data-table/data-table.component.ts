import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'status';
  sortable?: boolean;
}

export interface TableData {
  [key: string]: any;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="data-table-container">
      <!-- Search and Controls -->
      <div class="table-controls">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Search..."
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="table-info">
          <span>{{ getDisplayRange() }} of {{ filteredData.length }} items</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th
                *ngFor="let column of columns"
                class="table-header"
                [class.sortable]="column.sortable"
                (click)="column.sortable && sort(column.key)"
              >
                <span>{{ column.label }}</span>
                <span
                  *ngIf="column.sortable && sortBy === column.key"
                  class="sort-indicator"
                >
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th *ngIf="showDownload" class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of paginatedData" class="table-row">
              <td *ngFor="let column of columns" class="table-cell">
                <span [ngClass]="getCellClass(column, item[column.key])">
                  {{ formatCellValue(column, item[column.key]) }}
                </span>
              </td>
              <td *ngIf="showDownload" class="table-cell">
                <button 
                  class="download-btn"
                  (click)="onDownloadPDF(item['invoiceNumber'] || item['id'])"
                  title="Download PDF"
                >
                  📄 PDF
                </button>
              </td>
            </tr>
            <tr *ngIf="paginatedData.length === 0">
              <td [colSpan]="columns.length + (showDownload ? 1 : 0)" class="no-data">
                No data found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" *ngIf="totalPages > 1">
        <button
          class="pagination-btn"
          [disabled]="currentPage === 1"
          (click)="goToPage(currentPage - 1)"
        >
          Previous
        </button>
        
        <div class="pagination-numbers">
          <button
            *ngFor="let page of getVisiblePages()"
            class="pagination-number"
            [class.active]="page === currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          class="pagination-btn"
          [disabled]="currentPage === totalPages"
          (click)="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .data-table-container {
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      background: var(--secondary-bg);
    }

    .search-container {
      position: relative;
      max-width: 300px;
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 10px 16px 10px 40px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
      background: var(--card-bg);
      color: var(--text-primary);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 16px;
    }

    .table-info {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .table-header {
      background: var(--secondary-bg);
      padding: 16px 20px;
      text-align: left;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
      white-space: nowrap;
      position: relative;
    }

    .table-header.sortable {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .table-header.sortable:hover {
      background: var(--hover-bg);
    }

    .sort-indicator {
      margin-left: 8px;
      font-size: 12px;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background: var(--hover-bg);
    }

    .table-cell {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
      color: var(--text-primary);
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
      font-style: italic;
    }

    .download-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .download-btn:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }

    /* Status styling */
    .status-pending {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning-color);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-active, .status-submitted, .status-completed, .status-approved, .status-paid {
      background: rgba(16, 185, 129, 0.2);
      color: var(--success-color);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-delivered, .status-received {
      background: rgba(59, 130, 246, 0.2);
      color: var(--accent-color);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-cancelled, .status-rejected, .status-failed, .status-overdue {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error-color);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-partial, .status-processing {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning-color);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      gap: 8px;
      border-top: 1px solid var(--border-color);
      background: var(--secondary-bg);
    }

    .pagination-btn, .pagination-number {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-primary);
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .pagination-btn:hover:not(:disabled), .pagination-number:hover {
      background: var(--hover-bg);
      border-color: var(--accent-color);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-number.active {
      background: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }

    .pagination-numbers {
      display: flex;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .table-controls {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .search-container {
        max-width: none;
      }
      
      .table-wrapper {
        overflow-x: scroll;
      }
      
      .pagination-container {
        flex-wrap: wrap;
      }
    }
  `]
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() data: TableData[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() pageSize = 10;
  @Input() showDownload = false;
  @Output() downloadPDF = new EventEmitter<string>();

  filteredData: TableData[] = [];
  paginatedData: TableData[] = [];
  searchTerm = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  totalPages = 1;

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateData();
    }
  }

  private updateData(): void {
    this.filteredData = [...this.data];
    this.onSearch();
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.filteredData = this.data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    } else {
      this.filteredData = [...this.data];
    }
    
    this.currentPage = 1;
    this.updatePagination();
  }

  sort(columnKey: string): void {
    if (this.sortBy === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = columnKey;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.updatePagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  getDisplayRange(): string {
    if (this.filteredData.length === 0) return '0-0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
    return `${start}-${end}`;
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  formatCellValue(column: TableColumn, value: any): string {
    if (value == null) return '-';

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString('en-IN');
      case 'number':
        return new Intl.NumberFormat('en-IN').format(value);
      default:
        return String(value);
    }
  }

  getCellClass(column: TableColumn, value: any): string {
    if (column.type === 'status') {
      return `status-${String(value).toLowerCase()}`;
    }
    return '';
  }

  onDownloadPDF(invoiceNo: string): void {
    this.downloadPDF.emit(invoiceNo);
  }
}