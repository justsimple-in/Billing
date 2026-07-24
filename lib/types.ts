export interface Item {
  description: string
  comm: number
  fare: number
  quantity: number
  price: number
  eachItemTotal: number
  carat: number
  perCarat: number
}

export interface Extra {
  description: string
  amount: number
}

export interface Client {
  _id: string;

  businessId: string;

  clientName: string;

  prevBalance: number;

  address?: string;

  phone?: string;
}

export interface InvoiceDetails {
  

  businessId: string;

  clientId: string;
  version: number;
  createdAt: string;
  billNo: number
  clientName: string
  invoiceDate: string
  selectedClientId: string
  balance: number
  paid: number
  fare: boolean
  items: Item[]
  extra: Extra[]
  notes: string
  total: number
  newBalance: number
}

export interface InvoiceHistoryEntry extends InvoiceDetails {
  _id: string
  createdAt: string
}

// export interface InvoiceDocument extends InvoiceDetails {
//   _id: string
//   createdAt: string

//    shareId : string;

//   invoiceGroupId: string;
//   edited?: boolean
//   // Chain pointers so an edited invoice can be traced back and forth.
//   previousInvoiceid: string
//   replacedBy?: string
//   active?: boolean
//   // Full snapshots of every prior version of this invoice.
//   history?: InvoiceHistoryEntry[]
// }

export interface Business {
  _id: string;

  name: string;

  slug: string;

  address: string;

  phone: string;

  logo?: string;

  ownerId: string;

  createdAt?: string;
}

export interface User {
  _id: string;

  name: string;

  email: string;

  image?: string;
}

export type BusinessRole =
  | "OWNER"
  | "ACCOUNTANT";

  export interface BusinessMember {
  _id: string;

  businessId: string;

  userId: string;

  role: BusinessRole;
}

export interface Product {
  _id: string;

  businessId: string;

  name: string;

  defaultPrice: number;
}

export interface InvoiceDocument extends InvoiceDetails {
  _id: string;

  shareId: string;

  invoiceGroupId: string;

  version: number;

  active: boolean;

  edited?: boolean;

  previousInvoiceId?: string;

  replacedBy?: string;

  history?: InvoiceHistoryEntry[];

  updatedAt?: string;
}

export interface Supplier {
  _id: string;

  businessId: string;

  supplierName: string;

  prevBalance: number;

  address?: string;

  phone?: string;
}

export interface PurchaseItem {
  description: string;

  // quantity: number;

  unit: string;

  unitCount: number;   

  weightPerUnit: number;

  pricePerKg: number;

  itemTotal: number;

  comm: number;

  fare: number;
}

export interface PurchaseReceipt {
  businessId: string;

  // supplierId: string;

  businessSlug: string;

  version: number;

  createdAt: string;

  supplierName: string;

  receiptDate: string;

  selectedSupplierId: string;

  balance: number;

  paid: number;

  fare: boolean;

  items: PurchaseItem[];

  extra: Extra[];

  notes: string;

  total: number;

  newBalance: number;
}

export interface PurchaseHistoryEntry extends PurchaseReceipt  {
  _id: string;

  createdAt: string;
}

export interface PurchaseReceiptDocument extends PurchaseReceipt {
  _id: string;

  shareId: string;

  receiptGroupId: string;

  version: number;

  active: boolean;

  edited?: boolean;

  previousReceiptId?: string;

  replacedBy?: string;

  history?: PurchaseHistoryEntry[];

  updatedAt?: string;
}

export type PurchaseUnit =
  | "Carat"
  | "Box"
  | "Bag"
  | "Piece"
  | "Kg";


  export interface Payment {
  businessId: string;

  businessSlug: string;

  version: number;

  createdAt: string;

  supplierName: string;

  selectedSupplierId: string;

  paymentDate: string;

  amount: number;

  notes: string;

  previousBalance: number;

  newBalance: number;
}

export interface PaymentHistoryEntry extends Payment {
  _id: string;
}

export interface PaymentDocument extends Payment {
  _id: string;

  shareId: string;

  paymentGroupId: string;

  version: number;

  active: boolean;

  edited?: boolean;

  previousPaymentId?: string;

  replacedBy?: string;

  history?: PaymentHistoryEntry[];

  updatedAt?: string;
}