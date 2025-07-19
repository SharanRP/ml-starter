#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Setting up ML T3 Template...\n");

// Check if .env exists
const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(process.cwd(), ".env.example");

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✅ Created .env file from .env.example");
  } else {
    console.log("❌ .env.example file not found");
    process.exit(1);
  }
} else {
  console.log("ℹ️  .env file already exists");
}

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), "node_modules"))) {
  console.log("📦 Installing dependencies...");
  try {
    execSync("yarn install", { stdio: "inherit" });
    console.log("✅ Dependencies installed successfully");
  } catch (error) {
    console.log("❌ Failed to install dependencies");
    console.log("💡 Try running: yarn install");
    process.exit(1);
  }
} else {
  console.log("ℹ️  Dependencies already installed");
}

// Generate Prisma client
console.log("🔧 Generating Prisma client...");
try {
  execSync("yarn prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client generated");
} catch (error) {
  console.log("❌ Failed to generate Prisma client");
  console.log("💡 Try running: yarn prisma generate");
}

console.log("\n🎉 Setup complete!\n");

console.log("📋 Next steps:");
console.log("1. Fill in your environment variables in .env file:");
console.log("   - REPLICATE_API_TOKEN (required)");
console.log("   - DATABASE_URL (required)");
console.log("   - AUTH_SECRET (required)");
console.log("   - AUTH_DISCORD_ID & AUTH_DISCORD_SECRET (optional)");
console.log("");
console.log("2. Set up your database:");
console.log("   yarn db:push");
console.log("");
console.log("3. Start the development server:");
console.log("   yarn dev");
console.log("");
console.log("4. Deploy to production:");
console.log("   yarn deploy");
console.log("");
console.log("📖 For detailed setup instructions, see DEPLOYMENT.md");
console.log(
  "🔗 Get your Replicate API token: https://replicate.com/account/api-tokens",
);
console.log("🔗 Set up a database: https://supabase.com or https://neon.tech");
