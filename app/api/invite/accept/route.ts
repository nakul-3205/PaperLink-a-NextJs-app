// /app/api/invite/accept/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import InviteToken from '@/models/InviteToken';
import Document from '@/models/Document';
import { connectToDB } from '@/lib/connectToDb';

export async function POST(req: Request) {
  await connectToDB();
  const { userId } = await auth();
  const { token } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invite = await InviteToken.findOne({ token });
  if (!invite) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  const doc = await Document.findById(invite.documentId);
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  if (!doc.collaborators.includes(userId)) {
    doc.collaborators.push(userId);
    await doc.save();
  }

  return NextResponse.json({
    message: 'You are now a collaborator!',
    docId: doc._id,
  });
}
