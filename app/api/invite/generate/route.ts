import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDB } from '@/lib/connectToDb'
import Document from '@/models/Document'
import InviteToken from '@/models/InviteToken'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    await connectToDB()
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { documentId } = await req.json()
    if (!documentId) return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })

    const doc = await Document.findById(documentId)
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    if (doc.owner !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate unique token
    const token = crypto.randomBytes(20).toString('hex')

    // Save to DB
    await InviteToken.create({
      token,
      documentId,
      createdBy: userId
    })

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    return NextResponse.json({ inviteLink })
  } catch (err) {
    console.error('Error generating invite link:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
