export interface Vendor {
  id: string;
  customerId: string; 
  name: string;             // From profile.name
  address?: string;         // New field from profile.address
  city: string;             // From profile.city
  region?: string;          // New field from profile.region
  country: string;          // From profile.country
  pincode: string;          // From profile.postalCode
  email?: string;           // From profile.email
  phone?: string;           // Optional (not in API response but kept for compatibility)
  addressNumber?: string;   // New field from profile.addressNumber
}

export interface LoginRequest {
  vendorId: string;
  password: string;
}

export interface InquiryItem {
  id: string;
  inquiryNumber: string; // Same as VBELN
  description: string;
  requestDate: Date;
  dueDate: Date;
  issueDate: Date;
  status: 'Pending' | 'Submitted' | 'Awarded' | 'Rejected';
  amount: number;
  currency: string;
  material: string;
  quantity: number;
  unit: string;
}



export interface SalesOrderItem {
  id: string;
  inquiryNumber: string; // Same as VBELN
  description: string;
  requestDate: Date;
  dueDate: Date;
  issueDate: Date;
  status: 'Pending' | 'Submitted' | 'Awarded' | 'Rejected';
  amount: number;
  currency: string;
  material: string;
  quantity: number;
  unit: string;
}

export interface DeliveryItem {
  deliveryNumber: string;
  createdBy: string;
  deliveryDate: Date;
  shippingPoint: string;
  deliveryType: string;
  position: string;
  material: string;
  description: string;
  quantity: number;
}


export interface InvoiceItem {
  id: string;
  itemNo: string;
  invoiceNumber: string;
  customerId: string;
  billDate: Date;
  currency: string;
  customerName: string;
  street: string;
  city: string;
  country: string;
  material: string;
  itemName: string;
  postalCode: string;
  itemPrice:string;
}


export interface PaymentItem {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  paymentDate: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'Completed' | 'Processing' | 'Failed';
}


export interface MemoItem {
  customerId: string;
  customerName: string;
  billingDate: string;
  itemPrice: number;
  currency: string;
  materialNo: string;
  description: string;
  documentNo: string;
  memoType: string; // 👈 Add this
}


export interface OverallItem {
  totalOrders: number;
  totalSales: number;
  totalInvoices: number;
  totalPayments: number;
  bestPayment: number;
  currency: string;
}



