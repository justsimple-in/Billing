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
  _id: string
  clientName: string
  prevBalance: number
}

export interface InvoiceDetails {
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

export interface InvoiceDocument extends InvoiceDetails {
  _id: string
  createdAt: string
  edited?: boolean
  // Chain pointers so an edited invoice can be traced back and forth.
  previousInvoiceId?: string
  replacedBy?: string
  active?: boolean
  // Full snapshots of every prior version of this invoice.
  history?: InvoiceHistoryEntry[]
}
