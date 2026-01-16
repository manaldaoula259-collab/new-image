# MyDzine - AI-Powered Creative Platform

A complete, production-ready SaaS platform featuring **100+ AI tools** across 11 categories for image generation, video creation, editing, and transformation. Built with Next.js 14, React 18, and TypeScript, powered by Replicate, OpenAI, and cutting-edge AI models.

## 🚀 Features

### 100+ AI-Powered Tools Across 11 Categories

**AI Image Models (40+ Models):**
- **FLUX Series:** FLUX 1.1 Pro, Pro Ultra, Schnell, Dev, Kontext Pro/Max, Fill Pro, Redux, Canny Pro, Depth Pro
- **Top Models:** Seedream 3.0/4.0, Ideogram V3, Ideogram V2 Turbo, Recraft V3/SVG, Hidream I1 (Full/Dev/Fast)
- **Stable Diffusion:** SD 3.5 Large, SD 3.5 Turbo, SDXL, SDXL Lightning, Playground V3, Kolors
- **Specialized:** Juggernaut XL, RealVisXL V5, Dreamshaper XL, Proteus V0.5, AnimagineXL V3.1, Pony Diffusion XL
- **More:** OpenJourney V4, Pixart Sigma, Kandinsky 3.0, Wuerstchen, Qwen VL, Hunyuan, Kling 2.0, Sana, Midjourney Style, DALL-E 3

**AI Video Models (12 Models):**
- Kling 2.0 Video, Minimax Video, Hunyuan Video, Wan 2.1 Video, LTX Video
- CogVideoX-5B, Stable Video Diffusion, AnimateDiff Lightning
- Luma Dream Machine, Runway Gen-3, Pika Video, Image-to-Video

**AI Photo Converter (15 Styles):**
- Studio Ghibli, Action Figure, Pet to Human, Watercolor, Clay
- Illustration, Pixel Art, Pixar, Lego, 3D Render
- Disney, Cartoon, Cyberpunk, Simpsons, Oil Painting

**AI Image Effects (13 Tools):**
- AI Face Swap, New Yorker Cartoon, Album Cover, Kpop Demon Hunter
- Pet Passport Photo, Labubu Doll, Ghibli Generator, Clothes Changer
- Halloween Filter & Costumes, Zootopia Filter, Christmas Filter

**AI Photo Filters (6 Tools):**
- Image-to-Prompt Generator - Generate detailed prompts from reference images
- AI Design Sketch - Transform sketches into polished concept designs
- AI Anime Filter - Convert portraits to anime-style artwork
- AI Style Transfer - Apply artistic styles instantly
- 2D to 3D Converter - Transform flat images into 3D models
- Turn Sketch to Art - Transform rough sketches into finished artwork

**AI Image Editors (7 Tools):**
- Remove Background - Studio-quality background removal
- Remove/Add Objects - Erase or insert elements seamlessly
- AI Photo Enhancer - Upscale and sharpen with natural detail
- AI Photo Expand - Extend borders with generative fill
- Vectorize Image - Convert rasters to clean vectors
- Watermark Remover - Clean watermark removal

**AI Upscalers (6 Tools):**
- Real-ESRGAN 4x+ (4x upscaling), Clarity Upscaler, SUPIR (super-resolution)
- GFPGAN Face Restore, CodeFormer (face restoration), Anime Upscaler

**ControlNet & Guidance (11 Tools):**
- **Edge/Depth:** Canny, Soft Edge, Line Art, Depth
- **Pose/Structure:** Pose control, Scribble
- **Identity:** IP-Adapter, IP-Adapter Face, InstantID, PhotoMaker
- **Special:** QR Code Generator (artistic functional QR codes)

**Background Tools (4 Tools):**
- Background Remover Pro, Background Generator, Background Blur, Background Replace

**Portrait Tools (6 Tools):**
- AI Headshot Generator, Age Progression, Gender Swap
- AI Makeup, Hair Style Changer, Expression Editor

