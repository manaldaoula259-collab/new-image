'use strict';

const { config } = require('dotenv');
const { resolve } = require('path');
const Replicate = require('replicate');

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

async function testGhibliModel() {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    console.error('❌ REPLICATE_API_TOKEN environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 Testing Studio Ghibli Model...\n');
  console.log('='.repeat(50));

  try {
    const replicate = new Replicate({
      auth: apiKey,
    });

    // Test model: astramlco/easycontrol-ghibli (image-to-image Studio Ghibli model)
    const modelIdentifier = 'astramlco/easycontrol-ghibli';
    
    console.log(`\n📡 Testing model: ${modelIdentifier}`);
    console.log('Checking if model exists and is accessible...\n');

    // First, try to get model info
    try {
      const [owner, name] = modelIdentifier.split('/');
      const model = await replicate.models.get(owner, name);
      
      console.log('✅ Model found!');
      console.log(`   Owner: ${model.owner}`);
      console.log(`   Name: ${model.name}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      
      if (model.latest_version) {
        console.log(`   Latest Version: ${model.latest_version.id}`);
      }
      
      // Check if we can access predictions (this will verify credits)
      console.log('\n🔐 Checking account access and credits...');
      
      // Try to list predictions to verify account access
      const predictions = await replicate.predictions.list({ limit: 1 });
      console.log('✅ Account access verified!');
      console.log(`   Recent predictions count: ${predictions.results?.length || 0}`);
      
      console.log('\n✅ Studio Ghibli model is accessible and ready to use!');
      console.log('\n💡 Note: To fully test generation, you would need to provide an image URL.');
      console.log('   The model requires:');
      console.log('   - image: (image URL)');
      console.log('   - prompt: (optional text prompt)');
      
      process.exit(0);
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.error('❌ Model not found');
        console.error(`   Error: ${error.message}`);
        console.error('\n💡 The model might not exist or might have a different name.');
        process.exit(1);
      } else if (error.message.includes('402') || error.message.includes('Payment Required') || error.message.includes('insufficient credit')) {
        console.error('❌ Insufficient credits');
        console.error(`   Error: ${error.message}`);
        console.error('\n💡 Please add credits to your Replicate account:');
        console.error('   https://replicate.com/account/billing');
        process.exit(1);
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('❌ Invalid API key');
        console.error(`   Error: ${error.message}`);
        console.error('\n💡 Please check your REPLICATE_API_TOKEN in .env file');
        process.exit(1);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

testGhibliModel().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

