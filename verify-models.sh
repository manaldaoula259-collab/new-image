#!/bin/bash

# Verification script for AI Image Models
# This checks that ONLY the new models from the user's list are present

echo "=== AI Image Models Verification ==="
echo ""

# Count models in dashboard-image-models.ts
dashboard_count=$(grep -c 'category: "image-models"' src/data/dashboard-image-models.ts)
echo "✓ Dashboard models count: $dashboard_count"

# Count models in modelCatalog.ts (full paths only)
catalog_count=$(grep -c '"ai-image-models/' src/core/replicate/modelCatalog.ts)
echo "✓ Model catalog count: $catalog_count"

echo ""
echo "=== Checking for OLD models that should be REMOVED ==="

# List of OLD models that should NOT exist
old_models=(
    "flux-1-1-pro"
    "flux-fill-pro"
    "flux-redux"
    "flux-canny-pro"
    "flux-depth-pro"
    "recraft-v3"
    "recraft-v3-svg"
    "hidream-i1-full"
    "hidream-i1-dev"
    "hidream-i1-fast"
    "hunyuan-image"
    "kling-2-image"
    "kolors"
    "juggernaut-xl"
    "realvis-xl-v5"
    "dalle-3"
    "midjourney-style"
    "dreamshaper-xl"
    "proteus-v0-5"
    "animagine-xl-v3-1"
    "pony-diffusion-xl"
    "openjourney-v4"
    "pixart-sigma"
    "kandinsky-3"
    "wuerstchen"
    "qwen-vl-image"
)

found_old=0
for model in "${old_models[@]}"; do
    if grep -q "\"ai-image-models/$model\"" src/core/replicate/modelCatalog.ts; then
        echo "❌ FOUND OLD MODEL: $model"
        found_old=1
    fi
done

if [ $found_old -eq 0 ]; then
    echo "✓ No old models found - all removed successfully!"
fi

echo ""
echo "=== Verification of NEW models ==="

# Sample check of new models
new_models=(
    "p-image"
    "z-image-turbo"
    "flux-2-max"
    "seedream-4-5"
    "imagen-4-ultra"
    "hidream-11-fast"
    "hunyuan-image-3"
)

all_found=1
for model in "${new_models[@]}"; do
    if grep -q "\"ai-image-models/$model\"" src/core/replicate/modelCatalog.ts; then
        echo "✓ Found new model: $model"
    else
        echo "❌ MISSING new model: $model"
        all_found=0
    fi
done

echo ""
if [ $all_found -eq 1 ] && [ $found_old -eq 0 ]; then
    echo "🎉 SUCCESS! All models correctly updated!"
    echo "   - $dashboard_count new models in dashboard"
    echo "   - $catalog_count models in catalog"
    echo "   - No old models remaining"
else
    echo "⚠️  WARNING: Some issues detected above"
fi
