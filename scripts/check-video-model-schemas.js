#!/usr/bin/env node

/**
 * Check each video model's API schema on Replicate
 * to determine parameter requirements
 */

const https = require('https');

const models = [
    'wan-video/wan-2.5-t2v',
    'wan-video/wan-2.5-i2v',
    'wan-video/wan-2.5-t2v-fast',
    'wan-video/wan-2.5-i2v-fast',
    'wan-video/wan-2.2-i2v-fast',
    'google/veo-3.1',
    'google/veo-3.1-fast',
    'google/veo-3',
    'google/veo-3-fast',
    'google/veo-2',
    'minimax/hailuo-2.3',
    'minimax/hailuo-2.3-fast',
    'pixverse/pixverse-v5',
    'pixverse/pixverse-v4',
    'bytedance/seedance-1-pro-fast',
];

console.log('🔍 Checking Video Model API Schemas on Replicate...\n');

async function checkModelSchema(model) {
    return new Promise((resolve) => {
        const url = `https://replicate.com/${model}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`\n${'='.repeat(60)}`);
                console.log(`📋 ${model}`);
                console.log('='.repeat(60));

                // Try to extract schema info from the page
                const hasAspectRatio = data.includes('aspect_ratio') || data.includes('aspectRatio');
                const hasNegativePrompt = data.includes('negative_prompt') || data.includes('negativePrompt');
                const hasPrompt = data.includes('"prompt"') || data.includes('prompt:');
                const hasImage = data.includes('image_input') || data.includes('"image"');

                console.log(`Prompt: ${hasPrompt ? '✅' : '❌'}`);
                console.log(`Image Input: ${hasImage ? '✅' : '❌'}`);
                console.log(`Aspect Ratio: ${hasAspectRatio ? '✅' : '❌'}`);
                console.log(`Negative Prompt: ${hasNegativePrompt ? '✅' : '❌'}`);

                resolve({
                    model,
                    hasPrompt,
                    hasImage,
                    hasAspectRatio,
                    hasNegativePrompt
                });
            });
        }).on('error', (e) => {
            console.log(`❌ ${model} - Error: ${e.message}`);
            resolve({ model, error: true });
        });
    });
}

async function run() {
    const results = [];
    for (const model of models) {
        const result = await checkModelSchema(model);
        results.push(result);
        await new Promise(r => setTimeout(r, 1000)); // Delay between requests
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    results.forEach(r => {
        if (!r.error) {
            console.log(`\n${r.model}:`);
            console.log(`  - Aspect Ratio: ${r.hasAspectRatio ? 'YES' : 'NO'}`);
            console.log(`  - Negative Prompt: ${r.hasNegativePrompt ? 'YES' : 'NO'}`);
        }
    });
}

run();
