#!/usr/bin/env node

/**
 * Comprehensive verification of all AI Video Models
 * Checks: Dashboard config, Model catalog mapping, Replicate availability
 */

const fs = require('fs');
const https = require('https');

console.log('🔍 COMPREHENSIVE VIDEO MODELS VERIFICATION\n');
console.log('='.repeat(60));

// Expected models from dashboard-video-models.ts
const expectedModels = [
    { slug: 'wan-2-5-t2v', replicate: 'wan-video/wan-2.5-t2v', title: 'Wan 2.5 Text to Video' },
    { slug: 'wan-2-5-i2v', replicate: 'wan-video/wan-2.5-i2v', title: 'Wan 2.5 Image to Video' },
    { slug: 'wan-2-5-t2v-fast', replicate: 'wan-video/wan-2.5-t2v-fast', title: 'Wan 2.5 T2V Fast' },
    { slug: 'wan-2-5-i2v-fast', replicate: 'wan-video/wan-2.5-i2v-fast', title: 'Wan 2.5 I2V Fast' },
    { slug: 'wan-2-2-i2v-fast', replicate: 'wan-video/wan-2.2-i2v-fast', title: 'Wan 2.2 I2V Fast' },
    { slug: 'veo-3-1', replicate: 'google/veo-3.1', title: 'Google Veo 3.1' },
    { slug: 'veo-3-1-fast', replicate: 'google/veo-3.1-fast', title: 'Google Veo 3.1 Fast' },
    { slug: 'veo-3', replicate: 'google/veo-3', title: 'Google Veo 3' },
    { slug: 'veo-3-fast', replicate: 'google/veo-3-fast', title: 'Google Veo 3 Fast' },
    { slug: 'veo-2', replicate: 'google/veo-2', title: 'Google Veo 2' },
    { slug: 'hailuo-2-3', replicate: 'minimax/hailuo-2.3', title: 'Minimax Hailuo 2.3' },
    { slug: 'hailuo-2-3-fast', replicate: 'minimax/hailuo-2.3-fast', title: 'Minimax Hailuo 2.3 Fast' },
    { slug: 'pixverse-v5', replicate: 'pixverse/pixverse-v5', title: 'PixVerse V5' },
    { slug: 'pixverse-v4', replicate: 'pixverse/pixverse-v4', title: 'PixVerse V4' },
    { slug: 'seedance-1-pro-fast', replicate: 'bytedance/seedance-1-pro-fast', title: 'Seedance 1 Pro Fast' },
];

let passed = 0;
let failed = 0;
const issues = [];

// Step 1: Check dashboard file exists and has correct count
console.log('\n📋 Step 1: Checking Dashboard Configuration...');
try {
    const dashboardContent = fs.readFileSync('src/data/dashboard-video-models.ts', 'utf8');
    const categoryMatches = dashboardContent.match(/category: "video-models"/g);
    const count = categoryMatches ? categoryMatches.length : 0;

    if (count === 15) {
        console.log(`✅ Dashboard has ${count} video models`);
        passed++;
    } else {
        console.log(`❌ Dashboard has ${count} models, expected 15`);
        failed++;
        issues.push(`Dashboard count mismatch: ${count} vs 15`);
    }
} catch (e) {
    console.log(`❌ Error reading dashboard file: ${e.message}`);
    failed++;
    issues.push('Dashboard file error');
}

// Step 2: Check model catalog mappings
console.log('\n🗺️  Step 2: Checking Model Catalog Mappings...');
try {
    const catalogContent = fs.readFileSync('src/core/replicate/modelCatalog.ts', 'utf8');

    let catalogPassed = 0;
    let catalogFailed = 0;

    expectedModels.forEach(model => {
        const fullPath = `"ai-video/${model.slug}": "${model.replicate}"`;
        const shortPath = `"${model.slug}": "${model.replicate}"`;

        if (catalogContent.includes(fullPath) && catalogContent.includes(shortPath)) {
            catalogPassed++;
        } else {
            catalogFailed++;
            console.log(`❌ Missing mapping for ${model.slug}`);
            issues.push(`Catalog missing: ${model.slug}`);
        }
    });

    if (catalogFailed === 0) {
        console.log(`✅ All ${catalogPassed} models correctly mapped in catalog`);
        passed++;
    } else {
        console.log(`❌ ${catalogFailed} models have mapping issues`);
        failed++;
    }
} catch (e) {
    console.log(`❌ Error reading catalog file: ${e.message}`);
    failed++;
    issues.push('Catalog file error');
}

// Step 3: Verify each model on Replicate
console.log('\n🌐 Step 3: Verifying Models on Replicate...');
console.log('(This may take a moment...)\n');

async function verifyOnReplicate() {
    let replicatePassed = 0;
    let replicateFailed = 0;

    for (const model of expectedModels) {
        await new Promise(resolve => {
            https.get(`https://replicate.com/${model.replicate}`, (res) => {
                if (res.statusCode === 200) {
                    console.log(`✅ ${model.title} (${model.replicate})`);
                    replicatePassed++;
                } else {
                    console.log(`❌ ${model.title} - Status: ${res.statusCode}`);
                    replicateFailed++;
                    issues.push(`Replicate unavailable: ${model.replicate}`);
                }
                resolve();
            }).on('error', (e) => {
                console.log(`❌ ${model.title} - Error: ${e.message}`);
                replicateFailed++;
                issues.push(`Replicate error: ${model.replicate}`);
                resolve();
            });
        });

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(60));

    if (replicateFailed === 0) {
        console.log(`✅ Replicate: All ${replicatePassed}/15 models available`);
        passed++;
    } else {
        console.log(`❌ Replicate: ${replicateFailed}/15 models failed`);
        failed++;
    }

    console.log(`\n✅ Passed Checks: ${passed}`);
    console.log(`❌ Failed Checks: ${failed}`);

    if (issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log('\n' + '='.repeat(60));

    if (failed === 0) {
        console.log('🎉 SUCCESS! All video models are properly configured and working!');
        process.exit(0);
    } else {
        console.log('⚠️  Some issues need attention (see above)');
        process.exit(1);
    }
}

verifyOnReplicate();
