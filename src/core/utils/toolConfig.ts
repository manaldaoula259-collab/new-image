import dbConnect from "@/lib/mongodb";
import ToolConfig from "@/models/ToolConfig";

export interface ToolConfigData {
  modelIdentifier: string;
  promptTemplate: string;
  negativePrompt?: string;
  defaultAspectRatio: string;
  defaultOutputFormat: string;
  creditsCost: number;
  enabled: boolean;
}

/**
 * Get tool configuration by slug
 * Returns null if not configured
 */
export async function getToolConfig(toolSlug: string): Promise<ToolConfigData | null> {
  await dbConnect();
  const config = await ToolConfig.findOne({ toolSlug, enabled: true }).lean();
  
  if (!config) {
    return null;
  }

  return {
    modelIdentifier: config.modelIdentifier,
    promptTemplate: config.promptTemplate,
    negativePrompt: config.negativePrompt,
    defaultAspectRatio: config.defaultAspectRatio || "1:1",
    defaultOutputFormat: config.defaultOutputFormat || "jpg",
    creditsCost: config.creditsCost || 5,
    enabled: config.enabled,
  };
}

/**
 * Format prompt template with user input
 */
export function formatPrompt(template: string, userPrompt: string): string {
  return template.replace(/\{\{prompt\}\}/g, userPrompt.trim());
}


