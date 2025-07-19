import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import User from '@/models/User';
import { connectToDB } from '@/lib/connectToDb';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = headers();

const svix_id = req.headers.get('svix-id')!;
const svix_timestamp = req.headers.get('svix-timestamp')!;
const svix_signature = req.headers.get('svix-signature')!;


  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed', err);
    return new NextResponse('Webhook Error', { status: 400 });
  }

  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  try {
    await connectToDB();

    const userExists = await User.findOne({ clerkId: id });

    if (!userExists) {
      await User.create({
        clerkId: id,
        email: email_addresses[0].email_address,
        first_name,
        last_name,
        image_url,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DB error', err);
    return new NextResponse('Database Error', { status: 500 });
  }
}
