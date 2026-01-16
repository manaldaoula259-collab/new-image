import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { IPayment as IPaymentType } from "@/types/models";

export interface IPayment extends Document, Omit<IPaymentType, '_id' | 'id' | 'projectId'> {
  projectId?: Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>(
  {
    type: { type: String, required: true },
    status: { type: String, required: true },
    stripeSessionId: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    userId: { type: String, index: true },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

function getModel(): Model<IPayment> {
  if (mongoose.models.Payment) {
    return mongoose.models.Payment as Model<IPayment>;
  }
  return mongoose.model<IPayment>("Payment", PaymentSchema);
}

const Payment = getModel();
export default Payment;

