[![NPM version](https://img.shields.io/npm/v/create-ml-starter?color=blue)](https://www.npmjs.com/package/create-ml-starter)
[![GitHub stars](https://img.shields.io/github/stars/SharanRP/ml-starter?style=social)](https://github.com/SharanRP/ml-starter)
# ML T3 Template 🤖

A production-ready ML web app template built with the [T3 Stack](https://create.t3.gg/) and [Replicate AI](https://replicate.com). Features a clean dark theme and comprehensive ML capabilities.

## ✨ Features

- 🚀 **T3 Stack**: Next.js 15, TypeScript, TailwindCSS, tRPC, Prisma, NextAuth
- 🤖 **AI/ML**: Image generation, text summarization, image analysis
- 🎨 **Dark Theme**: Clean black/white design
- ⚡ **Production Ready**: Vercel deployment, rate limiting, error handling
- 📊 **Real-time Tracking**: Usage quotas and API monitoring

## 🤖 ML Capabilities

- **Image Generation** - Text-to-image with Flux Schnell
- **Text Summarization** - AI-powered with Llama 2
- **Image Analysis** - Image captioning with BLIP
- **Rate Limiting** - Per-user quotas with real-time tracking

## 🚀 Quick Start

### Option 1: NPX (Recommended)
```bash
npx create-ml-starter@latest my-ml-app
cd my-ml-app
yarn dev
```

### Option 2: Manual Clone
```bash
git clone https://github.com/SharanRP/ml-starter.git my-ml-app
cd my-ml-app
yarn install && node setup.js
yarn dev
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SharanRP/ml-starter&env=REPLICATE_API_TOKEN,DATABASE_URL,AUTH_SECRET)

## ⚙️ Setup

### Prerequisites
- Node.js 18+, Yarn, [Replicate API token](https://replicate.com/account/api-tokens), PostgreSQL database

### Environment Variables (.env)
```env
# Required
REPLICATE_API_TOKEN="r8_your_token_here"
DATABASE_URL="postgresql://user:password@host:port/database"
AUTH_SECRET="your-secret-here"  # Generate with: npx auth secret

# Optional (Discord OAuth)
AUTH_DISCORD_ID="your_discord_client_id"
AUTH_DISCORD_SECRET="your_discord_client_secret"
```

### Database Setup
```bash
yarn db:push  # Push schema to database
yarn db:studio  # Open Prisma Studio (optional)
```

## 🛠️ Development & Deployment

```bash
# Development
yarn dev          # Start dev server
yarn build        # Build for production
yarn typecheck    # Check TypeScript
yarn lint         # Run ESLint
yarn format:write # Format code

# Database
yarn db:push      # Push schema changes
yarn db:studio    # Database management UI

# Deployment
yarn deploy       # Deploy to Vercel production
yarn deploy:preview # Deploy preview
```

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/ml/        # ML UI components
│   └── page.tsx              # Main page
├── server/
│   ├── api/routers/ml.ts     # ML tRPC endpoints
│   └── ml/                   # ML service layer
└── env.js                    # Environment validation

Key files: .env, setup.js, vercel.json
```

## 🔧 Tech Stack

**Core**: Next.js 15, TypeScript, TailwindCSS, tRPC, Prisma, NextAuth
**AI/ML**: Replicate (Flux Schnell, Llama 2, BLIP)
**Deploy**: Vercel, PostgreSQL

## 🎯 Use Cases

Perfect for AI-powered SaaS, content generation tools, image processing services, text analysis platforms, and ML prototyping.

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

**Built with the T3 Stack + Replicate AI** 🤖
