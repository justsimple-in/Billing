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

export interface InvoiceDocument extends InvoiceDetails {
  _id: string
  createdAt: string
}
