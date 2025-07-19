import mongoose, { Schema, model, models, Types, Document as MDoc } from 'mongoose';

export interface IDocumentHistory  {
  documentId: Types.ObjectId;     
  editor: Types.ObjectId;         
  contentSnapshot: string;        
  timestamp: Date;                
}

const documentHistorySchema = new Schema<IDocumentHistory>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    editor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contentSnapshot: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const DocumentHistory = models.DocumentHistory || model<IDocumentHistory>('DocumentHistory', documentHistorySchema);
export default DocumentHistory;
