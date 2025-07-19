import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/connectToDb";
import User from "@/models/User";
import DocumentModel from "@/models/Document";
import { ratelimit } from "@/lib/rateLimiter";

export async function POST(req:NextRequest){
    try {
       await connectToDB()
       const {userId}=await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const clerkId=userId
        const {title,content,}=await req.json()
        if(!title.trim() ||!content.trim()){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }
          const { success } = await ratelimit.limit(userId)
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
        const user=await User.findOne({clerkId})
        if(!user){
            return NextResponse.json({message:'User not found'},{status:404})
        }
       const doc=await DocumentModel.create({
        title:title,
        content:content,
        owner:clerkId,
        collaborators:[]

       })
       return NextResponse.json(doc)
    } catch (error) {
        console.log('error at post ',error)
        return NextResponse.json({message:'Server Error'},{status:500})
    }
}

export async function  GET(req:NextRequest) {
     const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectToDB()

  const docs = await DocumentModel.find({
    $or: [
      { owner: userId },
      { collaborators: userId }
    ]
  }).sort({ updatedAt: -1 })

  return NextResponse.json(docs)
}