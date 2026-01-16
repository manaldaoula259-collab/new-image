import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeatureFlag extends Document {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100 for gradual rollout
  targetUsers?: string[]; // Specific user IDs to target
  targetUserGroups?: string[]; // User groups (e.g., "premium", "beta")
  conditions?: {
    minCredits?: number;
    accountAge?: number; // days
    [key: string]: any;
  };
  metadata?: {
    category?: string;
    tags?: string[];
    createdBy?: string;
    lastModifiedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    rolloutPercentage: { 
      type: Number, 
      default: 100,
      min: 0,
      max: 100,
    },
    targetUsers: [{ type: String }],
    targetUserGroups: [{ type: String }],
    conditions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      category: { type: String, default: "general" },
      tags: [{ type: String }],
      createdBy: { type: String },
      lastModifiedBy: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "feature_flags",
  }
);

function getModel(): Model<IFeatureFlag> {
  if (mongoose.models.FeatureFlag) {
    return mongoose.models.FeatureFlag as Model<IFeatureFlag>;
  }
  return mongoose.model<IFeatureFlag>("FeatureFlag", FeatureFlagSchema);
}

const FeatureFlag = getModel();
export default FeatureFlag;

