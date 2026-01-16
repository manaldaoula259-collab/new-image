import mongoose, { Schema, Document, Model } from "mongoose";
import type { IUser as IUserType } from "@/types/models";

export interface IUser extends Document, Omit<IUserType, '_id' | 'id'> { }

// @ts-ignore - Mongoose Schema types are too complex for TypeScript
const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true },
    credits: { type: Number, default: 0 },
    promptWizardCredits: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

function getModel(): Model<IUser> {
  if (mongoose.models.User) {
    return mongoose.models.User as Model<IUser>;
  }
  return mongoose.model<IUser>("User", UserSchema);
}

const User = getModel();
export default User;

