import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInviteToken extends Document {
  token: string;
  documentId: mongoose.Types.ObjectId;
  createdBy: string; // Clerk user ID
  createdAt: Date;
}

//the schema
const InviteTokenSchema: Schema<IInviteToken> = new Schema({
  token: { type: String, required: true, unique: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  createdBy: { type: String, required: true }, // Clerk user ID
  createdAt: { type: Date, default: Date.now },
});


const InviteToken: Model<IInviteToken> =
  mongoose.models.InviteToken || mongoose.model<IInviteToken>('InviteToken', InviteTokenSchema);

export default InviteToken;
