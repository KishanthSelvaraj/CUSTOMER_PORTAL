import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vendor, LoginRequest } from '../models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentVendorSubject = new BehaviorSubject<Vendor | null>(null);
  public currentVendor$ = this.currentVendorSubject.asObservable();
  private apiUrl = 'http://localhost:5000/api/customer';

  constructor(private http: HttpClient) {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const customerId = sessionStorage.getItem('customerId');
    
    if (isAuthenticated === 'true' && customerId) {
      this.loadCustomerProfile(customerId);
    }
  }

  login(credentials: LoginRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{
      success: boolean;
      message: string;
      customerId?: string;
    }>(`${this.apiUrl}/login`, {
      CUSTOMER_ID: "0000000002",
      PASSWORD: "test"
    }).pipe(
      map(response => {
        if (response.success && response.message === 'Login successful.' && response.customerId) {
          const customerId = response.customerId.padStart(10, '0');
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('customerId', customerId);
          this.loadCustomerProfile(customerId);
          return { success: true, message: response.message };
        }
        return { 
          success: false, 
          message: response.message || 'Login failed. Please check your credentials.' 
        };
      })
    );
  }

  private loadCustomerProfile(customerId: string): void {
    this.http.post<{
      success: boolean;
      profile: any;
    }>(`${this.apiUrl}/profile`, { CUSTOMER_ID: customerId }).subscribe({
      next: res => {
        if (res.success && res.profile) {
          const customer: Vendor = {
            id: customerId,
            customerId: res.profile.customerId,
            name: res.profile.name,
            city: res.profile.city,
            country: res.profile.country,
            pincode: res.profile.postalCode,
            email: res.profile.email,
            address: res.profile.address,
            region: res.profile.region,
            addressNumber: res.profile.addressNumber
          };
          this.currentVendorSubject.next(customer);
        }
      },
      error: err => console.error('Failed to fetch profile:', err)
    });
  }

  logout(): void {
    this.currentVendorSubject.next(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('customerId');
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  }

  getCurrentVendor(): Vendor | null {
    return this.currentVendorSubject.value;
  }

  getCustomerId(): string {
    return sessionStorage.getItem('customerId') || '';
  }
}