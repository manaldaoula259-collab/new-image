import mongoose, { Schema, Document, Model } from "mongoose";
import type { IProject as IProjectType } from "@/types/models";
import { ProjectVersion } from "@/types/models";

export { ProjectVersion };
export interface IProject extends Document, Omit<IProjectType, '_id' | 'id'> {}

// @ts-ignore - Mongoose Schema types are too complex for TypeScript
const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    replicateModelId: { type: String },
    stripePaymentId: { type: String },
    modelVersionId: { type: String },
    modelStatus: { type: String },
    instanceName: { type: String, required: true },
    instanceClass: { type: String, required: true },
    imageUrls: { type: [String], required: true, default: [] },
    zipImageUrl: { type: String },
    userId: { type: String, required: true },
    credits: { type: Number, default: 100 },
    promptWizardCredits: { type: Number, default: 20 },
    version: { type: String, enum: Object.values(ProjectVersion), default: ProjectVersion.V1 },
  },
  {
    timestamps: true,
  }
);

function getModel(): Model<IProject> {
  if (mongoose.models.Project) {
    return mongoose.models.Project as Model<IProject>;
  }
  return mongoose.model<IProject>("Project", ProjectSchema);
}

const Project = getModel();
export default Project;

