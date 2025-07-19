#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.bright}${colors.magenta}${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
};

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  // Display banner
  console.log();
  log.title('🤖 Create ML T3 App');
  console.log();
  log.info('A production-ready ML web app template with T3 Stack + Replicate AI');
  console.log();

  // Validate project name
  if (!projectName) {
    log.error('Please specify a project name:');
    console.log(`  ${colors.cyan}npx create-ml-t3-app@latest${colors.reset} ${colors.green}my-ml-app${colors.reset}`);
    console.log();
    console.log('For more information, run:');
    console.log(`  ${colors.cyan}npx create-ml-t3-app@latest --help${colors.reset}`);
    process.exit(1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Validate project name format
  if (!isValidProjectName(projectName)) {
    log.error(`Invalid project name: "${projectName}"`);
    log.info('Project name must be a valid npm package name');
    process.exit(1);
  }

  const projectPath = path.resolve(projectName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    log.error(`Directory "${projectName}" already exists`);
    process.exit(1);
  }

  try {
    await createProject(projectName, projectPath);
  } catch (error) {
    log.error(`Failed to create project: ${error.message}`);
    process.exit(1);
  }
}

async function createProject(projectName, projectPath) {
  log.step('Creating project directory...');
  fs.mkdirSync(projectPath, { recursive: true });

  log.step('Downloading template...');
  await downloadTemplate(projectPath);

  log.step('Installing dependencies...');
  await installDependencies(projectPath);

  log.step('Setting up environment...');
  await setupEnvironment(projectPath, projectName);

  log.step('Generating Prisma client...');
  await generatePrismaClient(projectPath);

  log.step('Initializing git repository...');
  await initializeGit(projectPath);

  // Success message
  console.log();
  log.success('🎉 Project created successfully!');
  console.log();
  
  log.title('📋 Next steps:');
  console.log(`  1. ${colors.cyan}cd ${projectName}${colors.reset}`);
  console.log(`  2. Fill in your environment variables in ${colors.yellow}.env${colors.reset}:`);
  console.log(`     - ${colors.green}REPLICATE_API_TOKEN${colors.reset} (required)`);
  console.log(`     - ${colors.green}DATABASE_URL${colors.reset} (required)`);
  console.log(`     - ${colors.yellow}AUTH_DISCORD_ID & AUTH_DISCORD_SECRET${colors.reset} (optional)`);
  console.log(`  3. ${colors.cyan}yarn db:push${colors.reset} (set up database)`);
  console.log(`  4. ${colors.cyan}yarn dev${colors.reset} (start development server)`);
  console.log();
  
  log.title('🔗 Helpful links:');
  console.log(`  📖 Documentation: ${colors.blue}https://github.com/yourusername/ml-t3-template${colors.reset}`);
  console.log(`  🔑 Replicate API: ${colors.blue}https://replicate.com/account/api-tokens${colors.reset}`);
  console.log(`  🗄️  Database Setup: ${colors.blue}https://supabase.com${colors.reset} or ${colors.blue}https://neon.tech${colors.reset}`);
  console.log(`  🚀 Deploy: ${colors.cyan}yarn deploy${colors.reset}`);
  console.log();
}

async function downloadTemplate(projectPath) {
  // Use git clone to download the template
  if (isCommandAvailable('git')) {
    try {
      execSync(`git clone https://github.com/yourusername/ml-t3-template.git "${projectPath}"`, { stdio: 'pipe' });
      // Remove .git directory
      const gitDir = path.join(projectPath, '.git');
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
      }
      return;
    } catch (error) {
      throw new Error('Failed to download template. Please ensure you have git installed and internet connection.');
    }
  } else {
    throw new Error('Git is required to download the template. Please install Git and try again.');
  }
}

async function installDependencies(projectPath) {
  const packageManager = getPackageManager();
  const installCommand = packageManager === 'yarn' ? 'yarn install' : 'npm install';
  
  try {
    execSync(installCommand, { 
      cwd: projectPath, 
      stdio: 'pipe'
    });
  } catch (error) {
    throw new Error(`Failed to install dependencies with ${packageManager}`);
  }
}

async function setupEnvironment(projectPath, projectName) {
  const envExamplePath = path.join(projectPath, '.env.example');
  const envPath = path.join(projectPath, '.env');
  
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Generate a random AUTH_SECRET
    const authSecret = require('crypto').randomBytes(32).toString('base64');
    envContent = envContent.replace('AUTH_SECRET=""', `AUTH_SECRET="${authSecret}"`);
    
    // Update database name to match project name
    envContent = envContent.replace(
      'DATABASE_URL="postgresql://postgres:password@localhost:5432/template"',
      `DATABASE_URL="postgresql://postgres:password@localhost:5432/${projectName}"`
    );
    
    fs.writeFileSync(envPath, envContent);
  }
}

async function generatePrismaClient(projectPath) {
  const packageManager = getPackageManager();
  const command = packageManager === 'yarn' ? 'yarn prisma generate' : 'npx prisma generate';
  
  try {
    execSync(command, { 
      cwd: projectPath, 
      stdio: 'pipe'
    });
  } catch (error) {
    log.warning('Failed to generate Prisma client. Run "yarn prisma generate" manually.');
  }
}

async function initializeGit(projectPath) {
  if (!isCommandAvailable('git')) {
    log.warning('Git not found. Skipping git initialization.');
    return;
  }
  
  try {
    execSync('git init', { cwd: projectPath, stdio: 'pipe' });
    execSync('git add .', { cwd: projectPath, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from create-ml-t3-app"', { cwd: projectPath, stdio: 'pipe' });
  } catch (error) {
    log.warning('Failed to initialize git repository.');
  }
}

// Utility functions
function isValidProjectName(name) {
  return /^[a-z0-9-_]+$/.test(name) && !name.startsWith('-') && !name.endsWith('-');
}

function isCommandAvailable(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getPackageManager() {
  if (isCommandAvailable('yarn')) return 'yarn';
  if (isCommandAvailable('npm')) return 'npm';
  throw new Error('Neither npm nor yarn found. Please install a package manager.');
}

function showHelp() {
  console.log(`
${colors.bright}${colors.magenta}Create ML T3 App${colors.reset}

${colors.bright}Usage:${colors.reset}
  npx create-ml-t3-app@latest <project-name>
  npm create ml-t3-app@latest <project-name>
  yarn create ml-t3-app <project-name>

${colors.bright}Options:${colors.reset}
  -h, --help     Show this help message

${colors.bright}Examples:${colors.reset}
  npx create-ml-t3-app@latest my-ml-app
  npm create ml-t3-app@latest ai-image-generator
  yarn create ml-t3-app text-summarizer

${colors.bright}What you get:${colors.reset}
  • Next.js 15 with App Router
  • TypeScript configuration
  • TailwindCSS for styling
  • tRPC for type-safe APIs
  • Prisma ORM with PostgreSQL
  • NextAuth.js authentication
  • Replicate AI integration
  • ML components (image generation, text summarization, image analysis)
  • Rate limiting and error handling
  • Vercel deployment ready
  • Dark theme design

${colors.bright}Learn more:${colors.reset}
  📖 https://github.com/yourusername/ml-t3-template
  🔑 https://replicate.com/account/api-tokens
  🗄️  https://supabase.com
`);
}

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
