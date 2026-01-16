const https = require('https');

// Best guess mappings based on user request
const modelsToCheck = [
    // Wan Video
    'wan-video/wan-2.5-t2v',
    'wan-video/wan-2.5-i2v',
    'wan-video/wan-2.5-t2v-fast',
    'wan-video/wan-2.5-i2v-fast',
    'wan-video/wan-2.2-i2v-fast',

    // Google Veo
    'google/veo-3.1',
    'google/veo-3.1-fast',
    'google/veo-3',
    'google/veo-3-fast',
    'google/veo-2',

    // PixVerse
    'pixverse/pixverse-v5',
    'pixverse/pixverse-v4',

    // Minimax
    'minimax/hailuo-2.3',
    'minimax/hailuo-2.3-fast',

    // Bytedance
    'bytedance/seedance-1-pro-fast',

    // Kling
    'kvaivgi/kling-v2.5-turbo-pro',

    // Sora (checking likely candidates as official Sora isn't public)
    'sora-2', // Likely placeholder or incorrect
    'sora-2-pro', // Likely placeholder or incorrect
];

console.log('🔍 Checking Availability of Requested Video Models on Replicate...\n');

async function checkModel(model) {
    return new Promise((resolve) => {
        // If it doesn't look like a full path (owner/name), skip or mark suspicious
        if (!model.includes('/')) {
            console.log(`⚠️  ${model} - format looks incomplete (missing owner/)`);
            resolve({ model, status: 'suspicious' });
            return;
        }

        const url = `https://replicate.com/${model}`;
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${model} - EXISTS`);
                resolve({ model, status: 'available' });
            } else if (res.statusCode === 404) {
                console.log(`❌ ${model} - NOT FOUND`);
                resolve({ model, status: 'not_found' });
            } else {
                console.log(`⚠️  ${model} - Status: ${res.statusCode}`);
                resolve({ model, status: 'warning' });
            }
        }).on('error', (e) => {
            console.log(`❌ ${model} - Error: ${e.message}`);
            resolve({ model, status: 'error' });
        });
    });
}

async function run() {
    for (const model of modelsToCheck) {
        await checkModel(model);
        await new Promise(r => setTimeout(r, 500)); // Delay to be nice
    }
}

run();
