// Test script to verify environment variables
// Run this locally to check if your env vars are working

// Try to load .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('=== Environment Variable Test ===');
console.log('Environment file loaded:', process.env.NODE_ENV || 'development');
console.log('');

// Check OpenAI API Key
const openaiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key:', openaiKey ? '✅ Set' : '❌ Not set');
if (openaiKey) {
  console.log('  Key starts with:', openaiKey.substring(0, 7) + '...');
}

// Check MongoDB URI
const mongoUri = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoUri ? '✅ Set' : '❌ Not set');
if (mongoUri) {
  console.log('  URI contains:', mongoUri.includes('mongodb+srv://') ? '✅ Valid format' : '❌ Invalid format');
}

// Check other optional variables
const slackWebhook = process.env.SLACK_WEBHOOK_URL;
console.log('Slack Webhook:', slackWebhook ? '✅ Set' : '⚠️  Not set (optional)');

const notionToken = process.env.NOTION_TOKEN;
console.log('Notion Token:', notionToken ? '✅ Set' : '⚠️  Not set (optional)');

const trelloApiKey = process.env.TRELLO_API_KEY;
console.log('Trello API Key:', trelloApiKey ? '✅ Set' : '⚠️  Not set (optional)');

const sendgridKey = process.env.SENDGRID_API_KEY;
console.log('SendGrid API Key:', sendgridKey ? '✅ Set' : '⚠️  Not set (optional)');

console.log('');
console.log('=== Summary ===');
if (!openaiKey) {
  console.log('❌ OPENAI_API_KEY is required but not set');
}
if (!mongoUri) {
  console.log('❌ MONGODB_URI is required but not set');
}
if (openaiKey && mongoUri) {
  console.log('✅ All required environment variables are set');
}

console.log('');
console.log('To fix missing variables:');
console.log('1. Create a .env.local file in your project root');
console.log('2. Add your environment variables');
console.log('3. For deployment, set these in your hosting platform'); 