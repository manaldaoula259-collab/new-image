import mongoose, { Schema, Document, Model } from "mongoose";
import type { IMedia as IMediaType } from "@/types/models";

export interface IMedia extends Document, Omit<IMediaType, '_id' | 'id'> {}

const MediaSchema = new Schema<IMedia>(
  {
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    prompt: { type: String },
    source: { type: String },
  },
  {
    timestamps: true,
  }
);

function getModel(): Model<IMedia> {
  if (mongoose.models.Media) {
    return mongoose.models.Media as Model<IMedia>;
  }
  return mongoose.model<IMedia>("Media", MediaSchema);
}

const Media = getModel();
export default Media;

