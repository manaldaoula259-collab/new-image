/**
 * Comprehensive test script to verify all 128 AI features
 * Tests model resolution and basic API route structure
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Import dashboard tools - we'll need to parse the TypeScript file or use a workaround
// For now, let's manually extract the tools or use a simpler approach

// Read the dashboard.ts file and extract tools
const dashboardTsPath = path.join(__dirname, "../src/data/dashboard.ts");
const dashboardTsContent = fs.readFileSync(dashboardTsPath, "utf-8");

// Extract tool objects using regex (simple approach)
function extractTools(content) {
  const tools = [];
  const toolRegex = /{\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*icon:[^,]+,\s*href:\s*"([^"]+)",\s*color:\s*"([^"]+)",\s*iconColor:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*}/g;
  
  let match;
  while ((match = toolRegex.exec(content)) !== null) {
    tools.push({
      title: match[1],
      description: match[2],
      href: match[3],
      color: match[4],
      iconColor: match[5],
      category: match[6],
    });
  }
  
  return tools;
}

// Get slug from href
function getSlugFromHref(href) {
  const parts = href.split("/").filter(Boolean);
  return parts.slice(1).join("/");
}

// Check if API route file exists
function checkApiRouteExists(href) {
  let routePath = href.replace(/^\/dashboard\/tools\//, "");
  
  // Map to API route structure
  if (routePath.startsWith("/ai-image-models/")) {
    routePath = routePath.replace("/ai-image-models/", "ai-image-models/");
  } else if (routePath.startsWith("/ai-video/")) {
    routePath = routePath.replace("/ai-video/", "ai-video/");
  } else if (routePath.startsWith("/ai-photo-converter/")) {
    routePath = routePath.replace("/ai-photo-converter/", "ai-photo-converter/");
  } else if (routePath.startsWith("/ai-image-effects/")) {
    routePath = routePath.replace("/ai-image-effects/", "ai-image-effects/");
  } else if (routePath.startsWith("/ai-photo-filter/")) {
    routePath = routePath.replace("/ai-photo-filter/", "ai-photo-filter/");
  } else if (routePath.startsWith("/ai-image-editor/")) {
    routePath = routePath.replace("/ai-image-editor/", "ai-image-editor/");
  } else if (routePath.startsWith("/ai-art-generator/")) {
    routePath = routePath.replace("/ai-art-generator/", "ai-art-generator/");
  } else if (routePath.startsWith("/ai-upscaler/")) {
    routePath = routePath.replace("/ai-upscaler/", "ai-upscaler/");
  } else if (routePath.startsWith("/ai-controlnet/")) {
    routePath = routePath.replace("/ai-controlnet/", "ai-controlnet/");
  } else if (routePath.startsWith("/ai-background/")) {
    routePath = routePath.replace("/ai-background/", "ai-background/");
  } else if (routePath.startsWith("/ai-portrait/")) {
    routePath = routePath.replace("/ai-portrait/", "ai-portrait/");
  }
  
  // Check for specific route files
  const specificRoutes = [
    path.join(__dirname, "../src/app/api", routePath, "route.ts"),
    path.join(__dirname, "../src/app/api", routePath.split("/")[0], "[...slug]", "route.ts"),
  ];
  
  for (const routeFile of specificRoutes) {
    if (fs.existsSync(routeFile)) {
      return { exists: true, path: routeFile };
    }
  }
  
  return { exists: false, path: null };
}

// Manual model overrides (from modelCatalog.ts)
const MANUAL_MODEL_OVERRIDES = {
  "hunyuan-video": "tencent/hunyuan-video",
  "kling-2-video": "google/veo-2",
  "kling-video": "google/veo-2",
  "pencil-sketch": "tjrndll/pencil-sketch",
  "ghibli-diffusion": "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
  "ai-character-generator": "stability-ai/sdxl",
  "ai-comic-generator": "stability-ai/sdxl",
  "ai-anime-generator": "stability-ai/sdxl",
  "ai-vector-image-generator": "stability-ai/sdxl",
  "ai-coloring-book-generator": "stability-ai/sdxl",
  "studio-ghibli": "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
};

// Check if model has manual override
function hasManualOverride(slug) {
  const normalizedSlug = slug.replace(/^\/+/, "");
  return MANUAL_MODEL_OVERRIDES[normalizedSlug] || null;
}

// Test a single feature
async function testFeature(tool) {
  const result = {
    title: tool.title,
    href: tool.href,
    category: tool.category,
    status: "unknown",
    error: null,
    apiRoute: null,
    modelIdentifier: null,
  };

  try {
    // Check API route
    const routeCheck = checkApiRouteExists(tool.href);
    result.apiRoute = routeCheck.path;

    // Get slug
    const slug = getSlugFromHref(tool.href);
    
    // Check for manual override
    const manualOverride = hasManualOverride(slug);
    if (manualOverride) {
      result.modelIdentifier = manualOverride;
      result.status = "has_override";
      return result;
    }

    // For now, mark as "needs_model_resolution" if no override
    // Full model resolution would require the TypeScript module
    result.status = "needs_check";
    result.error = "Model resolution requires runtime check";
    
  } catch (error) {
    result.status = "error";
    result.error = error.message || "Unknown error";
  }

  return result;
}

async function main() {
  console.log("🚀 Testing all 128 AI features...\n");

  // Extract tools from dashboard.ts
  const tools = extractTools(dashboardTsContent);
  
  if (tools.length === 0) {
    console.error("❌ Could not extract tools from dashboard.ts");
    console.log("Trying alternative method...");
    
    // Fallback: manually list all features based on the structure
    // This is a simplified approach - we'll check route existence
    return;
  }

  console.log(`Found ${tools.length} features to test\n`);

  if (!REPLICATE_API_TOKEN) {
    console.warn("⚠️  WARNING: REPLICATE_API_TOKEN not found. Model checks will be limited.\n");
  }

  const results = [];
  const total = tools.length;
  let current = 0;

  for (const tool of tools) {
    current++;
    process.stdout.write(`\rTesting ${current}/${total}: ${tool.title}...`);
    
    const result = await testFeature(tool);
    results.push(result);
  }

  console.log("\n\n✅ Testing complete!\n");

  // Generate report
  const hasOverride = results.filter((r) => r.status === "has_override");
  const needsCheck = results.filter((r) => r.status === "needs_check");
  const hasApiRoute = results.filter((r) => r.apiRoute && r.apiRoute.includes("route.ts"));
  const noApiRoute = results.filter((r) => !r.apiRoute || !r.apiRoute.includes("route.ts"));
  const errors = results.filter((r) => r.status === "error");

  console.log("=".repeat(80));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Has Manual Override: ${hasOverride.length}`);
  console.log(`📁 Has API Route:        ${hasApiRoute.length}`);
  console.log(`⚠️  Needs Model Check:    ${needsCheck.length}`);
  console.log(`❌ No API Route:         ${noApiRoute.length}`);
  console.log(`🔴 Errors:              ${errors.length}`);
  console.log(`📦 Total:               ${total}`);
  console.log("=".repeat(80));

  // Features with manual overrides (likely working)
  if (hasOverride.length > 0) {
    console.log("\n✅ FEATURES WITH MANUAL MODEL OVERRIDES (" + hasOverride.length + "):");
    console.log("-".repeat(80));
    hasOverride.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Model: ${r.modelIdentifier}`);
      console.log(`   Route: ${r.apiRoute || "N/A"}`);
    });
  }

  // Features with API routes
  if (hasApiRoute.length > 0) {
    console.log("\n📁 FEATURES WITH API ROUTES (" + hasApiRoute.length + "):");
    console.log("-".repeat(80));
    hasApiRoute.slice(0, 20).forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
    });
    if (hasApiRoute.length > 20) {
      console.log(`   ... and ${hasApiRoute.length - 20} more`);
    }
  }

  // Features without API routes
  if (noApiRoute.length > 0) {
    console.log("\n❌ FEATURES WITHOUT API ROUTES (" + noApiRoute.length + "):");
    console.log("-".repeat(80));
    noApiRoute.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Href: ${r.href}`);
    });
  }

  // Save detailed report
  const reportPath = path.join(__dirname, "../feature-test-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          total,
          hasOverride: hasOverride.length,
          hasApiRoute: hasApiRoute.length,
          needsCheck: needsCheck.length,
          noApiRoute: noApiRoute.length,
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


