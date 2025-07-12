#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Transcribe.ai Environment Setup');
  console.log('=====================================\n');

  // Check if .env already exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('📋 Setting up environment variables...\n');

  let envContent = '';

  // 1. OpenAI API Key (Required)
  console.log('1. OpenAI API Key (Required)');
  console.log('   Get your API key from: https://platform.openai.com/api-keys');
  const openaiKey = await question('   Enter your OpenAI API key: ');
  
  if (!openaiKey.trim()) {
    console.log('❌ OpenAI API key is required. Setup cancelled.');
    rl.close();
    return;
  }

  envContent += `# Required - OpenAI API Key\n`;
  envContent += `OPENAI_API_KEY=${openaiKey.trim()}\n\n`;

  // 2. MongoDB URI (Required)
  console.log('\n2. MongoDB Database (Required)');
  console.log('   Get your MongoDB URI from: https://www.mongodb.com/atlas');
  console.log('   Format: mongodb+srv://username:password@cluster.mongodb.net/database_name');
  const mongodbUri = await question('   Enter your MongoDB URI: ');
  
  if (!mongodbUri.trim()) {
    console.log('❌ MongoDB URI is required. Setup cancelled.');
    rl.close();
    return;
  }

  envContent += `# Required - MongoDB Database\n`;
  envContent += `MONGODB_URI=${mongodbUri.trim()}\n\n`;

  // 3. Optional External Services
  console.log('\n3. External Service Integrations (Optional)');
  console.log('   These are only needed if you want to use export features.\n');

  // Slack
  const useSlack = await question('   Set up Slack integration? (y/N): ');
  if (useSlack.toLowerCase() === 'y') {
    console.log('   Create a webhook at: https://api.slack.com/apps');
    const slackWebhook = await question('   Enter Slack webhook URL: ');
    if (slackWebhook.trim()) {
      envContent += `# Slack Integration\n`;
      envContent += `SLACK_WEBHOOK_URL=${slackWebhook.trim()}\n\n`;
    }
  }

  // Notion
  const useNotion = await question('   Set up Notion integration? (y/N): ');
  if (useNotion.toLowerCase() === 'y') {
    console.log('   Get token from: https://www.notion.so/my-integrations');
    const notionToken = await question('   Enter Notion integration token: ');
    const notionDbId = await question('   Enter Notion database ID: ');
    if (notionToken.trim() && notionDbId.trim()) {
      envContent += `# Notion Integration\n`;
      envContent += `NOTION_TOKEN=${notionToken.trim()}\n`;
      envContent += `NOTION_DATABASE_ID=${notionDbId.trim()}\n\n`;
    }
  }

  // Trello
  const useTrello = await question('   Set up Trello integration? (y/N): ');
  if (useTrello.toLowerCase() === 'y') {
    console.log('   Get API key and token from: https://trello.com/app-key');
    const trelloApiKey = await question('   Enter Trello API key: ');
    const trelloToken = await question('   Enter Trello token: ');
    const trelloBoardId = await question('   Enter Trello board ID: ');
    if (trelloApiKey.trim() && trelloToken.trim() && trelloBoardId.trim()) {
      envContent += `# Trello Integration\n`;
      envContent += `TRELLO_API_KEY=${trelloApiKey.trim()}\n`;
      envContent += `TRELLO_TOKEN=${trelloToken.trim()}\n`;
      envContent += `TRELLO_BOARD_ID=${trelloBoardId.trim()}\n\n`;
    }
  }

  // SendGrid
  const useSendGrid = await question('   Set up SendGrid email integration? (y/N): ');
  if (useSendGrid.toLowerCase() === 'y') {
    console.log('   Sign up at: https://sendgrid.com/');
    const sendgridKey = await question('   Enter SendGrid API key: ');
    const sendgridEmail = await question('   Enter verified sender email: ');
    if (sendgridKey.trim() && sendgridEmail.trim()) {
      envContent += `# SendGrid Email Integration\n`;
      envContent += `SENDGRID_API_KEY=${sendgridKey.trim()}\n`;
      envContent += `SENDGRID_FROM_EMAIL=${sendgridEmail.trim()}\n\n`;
    }
  }

  // 4. Application Configuration
  console.log('\n4. Application Configuration (Optional)');
  
  const port = await question('   Development server port (default: 3000): ');
  const nodeEnv = await question('   Node environment (default: development): ');
  
  envContent += `# Application Configuration\n`;
  envContent += `PORT=${port.trim() || '3000'}\n`;
  envContent += `NODE_ENV=${nodeEnv.trim() || 'development'}\n\n`;

  // 5. Advanced Configuration
  console.log('\n5. Advanced Configuration (Optional)');
  
  const useJwt = await question('   Set up JWT secret for authentication? (y/N): ');
  if (useJwt.toLowerCase() === 'y') {
    const jwtSecret = await question('   Enter JWT secret (or press Enter for auto-generated): ');
    const secret = jwtSecret.trim() || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    envContent += `# JWT Secret\n`;
    envContent += `JWT_SECRET=${secret}\n\n`;
  }

  const corsOrigins = await question('   CORS origins (comma-separated, default: http://localhost:3000): ');
  if (corsOrigins.trim()) {
    envContent += `# CORS Configuration\n`;
    envContent += `CORS_ORIGINS=${corsOrigins.trim()}\n\n`;
  }

  // Add notes
  envContent += `# =============================================================================\n`;
  envContent += `# NOTES\n`;
  envContent += `# =============================================================================\n`;
  envContent += `# 1. Only OPENAI_API_KEY is required for basic functionality\n`;
  envContent += `# 2. External service keys are only needed if you want to use export features\n`;
  envContent += `# 3. Never commit this file to version control (it's already in .gitignore)\n`;
  envContent += `# 4. For production, set these as environment variables in your hosting platform\n`;

  // Write the file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment setup completed successfully!');
    console.log(`📁 Created: ${envPath}`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Upload a document or paste text to test');
    console.log('4. Check the transcripts page to see saved results');
    
    console.log('\n📚 Documentation:');
    console.log('- Setup guide: setup-instructions.md');
    console.log('- Environment guide: ENV_SETUP_GUIDE.md');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }

  rl.close();
}

main().catch(console.error); 