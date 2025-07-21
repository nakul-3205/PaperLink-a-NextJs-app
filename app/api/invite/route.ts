import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDB } from "@/lib/connectToDb"
import DocumentModel from "@/models/Document"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    await connectToDB()
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { documentId, collaboratorEmail } = await req.json()

    if (!documentId || !collaboratorEmail) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const collaborator = await User.findOne({ email: collaboratorEmail })
    if (!collaborator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const doc = await DocumentModel.findById(documentId)
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check if the current user is the owner
    if (doc.owner !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prevent duplicate
    if (!doc.collaborators.includes(collaborator.clerkId)) {
      doc.collaborators.push(collaborator.clerkId)
      await doc.save()
    }

    return NextResponse.json({ message: "Collaborator added" })
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
