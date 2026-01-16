'use strict';

const { config } = require('dotenv');
const { resolve } = require('path');
const Replicate = require('replicate');
const OpenAI = require('openai');

// Load environment variables from .env.local or .env
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');
const fs = require('fs');

if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.warn('⚠️  Warning: Neither .env.local nor .env file found. Using system environment variables.');
}

async function testReplicateApiKey() {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  const result = {
    name: 'Replicate API',
    configured: false,
    working: false,
  };

  if (!apiKey) {
    result.error = 'REPLICATE_API_TOKEN environment variable is not set';
    return result;
  }

  result.configured = true;

  try {
    const replicate = new Replicate({
      auth: apiKey,
    });

    // Test by fetching models list (lightweight operation)
    await replicate.models.list();
    
    result.working = true;
    result.details = 'Successfully connected to Replicate API';
  } catch (error) {
    result.working = false;
    if (error instanceof Error) {
      result.error = error.message;
    } else {
      result.error = 'Unknown error occurred';
    }
  }

  return result;
}

async function testOpenAIApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  const result = {
    name: 'OpenAI API',
    configured: false,
    working: false,
  };

  if (!apiKey) {
    result.error = 'OPENAI_API_KEY environment variable is not set';
    return result;
  }

  result.configured = true;

  try {
    const openai = new OpenAI({
      apiKey,
    });

    // Test by listing models (lightweight operation)
    await openai.models.list();
    
    result.working = true;
    result.details = 'Successfully connected to OpenAI API';
  } catch (error) {
    result.working = false;
    if (error instanceof Error) {
      result.error = error.message;
    } else {
      result.error = 'Unknown error occurred';
    }
  }

  return result;
}

async function main() {
  console.log('🔍 Testing API Keys...\n');
  console.log('='.repeat(50));

  const results = [];

  // Test Replicate API
  console.log('\n📡 Testing Replicate API...');
  const replicateResult = await testReplicateApiKey();
  results.push(replicateResult);

  // Test OpenAI API
  console.log('\n🤖 Testing OpenAI API...');
  const openaiResult = await testOpenAIApiKey();
  results.push(openaiResult);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results Summary:\n');

  results.forEach((result) => {
    const statusIcon = result.working ? '✅' : result.configured ? '❌' : '⚠️';
    const statusText = result.working ? 'WORKING' : result.configured ? 'FAILED' : 'NOT CONFIGURED';
    
    console.log(`${statusIcon} ${result.name}: ${statusText}`);
    
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  });

  // Exit with appropriate code
  const allWorking = results.every((r) => r.working);
  const allConfigured = results.every((r) => r.configured);
  
  if (!allConfigured) {
    console.log('⚠️  Some API keys are not configured. Please check your .env.local file.');
    process.exit(1);
  }
  
  if (!allWorking) {
    console.log('❌ Some API keys are not working. Please verify your credentials.');
    process.exit(1);
  }
  
  console.log('✅ All API keys are working correctly!');
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

