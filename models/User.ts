import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUser  {
  clerkId: string;
  email: string;
  first_name: string;
  last_name: string;
  image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    image_url: { type: String },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', userSchema);
export default User;
