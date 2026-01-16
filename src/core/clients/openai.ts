import OpenAI from "openai";

// Function to get OpenAI client - creates it only when needed
// This prevents errors during module initialization if the key is missing
export const getOpenAIClient = (): OpenAI => {
  const apiKey = process.env["OPENAI_API_KEY"];
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not configured.");
  }
  
  return new OpenAI({
    apiKey,
  });
};

// Default export - use the function directly
// This prevents instantiation at module load time
export default getOpenAIClient;
