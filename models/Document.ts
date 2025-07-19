import mongoose, { Schema, model, models, Types, Document as MDocument } from 'mongoose';

export interface IDocument  {
  title: string;
  content: string; 
  owner: Types.ObjectId; 
  collaborators?: Types.ObjectId[]; 
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // store as JSON string
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const DocumentModel = models.Document || model<IDocument>('Document', documentSchema);
export default DocumentModel;