**AI Art Generators (5 Tools):**
- AI Character Generator, AI Anime Generator, AI Comic Generator
- AI Coloring Book Generator, AI Vector Image Generator

### Core Platform Features

- **User Authentication** - Complete authentication system with Clerk (social logins, email/password)
- **Payment Processing** - Stripe integration with webhook support for instant credit updates
- **Credit System** - Flexible credit-based monetization with 3 credit packages (250, 750, 2000 credits)
- **Media Library** - Automatic saving of all generated images and videos with metadata tracking
- **Admin Panel** - Comprehensive dashboard for user management, analytics, media moderation, and feature flags
- **Usage Analytics** - Dashboard with usage statistics and credit consumption monitoring
- **Gallery System** - Browse and organize all creations with download and share functionality
- **Fully Responsive** - Premium dark theme UI with Chakra UI, glassmorphism design, and mobile-optimized interface

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router for optimal performance
- **React 18** - Modern React with latest features
- **TypeScript** - Full type safety throughout
- **Chakra UI v2.4.2** - Beautiful, accessible component library
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Efficient data fetching and caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB with Mongoose** - Document storage and usage tracking
- **TypeScript** - Type-safe backend code
- **Custom Error Handling** - Comprehensive error management with custom error classes
- **Centralized Logging** - Production-ready logging utility

