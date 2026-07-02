import { NextResponse } from "next/server"
import { getClientsCollection } from "@/lib/mongodb"

// GET /api/clients -> list all clients
export async function GET() {
  try {
    const collection = await getClientsCollection()
    const clients = await collection.find({}).sort({ clientName: 1 }).toArray()

    const serialized = clients.map((c) => ({
      _id: c._id.toString(),
      clientName: c.clientName,
      prevBalance: c.prevBalance ?? 0,
    }))

    return NextResponse.json({ clients: serialized })
  } catch (error) {
    console.error("[v0] Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients", clients: [] },
      { status: 500 },
    )
  }
}

// POST /api/clients -> add a new client { clientName, prevBalance }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clientName = String(body.clientName || "").trim()
    const prevBalance = Number(body.prevBalance) || 0

    if (!clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 },
      )
    }

    const collection = await getClientsCollection()

    // Avoid duplicates (case-insensitive)
    const existing = await collection.findOne({
      clientName: { $regex: `^${escapeRegExp(clientName)}$`, $options: "i" },
    })
    if (existing) {
      return NextResponse.json({
        client: {
          _id: existing._id.toString(),
          clientName: existing.clientName,
          prevBalance: existing.prevBalance ?? 0,
        },
      })
    }

    const result = await collection.insertOne({
      clientName,
      prevBalance,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      client: {
        _id: result.insertedId.toString(),
        clientName,
        prevBalance,
      },
    })
  } catch (error) {
    console.error("[v0] Error adding client:", error)
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 })
  }
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
