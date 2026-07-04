// import { NextResponse } from "next/server"
// import { ObjectId } from "mongodb"
// import { getInvoicesCollection, getClientsCollection } from "@/lib/mongodb"

// // POST /api/invoices -> create a new invoice
// export async function POST(request: Request) {
//   try {
//     const body = await request.json()

//     const invoiceDoc = {
//       billNo: Number(body.billNo) || 0,
//       clientName: String(body.clientName || ""),
//       selectedClientId: String(body.selectedClientId || ""),
//       invoiceDate: String(body.invoiceDate || ""),
//       balance: Number(body.balance) || 0,
//       paid: Number(body.paid) || 0,
//       fare: Boolean(body.fare),
//       items: Array.isArray(body.items) ? body.items : [],
//       extra: Array.isArray(body.extra) ? body.extra : [],
//       notes: String(body.notes || ""),
//       total: Number(body.total) || 0,
//       newBalance: Number(body.newBalance) || 0,
//       createdAt: new Date().toISOString(),
//     }

//     const invoices = await getInvoicesCollection()
//     const result = await invoices.insertOne(invoiceDoc)

//     // Update the client's running balance to the new balance after this invoice.
//     if (invoiceDoc.selectedClientId) {
//       try {
//         const clients = await getClientsCollection()
//         await clients.updateOne(
//           { _id: new ObjectId(invoiceDoc.selectedClientId) },
//           { $set: { prevBalance: invoiceDoc.newBalance } },
//         )
//       } catch (err) {
//         console.error("[v0] Failed to update client balance:", err)
//       }
//     }

//     return NextResponse.json({
//       invoice: { ...invoiceDoc, _id: result.insertedId.toString() },
//     })
//   } catch (error) {
//     console.error("[v0] Error creating invoice:", error)
//     return NextResponse.json(
//       { error: "Failed to create invoice" },
//       { status: 500 },
//     )
//   }
// }
