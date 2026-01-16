/**
 * Seed Feature Flags Script
 * Run this script to populate the database with all feature flags
 * Usage: npx ts-node scripts/seed-feature-flags.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Feature Flag Schema (matching the model)
interface IFeatureFlag {
    key: string;
    name: string;
    description?: string;
    enabled: boolean;
    rolloutPercentage: number;
    targetUsers?: string[];
    targetUserGroups?: string[];
    conditions?: {
        minCredits?: number;
        accountAge?: number;
        [key: string]: any;
    };
    metadata?: {
        category?: string;
        tags?: string[];
        createdBy?: string;
        lastModifiedBy?: string;
    };
}

const featureFlags: Partial<IFeatureFlag>[] = [
    // ==========================================
    // Core Features
    // ==========================================
    {
        key: "prompt-wizard",
        name: "AI Prompt Wizard",
        description: "Enable AI-powered prompt enhancement and generation",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["core", "ai", "prompts"],
        },
    },
    {
        key: "media-library",
        name: "Media Library",
        description: "Enable media library for storing and managing generated images",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "general",
            tags: ["core", "storage"],
        },
    },
    {
        key: "credits-system",
        name: "Credits System",
        description: "Enable the credits-based payment system",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "payment",
            tags: ["core", "billing"],
        },
    },

    // ==========================================
    // AI Image Models - FLUX Series
    // ==========================================
    {
        key: "flux-1-1-pro",
        name: "FLUX 1.1 Pro",
        description: "Latest FLUX model with superior image quality",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["flux", "image-generation", "premium"],
        },
    },
    {
        key: "flux-1-1-pro-ultra",
        name: "FLUX 1.1 Pro Ultra",
        description: "Ultra high-resolution FLUX with up to 4MP output",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["flux", "image-generation", "ultra-hd"],
        },
    },
    {
        key: "flux-schnell",
        name: "FLUX Schnell",
        description: "Fast FLUX model optimized for speed",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["flux", "image-generation", "fast"],
        },
    },
    {
        key: "flux-dev",
        name: "FLUX Dev",
        description: "Development version of FLUX with high quality output",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["flux", "image-generation"],
        },
    },
    {
        key: "flux-pro",
        name: "FLUX Pro",
        description: "Professional FLUX model for commercial quality",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["flux", "image-generation", "professional"],
        },
    },

    // ==========================================
    // AI Photo Converter
    // ==========================================
    {
        key: "photo-to-ghibli",
        name: "Studio Ghibli Converter",
        description: "Transform photos into Studio Ghibli anime style",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["photo-converter", "anime", "style-transfer"],
        },
    },
    {
        key: "photo-to-cartoon",
        name: "Cartoon Converter",
        description: "Convert photos to cartoon style",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["photo-converter", "cartoon"],
        },
    },
    {
        key: "photo-to-3d",
        name: "3D Converter",
        description: "Transform 2D photos into 3D renders",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["photo-converter", "3d"],
        },
    },
    {
        key: "age-progression",
        name: "Age Progression",
        description: "Age progression and regression for photos",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["photo-converter", "age"],
        },
    },
    {
        key: "gender-swap",
        name: "Gender Swap",
        description: "Gender transformation for photos",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["photo-converter", "transformation"],
        },
    },

    // ==========================================
    // AI Image Editor
    // ==========================================
    {
        key: "ai-makeup",
        name: "AI Makeup",
        description: "Apply digital makeup to portraits",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-editor", "beauty"],
        },
    },
    {
        key: "hair-style-changer",
        name: "Hair Style Changer",
        description: "Change hairstyles in photos",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-editor", "hair"],
        },
    },
    {
        key: "expression-editor",
        name: "Expression Editor",
        description: "Edit facial expressions",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-editor", "face"],
        },
    },
    {
        key: "background-remover",
        name: "Background Remover",
        description: "Remove backgrounds from images",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-editor", "background"],
        },
    },
    {
        key: "object-remover",
        name: "Object Remover",
        description: "Remove unwanted objects from images",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-editor", "cleanup"],
        },
    },
    {
        key: "image-upscaler",
        name: "Image Upscaler",
        description: "Upscale images with AI enhancement",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-editor", "enhancement"],
        },
    },

    // ==========================================
    // AI Portrait
    // ==========================================
    {
        key: "ai-headshot-generator",
        name: "AI Headshot Generator",
        description: "Generate professional headshots",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["portrait", "professional"],
        },
    },
    {
        key: "ai-avatar-generator",
        name: "AI Avatar Generator",
        description: "Create custom avatars",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["portrait", "avatar"],
        },
    },

    // ==========================================
    // AI Image Effects
    // ==========================================
    {
        key: "face-swap",
        name: "AI Face Swap",
        description: "Swap faces in photos with AI precision",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-effects", "face"],
        },
    },
    {
        key: "clothes-changer",
        name: "AI Clothes Changer",
        description: "Change outfits in photos",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["image-effects", "fashion"],
        },
    },

    // ==========================================
    // AI Art Generator
    // ==========================================
    {
        key: "ai-character-generator",
        name: "AI Character Generator",
        description: "Generate unique character designs",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["art-generator", "character"],
        },
    },
    {
        key: "ai-logo-generator",
        name: "AI Logo Generator",
        description: "Create professional logos with AI",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["art-generator", "branding"],
        },
    },
    {
        key: "ai-tattoo-generator",
        name: "AI Tattoo Generator",
        description: "Design custom tattoos",
        enabled: true,
        rolloutPercentage: 100,
        metadata: {
            category: "ai",
            tags: ["art-generator", "tattoo"],
        },
    },

    // ==========================================
    // Beta Features
    // ==========================================
    {
        key: "video-generation",
        name: "AI Video Generation",
        description: "Generate videos from text or images (Beta)",
        enabled: false,
        rolloutPercentage: 10,
        metadata: {
            category: "beta",
            tags: ["video", "experimental"],
        },
    },
    {
        key: "3d-model-generation",
        name: "3D Model Generation",
        description: "Generate 3D models from text (Beta)",
        enabled: false,
        rolloutPercentage: 10,
        metadata: {
            category: "beta",
            tags: ["3d", "experimental"],
        },
    },
    {
        key: "batch-processing",
        name: "Batch Processing",
        description: "Process multiple images at once",
        enabled: false,
        rolloutPercentage: 50,
        metadata: {
            category: "experimental",
            tags: ["productivity", "beta"],
        },
    },

    // ==========================================
    // Admin Features
    // ==========================================
    {
        key: "admin-analytics",
        name: "Advanced Analytics",
        description: "Detailed analytics and reporting for admins",
        enabled: true,
        rolloutPercentage: 100,
        targetUserGroups: ["admin"],
        metadata: {
            category: "general",
            tags: ["admin", "analytics"],
        },
    },
    {
        key: "admin-user-management",
        name: "User Management",
        description: "Advanced user management features",
        enabled: true,
        rolloutPercentage: 100,
        targetUserGroups: ["admin"],
        metadata: {
            category: "general",
            tags: ["admin", "users"],
        },
    },
];

async function seedFeatureFlags() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const FeatureFlagModel = mongoose.model(
            "FeatureFlag",
            new mongoose.Schema({
                key: { type: String, required: true, unique: true },
                name: { type: String, required: true },
                description: String,
                enabled: { type: Boolean, default: false },
                rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
                targetUsers: [String],
                targetUserGroups: [String],
                conditions: mongoose.Schema.Types.Mixed,
                metadata: {
                    category: String,
                    tags: [String],
                    createdBy: String,
                    lastModifiedBy: String,
                },
            }, {
                timestamps: true,
                collection: "feature_flags",
            })
        );

        console.log(`\n📝 Seeding ${featureFlags.length} feature flags...\n`);

        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const flag of featureFlags) {
            try {
                const existing = await FeatureFlagModel.findOne({ key: flag.key });

                if (existing) {
                    console.log(`⚠️  Skipping "${flag.name}" - already exists`);
                    skipped++;
                } else {
                    await FeatureFlagModel.create(flag);
                    console.log(`✅ Created "${flag.name}" (${flag.key})`);
                    created++;
                }
            } catch (error: any) {
                if (error.code === 11000) {
                    console.log(`⚠️  Skipping "${flag.name}" - duplicate key`);
                    skipped++;
                } else {
                    console.error(`❌ Error creating "${flag.name}":`, error.message);
                }
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⚠️  Skipped: ${skipped}`);
        console.log(`   📝 Total: ${featureFlags.length}`);

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
        console.log("🎉 Feature flags seeding completed!\n");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error seeding feature flags:", error);
        process.exit(1);
    }
}

// Run the seed function
seedFeatureFlags();
