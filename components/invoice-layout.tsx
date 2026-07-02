import { forwardRef } from "react"
import type { InvoiceDetails } from "@/lib/types"

interface Props {
  invoice: InvoiceDetails
}

function money(n: number) {
  return `Rs ${Number(n || 0).toFixed(2)}`
}

// Inline hex colors are used throughout so html2canvas (which cannot parse the
// oklch() colors emitted by Tailwind v4) can reliably rasterize the invoice.
const c = {
  ink: "#171717",
  muted: "#6b7280",
  faint: "#9ca3af",
  line: "#e5e7eb",
  line2: "#d1d5db",
  green: "#047857",
  white: "#ffffff",
}

const cell: React.CSSProperties = { padding: "8px" }
const cellR: React.CSSProperties = { padding: "8px", textAlign: "right" }

/**
 * Printable invoice layout. Rendered on the /view/[id] page and captured for
 * the downloadable PDF.
 */
export const InvoiceLayout = forwardRef<HTMLDivElement, Props>(
  function InvoiceLayout({ invoice }, ref) {
    const subtotal = invoice.total - invoice.balance

    return (
      <div
        ref={ref}
        style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: "768px",
          background: c.white,
          padding: "32px",
          color: c.ink,
          fontFamily: "var(--font-geist-sans, sans-serif)",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: `2px solid ${c.ink}`,
            paddingBottom: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
              INVOICE
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: c.muted }}>
              Billing Statement
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: "13px" }}>
            <p style={{ margin: 0 }}>
              <strong>Bill No:</strong> {invoice.billNo}
            </p>
            <p style={{ margin: "2px 0 0" }}>
              <strong>Date:</strong> {invoice.invoiceDate}
            </p>
          </div>
        </div>

        {/* Bill to */}
        <div style={{ marginTop: "16px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: c.muted,
            }}
          >
            Billed To
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 600 }}>
            {invoice.clientName || "—"}
          </p>
        </div>

        {/* Items table */}
        <table
          style={{
            marginTop: "24px",
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: c.ink, color: c.white, textAlign: "left" }}>
              <th style={cell}>Item</th>
              <th style={cellR}>Carat</th>
              <th style={cellR}>Qty</th>
              <th style={cellR}>Price</th>
              {invoice.fare && <th style={cellR}>Comm</th>}
              {invoice.fare && <th style={cellR}>Fare</th>}
              <th style={cellR}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${c.line}` }}>
                <td style={cell}>{item.description || "—"}</td>
                <td style={cellR}>{item.carat}</td>
                <td style={cellR}>{item.quantity}</td>
                <td style={cellR}>{item.price}</td>
                {invoice.fare && <td style={cellR}>{item.comm}</td>}
                {invoice.fare && <td style={cellR}>{item.fare}</td>}
                <td style={{ ...cellR, fontWeight: 500 }}>
                  {money(item.eachItemTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Extras */}
        {invoice.extra.length > 0 && (
          <table
            style={{
              marginTop: "16px",
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${c.line2}`,
                  textAlign: "left",
                }}
              >
                <th style={cell}>Additional Charges</th>
                <th style={cellR}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.extra.map((ex, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${c.line}` }}>
                  <td style={cell}>{ex.description || "—"}</td>
                  <td style={cellR}>{money(ex.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totals */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ width: "256px" }}>
            <Row label="Subtotal" value={money(subtotal)} muted />
            <Row label="Previous Balance" value={money(invoice.balance)} muted />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid ${c.line2}`,
                padding: "4px 0",
                fontWeight: 600,
              }}
            >
              <span>Total</span>
              <span>{money(invoice.total)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                color: c.green,
              }}
            >
              <span>Paid</span>
              <span>{money(invoice.paid)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: `2px solid ${c.ink}`,
                padding: "8px 0",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              <span>New Balance</span>
              <span>{money(invoice.newBalance)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            style={{
              marginTop: "24px",
              borderTop: `1px solid ${c.line}`,
              paddingTop: "16px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: c.muted,
              }}
            >
              Notes
            </p>
            <p style={{ margin: "4px 0 0" }}>{invoice.notes}</p>
          </div>
        )}

        <p
          style={{
            marginTop: "32px",
            textAlign: "center",
            fontSize: "12px",
            color: c.faint,
          }}
        >
          Thank you for your business
        </p>
      </div>
    )
  },
)

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
      }}
    >
      <span style={{ color: muted ? "#6b7280" : undefined }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
