import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum HdStatus {
  NO = "NO",
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
}

export interface IShot extends Document {
  _id: string;
  prompt: string;
  replicateId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: Types.ObjectId;
  outputUrl?: string;
  bookmarked?: boolean;
  blurhash?: string;
  seed?: number;
  hdStatus: HdStatus;
  hdPredictionId?: string;
  hdOutputUrl?: string;
}

const ShotSchema = new Schema<IShot>(
  {
    prompt: { type: String, required: true },
    replicateId: { type: String, required: true },
    status: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    outputUrl: { type: String },
    bookmarked: { type: Boolean, default: false },
    blurhash: { type: String },
    seed: { type: Number },
    hdStatus: { type: String, enum: Object.values(HdStatus), default: HdStatus.NO },
    hdPredictionId: { type: String },
    hdOutputUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const Shot: Model<IShot> =
  mongoose.models.Shot || mongoose.model<IShot>("Shot", ShotSchema);

export default Shot;