### Third-Party Integrations
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing and credit packages
- **Replicate API** - AI image generation, video creation, and processing (100+ models)
- **OpenAI API** - GPT-4 Vision for image-to-prompt generation
- **AWS S3** - Cloud storage for generated images and videos
- **Vercel Analytics** - Application analytics and monitoring

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **MongoDB** database (local or MongoDB Atlas)
- **Replicate API** token for AI processing
- **OpenAI API** key (optional, for image-to-prompt feature)
- **Clerk** account for authentication
- **Stripe** account for payments
- **AWS** account with S3 bucket for image storage

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mydzine
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

   # Database (MongoDB)
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/mydzine?retryWrites=true&w=majority

   # AI Providers
   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
   OPENAI_API_KEY=sk-xxxxxxxxxxxxx

   # Payment Processing (Stripe)
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

   # Cloud Storage (AWS S3)
   AWS_S3_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_S3_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_S3_BUCKET_NAME=your-s3-bucket-name
   AWS_S3_REGION=your-s3-region

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   For detailed environment variable setup instructions, see the `documentation/env-setup.html` file.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
mydzine/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (auth)/            # Protected routes (dashboard, studio)
│   │   ├── (public)/          # Public routes (tools, gallery, etc.)
│   │   └── api/               # API endpoints
│   ├── components/            # React components
│   │   ├── common/           # Shared components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── home/             # Homepage components
│   │   ├── pages/            # Page-specific components
│   │   └── projects/         # Project-related components
│   ├── core/                  # Core utilities and clients
│   │   ├── clients/          # API clients (Replicate, OpenAI)
│   │   ├── replicate/        # Replicate model catalog and utilities
│   │   └── utils/            # Utility functions (logger, credits, etc.)
│   ├── lib/                   # Library configurations
│   │   ├── mongodb.ts        # MongoDB connection
│   │   └── stripe.ts         # Stripe configuration
│   ├── models/                # Mongoose models
│   ├── data/                  # Dashboard and model configurations
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── public/                     # Static assets
├── documentation/              # HTML documentation files
├── instrumentation.ts          # Next.js instrumentation hook
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
```

## 🚀 Deployment

### AWS EC2 (Recommended)

For deployments without file size limits, AWS EC2 is recommended. See `documentation/install-aws-ec2.html` for detailed instructions.

### Vercel

The platform is also optimized for Vercel deployment. See `documentation/install-vercel.html` for setup instructions.

### Build for Production

```bash
npm run build
npm start
```

## 🔑 Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend API key | [Clerk Dashboard](https://clerk.com/) |
| `CLERK_SECRET_KEY` | Clerk backend API key | [Clerk Dashboard](https://clerk.com/) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret | Clerk Dashboard → Webhooks |
| `MONGODB_URI` | MongoDB connection string | [MongoDB Atlas](https://cloud.mongodb.com/) |
| `REPLICATE_API_TOKEN` | Replicate API token | [Replicate Account](https://replicate.com/account/api-tokens) |
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Stripe Dashboard → Webhooks |
| `AWS_S3_ACCESS_KEY_ID` | AWS S3 access key ID | [AWS Console](https://aws.amazon.com/s3/) |
| `AWS_S3_SECRET_ACCESS_KEY` | AWS S3 secret access key | [AWS Console](https://aws.amazon.com/s3/) |
| `AWS_S3_BUCKET_NAME` | AWS S3 bucket name | [AWS Console](https://aws.amazon.com/s3/) |
| `AWS_S3_REGION` | AWS S3 region | [AWS Console](https://aws.amazon.com/s3/) |
| `NEXT_PUBLIC_APP_URL` | Application public URL | Your domain or localhost |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for image-to-prompt feature |
| `REPLICATE_USERNAME` | Replicate username for model hosting |
| `REPLICATE_MAX_TRAIN_STEPS` | Maximum training steps (default: 3000) |
| `NEXT_PUBLIC_STUDIO_SHOT_AMOUNT` | Studio shot amount for pricing display |

## 💳 Credit System

The platform uses a flexible credit-based monetization system:

- **Credit Packages**: Three tiers - 250, 750, and 2000 credits
- **Prompt Credits**: Each package includes bonus prompt wizard credits (50, 150, 400 respectively)
- **Pricing**: $29 (250 credits), $69 (750 credits), $149 (2000 credits)
- **Automatic Deduction**: Credits are automatically deducted per operation based on tool complexity
- **Real-time Tracking**: Credit balance updates in real-time across all tools
- **Configurable Pricing**: Credit costs are configurable per tool in the admin panel

### Credit Packages

| Package | Credits | Prompt Credits | Price | Price/Credit |
|---------|---------|----------------|-------|--------------|
| Starter | 250 | 50 | $29 | $0.12 |
| Popular | 750 | 150 | $69 | $0.09 |
| Pro | 2000 | 400 | $149 | $0.075 |

## 📚 Documentation

Comprehensive HTML documentation is available in the `documentation/` folder:

- `index.html` - Overview and getting started
- `env-setup.html` - Environment variable configuration
- `clerk-setup.html` - Clerk authentication setup
- `stripe-setup.html` - Stripe payment setup
- `replicate-setup.html` - Replicate API setup
- `mongodb-setup.html` - MongoDB database setup
- `install-aws-ec2.html` - AWS EC2 deployment guide
- `install-vercel.html` - Vercel deployment guide
- `pricing-credits.html` - Credit system configuration
- `frontend-customization.html` - Frontend customization guide

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript** - Full type safety throughout the codebase
- **ESLint** - Code linting with Next.js configuration
- **Error Handling** - Custom error classes and comprehensive error management
- **Strict Mode** - JavaScript strict mode enabled
- **Function Length** - Functions kept under 100 lines (except React components)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is private and proprietary.

## 🤝 Support

For setup assistance and troubleshooting, refer to the documentation files in the `documentation/` folder.

## 🎯 Use Cases

This platform is perfect for:

- **Designers** - Professional image editing, generation, and video creation tools
- **Content Creators** - Generate unique visuals, videos, and effects for social media and marketing
- **Artists** - Create AI art, transform sketches, apply artistic styles, and explore 40+ image models
- **Businesses** - Create marketing materials, product visuals, and branded content
- **Developers** - Generate assets for applications, websites, and games
- **Educators** - Create educational content, illustrations, and visual materials
- **Video Creators** - Generate AI videos with 12 different video models
- **Photo Editors** - Professional photo enhancement, background removal, and object manipulation
- **Hobbyists** - Explore AI art generation, photo conversion, and creative effects

---

Built with ❤️ using Next.js, React, and TypeScript

