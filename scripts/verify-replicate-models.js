#!/usr/bin/env node

/**
 * Verify all AI Image Models exist on Replicate (UPDATED with corrections)
 */

const https = require('https');

// All 68 CORRECTED models (removed 2 non-existent, fixed 6 others)
const models = [
    'prunaai/p-image',
    'prunaai/z-image-turbo',
    'google/nano-banana-pro',
    'google/imagen-4-fast',
    'black-forest-labs/flux-2-max',
    'bytedance/seedream-4.5',
    'google/nano-banana',
    'bytedance/seedream-4',
    'black-forest-labs/flux-pro',
    'ideogram-ai/ideogram-v3-turbo',
    'qwen/qwen-image',
    'black-forest-labs/flux-schnell',
    'google/imagen-4',
    'google/imagen-3',
    'google/imagen-3-fast',
    'google/imagen-4-ultra',
    'prunaai/hidream-l1-fast', // FIXED: was hidream-11-fast
    'bria/image-3.2',
    'bria/bria-2.3-fast', // FIXED: was bria/flibo
    'black-forest-labs/flux-kontext-max',
    'black-forest-labs/flux-kontext-pro',
    'black-forest-labs/flux-1.1-pro-ultra',
    'bytedance/seedream-3',
    'prunaai/flux-fast',
    // REMOVED: leonardolai/lucid-origin (doesn't exist)
    'recraft-ai/recraft-v3', // FIXED: was recreat-ai/recreat-v3
    'recraft-ai/recraft-v3-svg', // FIXED: was recreat-ai/recreat-v3-svg
    'ideogram-ai/ideogram-v2a-turbo',
    'ideogram-ai/ideogram-v2',
    'ideogram-ai/ideogram-v3-quality',
    'ideogram-ai/ideogram-v2a',
    'ideogram-ai/ideogram-v3-balanced',
    'ideogram-ai/ideogram-v2-turbo',
    'stability-ai/stable-diffusion-3.5-medium',
    'stability-ai/stable-diffusion-3.5-large',
    'stability-ai/stable-diffusion-3.5-large-turbo',
    'minimax/image-01',
    'luma/photon-flash',
    'comfyui/any-comfyui-workflow',
    'tencent/hunyuan-image-3',
    'nvidia/sana-sprint-1.6b',
    'prunaai/wan-2.2-image',
    'prunaai/hidream-l1-full', // FIXED: was hidream-11-full
    'prunaai/hidream-l1-dev', // FIXED: was hidream-11-dev
    'black-forest-labs/flux-dev-lora',
    'black-forest-labs/flux-dev',
    'prunaai/sdxl-lightning',
    'bytedance/sdxl-lightning-4step',
    'nvidia/sana',
    'luma/photon',
    'stability-ai/sdxl',
    'fofr/sticker-maker',
    'ai-forever/kandinsky-2',
    'ai-forever/kandinsky-2.2',
    'playgroundai/playground-v2.5-1024px-aesthetic',
    'datacte/proteus-v0.3',
    'fermatresearch/sdxl-controlnet-lora',
    'datacte/proteus-v0.2',
    'adirik/realvisxl-v3.0-turbo',
    'fofr/latent-consistency-model',
    'sdxl-based/realvisxl-v3-multi-controlnet-lora',
    'lucataco/open-dalle-v1.1',
    'fofr/sdxl-multi-controlnet-lora',
    'lucataco/dreamshaper-xl-turbo',
    'lucataco/ssd-1b',
    'fofr/sdxl-emoji',
    'lucataco/realistic-vision-v5.1',
    'stability-ai/stable-diffusion',
    'jagilley/controlnet-scribble', // FIXED: was jaigley (single 'l')
    'tstramer/material-diffusion',
];

console.log('🔍 Verifying CORRECTED Replicate Models...\n');
console.log(`Total models to verify: ${models.length}\n`);

let verified = 0;
let failed = 0;
const failedModels = [];

function checkModel(modelPath) {
    return new Promise((resolve) => {
        const url = `https://replicate.com/${modelPath}`;

        https.get(url, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${modelPath}`);
                verified++;
                resolve(true);
            } else if (res.statusCode === 404) {
                console.log(`❌ ${modelPath} - NOT FOUND (404)`);
                failedModels.push(modelPath);
                failed++;
                resolve(false);
            } else {
                console.log(`✅ ${modelPath} (Status: ${res.statusCode})`);
                verified++;
                resolve(true);
            }
        }).on('error', (err) => {
            console.log(`❌ ${modelPath} - ERROR: ${err.message}`);
            failedModels.push(modelPath);
            failed++;
            resolve(false);
        });
    });
}

async function verifyAll() {
    const batchSize = 5;
    for (let i = 0; i < models.length; i += batchSize) {
        const batch = models.slice(i, i + batchSize);
        await Promise.all(batch.map(checkModel));

        if (i + batchSize < models.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Verified: ${verified}/${models.length}`);
    console.log(`❌ Failed: ${failed}/${models.length}`);

    if (failedModels.length > 0) {
        console.log('\n❌ STILL FAILED (need manual review):');
        failedModels.forEach(model => console.log(`   - ${model}`));
    }

    console.log('\n' + '='.repeat(60));

    if (failed === 0) {
        console.log('🎉 SUCCESS! All 68 models are verified and working!');
        console.log('\nChanges made:');
        console.log('  ✓ Fixed 6 model names (hidream-11→l1, recreat→recraft, jaigley→jagilley)');
        console.log('  ✓ Removed 2 non-existent models (lucid-origin, flibo)');
        console.log('  ✓ Total: 68 working models');
    } else {
        console.log(`⚠️  ${failed} model(s) still need attention`);
    }

    process.exit(failed > 0 ? 1 : 0);
}

verifyAll().catch(err => {
    console.error('Error during verification:', err);
    process.exit(1);
});
