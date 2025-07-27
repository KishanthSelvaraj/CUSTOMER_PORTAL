import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InquiryItem, SalesOrderItem, DeliveryItem, InvoiceItem, PaymentItem, MemoItem ,OverallItem} from '../models/vendor.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:5000/api/customer';

  constructor(private http: HttpClient) {}

private parseSapDate(sapDate: string): Date {
  if (!sapDate || sapDate === '00000000') return new Date();
  const match = /\/Date\((\d+)\)\//.exec(sapDate);
  if (match) return new Date(parseInt(match[1], 10));
  const year = parseInt(sapDate.substring(0, 4));
  const month = parseInt(sapDate.substring(4, 6)) - 1;
  const day = parseInt(sapDate.substring(6, 8));
  return new Date(year, month, day);
}

private formatDate(date: Date): string {
  return date ? new Date(date).toLocaleDateString() : '';
}
isValidDate(dateStr: string): boolean {
  return !!dateStr && dateStr !== '0000-00-00';
}


getInquiries(vendorId: string): Observable<InquiryItem[]> {
  return this.http.post<any>(`${this.apiUrl}/inquiry`, { CUSTOMER_ID: vendorId }).pipe(
    map(res => res.success ? res.data.map((item: any) => ({
      id: item.VBELN,
      inquiryNumber: item.VBELN,
      description: item.ARKTX || 'Inquiry Item',
      requestDate: this.formatDate(new Date(item.ERDAT)),     // Created Date
      dueDate: this.formatDate(new Date(item.BNDDT)),         // Binding Date
      issueDate: this.formatDate(new Date(item.ANGDT)),       // Inquiry Date
      status: 'Pending',                                      // Static status
      amount: parseFloat(item.NETWR) || 0,
      currency: item.WAERK || 'INR',
      material: parseInt(item.MATNR.replace(/^0+/, ''), 10),
      quantity: parseFloat(item.POSNR) || 0,
      unit: item.VRKME || ''
    })) : [])
  );
}



  getSales(vendorId: string): Observable<SalesOrderItem[]> {
  return this.http.post<any>(`${this.apiUrl}/sales`, { CUSTOMER_ID: vendorId }).pipe(
     map(res => res.success ? res.data.map((item: any) => ({
      id: item.VBELN,
     salesNumber: item.VBELN,
      description: item.ARKTX || 'Sales Order',
   requestDate: this.formatDate(item.ERDAT),
dueDate: this.isValidDate(item.BNDDT) ? this.formatDate(item.BNDDT) : '',
issueDate: this.isValidDate(item.ANGDT) ? this.formatDate(item.ANGDT) : '',

      status: 'Pending',                                      // Static status
      amount: parseFloat(item.NETWR) || 0,
      currency: item.WAERK || 'INR',
   material: parseInt(item.MATNR.replace(/^0+/, ''), 10),
      quantity: parseFloat(item.POSNR) || 0,
      unit: item.VRKME || ''
    })) : [])
    );
  }
getDeliverys(vendorId: string): Observable<DeliveryItem[]> {
  return this.http.post<any>(`${this.apiUrl}/delivery`, { CUSTOMER_ID: vendorId }).pipe(
    map(res => {
      if (res.success) {
        return res.data.map((item: any) => ({
          deliveryNumber: item.deliveryNumber,
          createdBy: item.createdBy,
          deliveryDate: new Date(item.deliveryDate), // assuming ISO format
          shippingPoint: parseInt(item.shippingPoint.replace(/^0+/, ''), 10),

          deliveryType: item.deliveryType === 'LF' ? 'Outbound delivery' : item.deliveryType,
          position: parseInt(item.position.replace(/^0+/, ''), 10),

           material: parseInt(item.material.replace(/^0+/, ''), 10),
          description: item.description,
          quantity: item.quantity
        }));
      }
      return [];
    })
  );
}

getInvoices(vendorId: string): Observable<InvoiceItem[]> {
  return this.http.post<any>(`${this.apiUrl}/invoice`, { CUSTOMER_ID: vendorId }).pipe(
    map(res => {
      if (res.success) {
        const invoices = res.data.map((item: any) => ({
          id: item.invoiceNo,
          itemNo: parseInt(item.itemNo.replace(/^0+/, ''), 10),

          invoiceNumber: item.invoiceNo,
          customerId: item.customerId,
          billDate: this.formatDate(item.billDate),
          currency: item.currency,
          customerName: item.customerName,
          street: item.street,
          city: item.city,
          country: item.country,
          material: item.material,
          itemName: item.itemName,
          postalCode: item.postalCode,
          itemPrice: item.itemPrice
        }));

        // Optional: Group by invoiceNumber
        const grouped = invoices.reduce((acc: any, curr: any) => {
          if (!acc[curr.invoiceNumber]) {
            acc[curr.invoiceNumber] = curr;
          }
          return acc;
        }, {});

        return Object.values(grouped);
      }
      return [];
    })
  );
}


getPayments(vendorId: string): Observable<PaymentItem[]> {
  return this.http.post<any>(`${this.apiUrl}/aging`, { CUSTOMER_ID: vendorId }).pipe(
    map(res => {
      if (res.success) {
        return res.data.map((item: any) => ({
          id: item.invoiceNo,
          paymentId: item.invoiceNo,
          invoiceNumber: item.invoiceNo,
          paymentDate: this.formatDate(new Date(item.billDate)),
          dueDate: this.formatDate(new Date(item.dueDate)),
          amount: item.itemPrice,
          currency: item.currency,
         status: item.aging > 30 ? 'Processing' : 'Completed'
        }));
      }
      return [];
    })
  );
}


getMemos(vendorId: string): Observable<MemoItem[]> {
  return this.http.post<any>(`${this.apiUrl}/memo`, { CUSTOMER_ID: vendorId }).pipe(
    map(res => {
      if (res.success && res.data) {
        return res.data.map((item: any) => ({
          customerId: item.customerId?.replace(/^0+/, '') || '', // Trim leading zeros
          customerName: item.customerName || '',
          billingDate: this.formatDate(item.billingDate),
          itemPrice: item.itemPrice,
          currency: item.currency,
          materialNo: item.materialNo?.replace(/^0+/, '') || '', // Trim leading zeros
          description: item.description,
          documentNo: item.documentNo,
          memoType: item.memoType === 'L2' ? 'Debited' : item.memoType === 'G2' ? 'Credited' : ''
        }));
      }
      return [];
    })
  );
}


getOverallData(customerId: string): Observable<OverallItem[]> {
  return this.http.post<any>(`${this.apiUrl}/overall`, { CUSTOMER_ID: customerId }).pipe(
    map(res => {
      if (res.success && res.data.length > 0) {
        return res.data.map((item: any) => ({
          totalOrders: item.Total_Orders,
          totalSales: item.Total_Sales,
          totalInvoices: item.Total_Invoices,
          totalPayments: item.Total_Payments,
          bestPayment: item.Best_Payment,
          currency: item.Currency,
        }));
      }
      return [];
    })
  );
}

  
downloadPDF(invoiceNo: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/pdf`, {
    IV_VBELN: invoiceNo
  });
}

}