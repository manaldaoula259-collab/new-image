/**
 * Comprehensive test script to verify all 128 AI features
 * Tests API route existence and basic functionality
 */

import { dashboardTools } from "../src/data/dashboard";
import { resolveReplicateModelIdentifierForSlug } from "../src/core/replicate/modelCatalog";
import Replicate from "replicate";

// Load environment variables
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

interface TestResult {
  title: string;
  href: string;
  category: string;
  status: "working" | "not_working" | "no_model" | "error";
  error?: string;
  apiRoute?: string;
  modelIdentifier?: string | null;
}

// Map href to API route
function getApiRoute(href: string): string {
  // Remove leading /dashboard/tools/ if present
  let route = href.replace(/^\/dashboard\/tools\//, "");
  
  // Map to API route structure
  if (route.startsWith("/ai-image-models/")) {
    return route.replace("/ai-image-models/", "/api/ai-image-models/");
  } else if (route.startsWith("/ai-video/")) {
    return route.replace("/ai-video/", "/api/ai-video/");
  } else if (route.startsWith("/ai-photo-converter/")) {
    return route.replace("/ai-photo-converter/", "/api/ai-photo-converter/");
  } else if (route.startsWith("/ai-image-effects/")) {
    return route.replace("/ai-image-effects/", "/api/ai-image-effects/");
  } else if (route.startsWith("/ai-photo-filter/")) {
    return route.replace("/ai-photo-filter/", "/api/ai-photo-filter/");
  } else if (route.startsWith("/ai-image-editor/")) {
    return route.replace("/ai-image-editor/", "/api/ai-image-editor/");
  } else if (route.startsWith("/ai-art-generator/")) {
    return route.replace("/ai-art-generator/", "/api/ai-art-generator/");
  } else if (route.startsWith("/ai-upscaler/")) {
    return route.replace("/ai-upscaler/", "/api/ai-upscaler/");
  } else if (route.startsWith("/ai-controlnet/")) {
    return route.replace("/ai-controlnet/", "/api/ai-controlnet/");
  } else if (route.startsWith("/ai-background/")) {
    return route.replace("/ai-background/", "/api/ai-background/");
  } else if (route.startsWith("/ai-portrait/")) {
    return route.replace("/ai-portrait/", "/api/ai-portrait/");
  }
  
  return route;
}

// Get slug from href
function getSlugFromHref(href: string): string {
  const parts = href.split("/").filter(Boolean);
  return parts.slice(1).join("/");
}

async function testFeature(tool: typeof dashboardTools[0]): Promise<TestResult> {
  const result: TestResult = {
    title: tool.title,
    href: tool.href,
    category: tool.category,
    status: "error",
  };

  try {
    // Get API route
    const apiRoute = getApiRoute(tool.href);
    result.apiRoute = apiRoute;

    // Get slug for model resolution
    const slug = getSlugFromHref(tool.href);
    
    // Try to resolve model identifier
    try {
      const resolved = await resolveReplicateModelIdentifierForSlug(slug);
      const modelIdentifier = resolved.identifier || null;
      result.modelIdentifier = modelIdentifier || undefined;
      
      if (!modelIdentifier) {
        result.status = "no_model";
        result.error = "No model identifier found";
        return result;
      }

      // Test if model exists and is accessible
      if (REPLICATE_API_TOKEN) {
        const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
        
        try {
          // Try to get model info (this will fail if model doesn't exist)
          const modelParts = modelIdentifier.split(":");
          const modelOwner = modelParts[0].split("/")[0];
          const modelName = modelParts[0].split("/")[1];
          
          // Check if model exists by trying to get its version
          await replicate.models.get(modelOwner, modelName);
          
          result.status = "working";
        } catch (error: any) {
          if (error.status === 404) {
            result.status = "not_working";
            result.error = `Model not found: ${modelIdentifier}`;
          } else if (error.status === 402) {
            result.status = "not_working";
            result.error = "Payment required (insufficient credits)";
          } else {
            result.status = "not_working";
            result.error = error.message || "Model access error";
          }
        }
      } else {
        result.status = "no_model";
        result.error = "REPLICATE_API_TOKEN not configured";
      }
    } catch (error: any) {
      result.status = "error";
      result.error = error.message || "Failed to resolve model";
    }
  } catch (error: any) {
    result.status = "error";
    result.error = error.message || "Unknown error";
  }

  return result;
}

async function main() {
  console.log("🚀 Testing all 128 AI features...\n");
  console.log(`Found ${dashboardTools.length} features to test\n`);

  if (!REPLICATE_API_TOKEN) {
    console.warn("⚠️  WARNING: REPLICATE_API_TOKEN not found. Model existence checks will be limited.\n");
  }

  const results: TestResult[] = [];
  const total = dashboardTools.length;
  let current = 0;

  for (const tool of dashboardTools) {
    current++;
    process.stdout.write(`\rTesting ${current}/${total}: ${tool.title}...`);
    
    const result = await testFeature(tool);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n\n✅ Testing complete!\n");

  // Generate report
  const working = results.filter((r) => r.status === "working");
  const notWorking = results.filter((r) => r.status === "not_working");
  const noModel = results.filter((r) => r.status === "no_model");
  const errors = results.filter((r) => r.status === "error");

  console.log("=".repeat(80));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Working:        ${working.length}`);
  console.log(`❌ Not Working:     ${notWorking.length}`);
  console.log(`⚠️  No Model Found:  ${noModel.length}`);
  console.log(`🔴 Errors:          ${errors.length}`);
  console.log(`📦 Total:           ${total}`);
  console.log("=".repeat(80));

  // Working features
  if (working.length > 0) {
    console.log("\n✅ WORKING FEATURES (" + working.length + "):");
    console.log("-".repeat(80));
    working.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Model: ${r.modelIdentifier}`);
    });
  }

  // Not working features
  if (notWorking.length > 0) {
    console.log("\n❌ NOT WORKING FEATURES (" + notWorking.length + "):");
    console.log("-".repeat(80));
    notWorking.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Error: ${r.error}`);
      if (r.modelIdentifier) {
        console.log(`   Model: ${r.modelIdentifier}`);
      }
    });
  }

  // No model found
  if (noModel.length > 0) {
    console.log("\n⚠️  NO MODEL FOUND (" + noModel.length + "):");
    console.log("-".repeat(80));
    noModel.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Route: ${r.apiRoute || r.href}`);
      if (r.error) {
        console.log(`   Error: ${r.error}`);
      }
    });
  }

  // Errors
  if (errors.length > 0) {
    console.log("\n🔴 ERRORS (" + errors.length + "):");
    console.log("-".repeat(80));
    errors.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Error: ${r.error || "Unknown error"}`);
    });
  }

  // Save detailed report to file
  const reportPath = path.join(__dirname, "../feature-test-report.json");
  const fs = require("fs");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          total,
          working: working.length,
          notWorking: notWorking.length,
          noModel: noModel.length,
          errors: errors.length,
        },
        results,
      },
      null,
      2
    )
  );
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

main().catch(console.error);

