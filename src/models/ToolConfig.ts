import mongoose, { Schema, Model, Document } from "mongoose";

export interface IToolConfig extends Document {
  toolSlug: string; // e.g., "ai-art-generator/ai-character-generator"
  modelIdentifier: string; // e.g., "google/nano-banana"
  promptTemplate: string; // Template with {{prompt}} placeholder
  negativePrompt?: string;
  defaultAspectRatio?: string;
  defaultOutputFormat?: string;
  creditsCost?: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ToolConfigSchema = new Schema<IToolConfig>(
  {
    toolSlug: { type: String, required: true, unique: true, index: true },
    modelIdentifier: { type: String, required: true },
    promptTemplate: { type: String, required: true },
    negativePrompt: { type: String },
    defaultAspectRatio: { type: String, default: "1:1" },
    defaultOutputFormat: { type: String, default: "jpg" },
    creditsCost: { type: Number, default: 5 },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "tool_configs",
  }
);

function getModel(): Model<IToolConfig> {
  if (mongoose.models.ToolConfig) {
    return mongoose.models.ToolConfig as Model<IToolConfig>;
  }
  return mongoose.model<IToolConfig>("ToolConfig", ToolConfigSchema);
}

const ToolConfig = getModel();
export default ToolConfig;


