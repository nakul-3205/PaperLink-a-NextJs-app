import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/connectToDb";
import DocumentModel, { IDocument } from "@/models/Document";
import DocumentHistory from "@/models/DocumentHistory";

export async function  GET(req:NextRequest,{ params }: { params: { id: string } }) {
    try {
        await connectToDB()
        const {userId}=await auth()
          if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const doc=await DocumentModel.findById(params.id)
    if(!doc){
        return NextResponse.json({error:'Not Found'},{status:404})
    }
    
    const isOwner= doc.owner ===userId
    const isCollaborator = doc.collaborators.includes(userId);
      if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json(doc);

    } catch (error) {
         console.error("GET /documents/:id error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function  DELETE(req:NextRequest,{ params }: { params: { id: string } }) {
       try {
        await connectToDB()
        const {userId}=await auth()
        if(!userId)return NextResponse.json({erorr:'unauthorized'},{status:400})
            const doc=await DocumentModel.findById(params.id)
          if(!doc){
        return NextResponse.json({error:'Not Found'},{status:404})
         }
    
        const isOwner= doc.owner ===userId
        if(!isOwner)return NextResponse.json({error:'Only owner can delete'},{status:400})
            await DocumentModel.findByIdAndDelete(params.id)
        return NextResponse.json({ message: "Deleted successfully" });

       } catch (error) {
          console.error("DELETE /documents/:id error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
       }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await DocumentModel.findById(params.id);
    if (!doc) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const isOwner = doc.owner === userId;
    const isCollaborator = doc.collaborators.includes(userId);
    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const body = await req.json();
    const { title, content } = body;
     if(!title || !content){
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
     }
     
      if (title) doc.title = title;
    if (content) doc.content = content;
     await doc.save();
      await DocumentHistory.create({
      documentId: doc._id,
      editor: userId,
      contentSnapshot: content,
      timestamp: new Date(),
    });
     
    return NextResponse.json(doc);

}catch(error){
       console.error("PATCH /documents/:id error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
}
}