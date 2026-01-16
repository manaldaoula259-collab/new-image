/**
 * Comprehensive test script to verify all 128 AI features
 * Tests model resolution and API functionality
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Read dashboard tools
const dashboardTsPath = path.join(__dirname, "../src/data/dashboard.ts");
const dashboardTsContent = fs.readFileSync(dashboardTsPath, "utf-8");

// Extract tools from dashboard.ts
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

// Get slug from href - matches how API routes extract slugs
function getSlugFromHref(href) {
  // Remove leading slash and return the rest (matches API route behavior)
  return href.replace(/^\/+/, "");
}

// Read manual model overrides from modelCatalog.ts
function getManualOverrides() {
  const catalogPath = path.join(__dirname, "../src/core/replicate/modelCatalog.ts");
  const catalogContent = fs.readFileSync(catalogPath, "utf-8");
  
  const overrides = {};
  const overrideRegex = /"([^"]+)":\s*"([^"]+)"/g;
  let match;
  
  while ((match = overrideRegex.exec(catalogContent)) !== null) {
    overrides[match[1]] = match[2];
  }
  
  return overrides;
}

// Test if model exists on Replicate
async function testModelExists(modelIdentifier) {
  if (!REPLICATE_API_TOKEN) {
    return { exists: false, error: "No API token" };
  }

  try {
    const Replicate = require("replicate");
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    
    // Extract owner and name from model identifier
    const parts = modelIdentifier.split(":");
    const modelPath = parts[0];
    const [owner, name] = modelPath.split("/");
    
    if (!owner || !name) {
      return { exists: false, error: "Invalid model format" };
    }

    // Try to get model info
    const model = await replicate.models.get(owner, name);
    
    return {
      exists: true,
      model: model,
      latestVersion: model.latest_version?.id || null,
    };
  } catch (error) {
    if (error.status === 404) {
      return { exists: false, error: "Model not found" };
    } else if (error.status === 402) {
      return { exists: true, error: "Payment required (insufficient credits)" };
    } else {
      return { exists: false, error: error.message || "Unknown error" };
    }
  }
}

// Test a single feature
async function testFeature(tool, manualOverrides) {
  const result = {
    title: tool.title,
    href: tool.href,
    category: tool.category,
    status: "unknown",
    error: null,
    modelIdentifier: null,
    modelExists: false,
    hasOverride: false,
  };

  try {
    // Get slug
    const slug = getSlugFromHref(tool.href);
    
    // Check for manual override
    const override = manualOverrides[slug];
    if (override) {
      result.hasOverride = true;
      result.modelIdentifier = override;
      
      // Test if model exists
      const modelTest = await testModelExists(override);
      result.modelExists = modelTest.exists;
      
      if (modelTest.exists) {
        result.status = "working";
      } else {
        result.status = "not_working";
        result.error = modelTest.error || "Model not found";
      }
    } else {
      result.status = "no_override";
      result.error = "No manual override found - relies on catalog search";
    }
    
  } catch (error) {
    result.status = "error";
    result.error = error.message || "Unknown error";
  }

  return result;
}

async function main() {
  console.log("🚀 Comprehensive Feature Testing\n");
  console.log("Testing all 128 AI features...\n");

  if (!REPLICATE_API_TOKEN) {
    console.warn("⚠️  WARNING: REPLICATE_API_TOKEN not found. Model existence checks will be limited.\n");
  }

  // Extract tools
  const tools = extractTools(dashboardTsContent);
  console.log(`Found ${tools.length} features to test\n`);

  // Get manual overrides
  const manualOverrides = getManualOverrides();
  console.log(`Found ${Object.keys(manualOverrides).length} manual model overrides\n`);

  const results = [];
  const total = tools.length;
  let current = 0;

  for (const tool of tools) {
    current++;
    process.stdout.write(`\rTesting ${current}/${total}: ${tool.title}...`);
    
    const result = await testFeature(tool, manualOverrides);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n\n✅ Testing complete!\n");

  // Generate report
  const working = results.filter((r) => r.status === "working");
  const notWorking = results.filter((r) => r.status === "not_working");
  const noOverride = results.filter((r) => r.status === "no_override");
  const errors = results.filter((r) => r.status === "error");

  console.log("=".repeat(80));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Working:           ${working.length}`);
  console.log(`❌ Not Working:        ${notWorking.length}`);
  console.log(`⚠️  No Override:        ${noOverride.length}`);
  console.log(`🔴 Errors:            ${errors.length}`);
  console.log(`📦 Total:             ${total}`);
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
      console.log(`   Model: ${r.modelIdentifier}`);
      console.log(`   Error: ${r.error}`);
    });
  }

  // No override features
  if (noOverride.length > 0) {
    console.log("\n⚠️  FEATURES WITHOUT OVERRIDES (" + noOverride.length + "):");
    console.log("-".repeat(80));
    noOverride.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.category})`);
      console.log(`   Href: ${r.href}`);
      console.log(`   Slug: ${getSlugFromHref(r.href)}`);
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

  // Save detailed report
  const reportPath = path.join(__dirname, "../comprehensive-test-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          total,
          working: working.length,
          notWorking: notWorking.length,
          noOverride: noOverride.length,
          errors: errors.length,
        },
        results,
        testedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

main().catch(console.error);

