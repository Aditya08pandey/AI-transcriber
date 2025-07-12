# Transcribe.ai Environment Setup Guide

This guide will help you set up all the necessary environment variables and API keys for Transcribe.ai.

## 🚀 Quick Setup

### 1. Required: OpenAI API Key

**What it's for:** AI-powered meeting summarization and action item extraction

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

**Add to your `.env.local`:**
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 2. Optional: External Service API Keys

These are optional and only needed if you want to use the export features:

#### Slack Webhook URL
**What it's for:** Export meeting summaries and action items to Slack channels

**How to get it:**
1. Go to your Slack workspace
2. Create a new app or use an existing one
3. Enable Incoming Webhooks
4. Create a webhook for your desired channel
5. Copy the webhook URL

**Add to your `.env.local`:**
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Notion Integration Token
**What it's for:** Export meeting summaries to Notion databases

**How to get it:**
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token
4. Share your Notion database with the integration

**Add to your `.env.local`:**
```env
NOTION_TOKEN=secret_your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here
```

#### Trello API Key and Token
**What it's for:** Export action items as Trello cards

**How to get them:**
1. Go to [Trello Power-Ups](https://trello.com/power-ups/admin)
2. Create a new Power-Up
3. Get your API Key and Token

**Add to your `.env.local`:**
```env
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_BOARD_ID=your_board_id
```

#### SendGrid API Key (for Email Export)
**What it's for:** Send meeting summaries via email

**How to get it:**
1. Sign up for [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Verify your sender email address

**Add to your `.env.local`:**
```env
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@domain.com
```

## 📋 Complete Environment File

Create a `.env.local` file in your project root with all your keys:

```env
# Required
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional - External Services
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NOTION_TOKEN=secret_your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_BOARD_ID=your_board_id
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@domain.com
```

## 🔧 Configuration

### OpenAI Configuration

**Model Selection:**
- Default: `gpt-4o` (recommended for best results)
- Alternative: `gpt-3.5-turbo` (faster, cheaper, but less accurate)

**Token Limits:**
- Summary: 300 tokens max
- Action Items: 500 tokens max
- Total per request: ~1000 tokens

**Cost Estimation:**
- GPT-4o: ~$0.01-0.03 per meeting
- GPT-3.5-turbo: ~$0.002-0.006 per meeting

### Export Service Configuration

**Slack:**
- Webhook URL must be from a Slack app with proper permissions
- Messages are sent to the channel configured in the webhook

**Notion:**
- Database must be shared with your integration
- Database should have columns for: Title, Summary, Action Items, Date

**Trello:**
- Board must be accessible with your API key
- Lists will be created automatically for action items

**Email:**
- SendGrid account must be verified
- Sender email must be verified in SendGrid

## 🐛 Troubleshooting

### Common Issues

**"OpenAI API key not found"**
- Check that your `.env.local` file exists in the project root
- Verify the API key starts with `sk-`
- Restart your development server after adding the key

**"OpenAI API error: Insufficient credits"**
- Check your OpenAI account balance
- Consider switching to GPT-3.5-turbo for lower costs
- Monitor usage in OpenAI dashboard

**"Export failed: Invalid webhook URL"**
- Verify the Slack webhook URL is correct
- Check that the webhook is active and has proper permissions
- Test the webhook manually in Slack

**"Notion export failed: Database not found"**
- Verify the database ID is correct
- Ensure the database is shared with your integration
- Check that the integration has proper permissions

**"Trello export failed: Invalid API key"**
- Verify your Trello API key and token
- Check that the board ID is correct
- Ensure the API key has proper permissions

### Environment Variable Issues

**Variables not loading:**
1. Make sure the file is named exactly `.env.local`
2. Check that it's in the project root directory
3. Restart your development server
4. Verify no spaces around the `=` sign

**Wrong values:**
1. Double-check API keys for typos
2. Ensure no extra spaces or quotes
3. Verify the format matches the examples above

### API Rate Limits

**OpenAI Rate Limits:**
- Free tier: 3 requests per minute
- Paid tier: 3500 requests per minute
- Consider implementing retry logic for production

**External Service Limits:**
- Slack: 1 request per second per webhook
- Notion: 3 requests per second
- Trello: 100 requests per 10 seconds
- SendGrid: 100 emails per day (free tier)

## 🔒 Security Best Practices

### API Key Security

1. **Never commit API keys to version control**
   - `.env.local` is already in `.gitignore`
   - Use environment variables in production

2. **Rotate keys regularly**
   - Change API keys every 90 days
   - Monitor for unusual usage patterns

3. **Use least privilege**
   - Only grant necessary permissions
   - Use read-only keys where possible

### Production Deployment

1. **Environment Variables**
   ```bash
   # Set in your hosting platform
   OPENAI_API_KEY=sk-your_key
   SLACK_WEBHOOK_URL=https://hooks.slack.com/...
   ```

2. **API Key Rotation**
   - Use different keys for development and production
   - Monitor usage and costs

3. **Error Handling**
   - Don't expose API keys in error messages
   - Log errors without sensitive data

## 📊 Monitoring and Costs

### OpenAI Usage Monitoring

**Check your usage:**
1. Go to [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Monitor daily/monthly costs
3. Set up billing alerts

**Cost optimization:**
- Use GPT-3.5-turbo for simple summaries
- Implement caching for repeated requests
- Batch similar requests together

### External Service Monitoring

**Slack:**
- Monitor webhook delivery in Slack app settings
- Check for rate limit errors

**Notion:**
- Monitor integration usage in Notion settings
- Check database sync status

**Trello:**
- Monitor API usage in Trello Power-Up settings
- Check for failed card creation

## 🚀 Next Steps

### After Setup

1. **Test the application:**
   - Upload a sample document
   - Try all export options
   - Verify transcripts are saved

2. **Customize for your needs:**
   - Adjust summary length and style
   - Modify action item extraction
   - Configure export formats

3. **Deploy to production:**
   - Set up environment variables
   - Configure domain and SSL
   - Set up monitoring and alerts

### Advanced Configuration

**Custom Prompts:**
- Modify the prompts in `src/pages/api/summarize.ts`
- Adjust for your specific meeting types
- Add industry-specific terminology

**Export Customization:**
- Modify export formats in the API files
- Add custom fields for your workflow
- Integrate with your existing tools

**Performance Optimization:**
- Implement caching for repeated requests
- Add request queuing for high volume
- Optimize file processing for large documents

## 📞 Support

If you encounter issues:

1. **Check the logs:**
   - Browser console for frontend errors
   - Terminal for backend errors
   - API response messages

2. **Verify configuration:**
   - All environment variables are set
   - API keys are valid and active
   - External services are properly configured

3. **Test components:**
   - Test OpenAI API directly
   - Verify external service connections
   - Check file upload functionality

4. **Common solutions:**
   - Restart the development server
   - Clear browser cache
   - Check network connectivity
   - Verify API quotas and limits

## 🎉 Success!

Once everything is configured correctly, you'll have:

- ✅ AI-powered meeting summarization
- ✅ Automatic action item extraction
- ✅ Multiple export options (Slack, Notion, Trello, Email)
- ✅ Document upload and processing
- ✅ Transcript management and storage
- ✅ Beautiful, responsive web interface

Your Transcribe.ai is now ready to transform your meetings into actionable insights! 