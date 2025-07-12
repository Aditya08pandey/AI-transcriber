# Transcribe.ai

Transform your meetings into actionable insights with AI-powered transcription, summarization, and action item extraction.

## 🚀 Features

- **📄 Document Upload**: Upload PDF, DOCX, TXT, and CSV files
- **✍️ Text Input**: Manually paste meeting transcripts
- **🌐 URL Import**: Import documents from URLs
- **🤖 AI Summarization**: Generate concise meeting summaries using OpenAI
- **📋 Action Items**: Extract tasks, assignees, and deadlines automatically
- **📤 Export Options**: Send to Slack, Notion, Trello, Email, or copy as Markdown
- **💾 Transcript Management**: View and manage all transcripts in a beautiful web interface
- **📥 Download**: Export transcripts and summaries in TXT and PDF formats

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o for summarization and action item extraction
- **File Processing**: PDF parsing, DOCX extraction, text processing
- **Export**: Slack webhooks, Notion API, Trello API, SendGrid email
- **Storage**: Local JSON files (easily extensible to databases)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-meeting-agent
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```env
# Required
OPENAI_API_KEY=sk-your_openai_api_key_here
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/transcribe_ai

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

**Get your credentials:**

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### MongoDB Database:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier is sufficient)
4. Create a database user with read/write permissions
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `<password>` with your database user password
7. Add the URI to your `.env` file

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start using Transcribe.ai!

## 📖 Usage

### Upload Documents

1. **File Upload**: Click "Choose File" to upload PDF, DOCX, TXT, or CSV files
2. **Text Input**: Paste meeting transcripts directly into the text area
3. **URL Import**: Import documents from URLs (supports the same file types)

### Process and Export

1. **Summarize**: Click "Summarize & Extract Actions" to process your content
2. **Review**: View the AI-generated summary and extracted action items
3. **Export**: Use the export buttons to send results to:
   - **Slack**: Post to your team channel
   - **Notion**: Add to your meeting database
   - **Trello**: Create cards for action items
   - **Email**: Send via your email client
   - **Markdown**: Copy formatted text to clipboard

### Manage Transcripts

1. **View All**: Visit `/transcripts` to see all processed documents
2. **Download**: Export transcripts and summaries as TXT or PDF files
3. **Search**: Find specific meetings by content or date

## 🔧 Configuration

### OpenAI Settings

- **Model**: GPT-4o (recommended) or GPT-3.5-turbo
- **Summary Length**: 300 tokens max
- **Action Items**: 500 tokens max
- **Cost**: ~$0.01-0.03 per meeting (GPT-4o)

### External Services

**Slack:**
- Create a webhook at [Slack Apps](https://api.slack.com/apps)
- Messages sent to configured channel

**Notion:**
- Get token from [Notion Integrations](https://www.notion.so/my-integrations)
- Share database with integration

**Trello:**
- Get API key and token from [Trello App Key](https://trello.com/app-key)
- Board must be accessible with API key

**SendGrid:**
- Sign up at [SendGrid](https://sendgrid.com/)
- Verify sender email address

## 📁 Project Structure

```
ai-meeting-agent/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main homepage
│   │   ├── layout.tsx               # App layout
│   │   ├── globals.css              # Global styles
│   │   └── transcripts/
│   │       └── page.tsx             # Transcripts management
│   ├── components/
│   │   └── Logo.tsx                 # Animated logo component
│   ├── pages/
│   │   └── api/
│   │       ├── upload-transcript.ts  # File upload and parsing
│   │       ├── summarize.ts          # AI summarization
│   │       ├── transcripts.ts        # Transcript management
│   │       └── export-*.ts          # Export APIs
│   └── types/
│       └── global.d.ts              # TypeScript definitions
├── transcripts/                      # Generated transcripts
├── public/                          # Static assets
├── setup-instructions.md            # Detailed setup guide
├── ENV_SETUP_GUIDE.md              # Environment configuration
└── setup-env.js                    # Interactive setup script
```

## 🚀 Development

### Adding New Export Options

1. Create a new API endpoint in `src/pages/api/export-[service].ts`
2. Add the export button to the UI in `src/app/page.tsx`
3. Handle the response and show success/error messages

### Adding New File Types

1. Update the file upload handler in `src/pages/api/upload-transcript.ts`
2. Add the new parser library to dependencies
3. Update the frontend file input accept attribute

### Customizing Summaries

1. Modify the prompts in `src/pages/api/summarize.ts`
2. Adjust the OpenAI model parameters
3. Test with different types of content

## 🐛 Troubleshooting

### Common Issues

**"OpenAI API key not found"**
- Check that your `.env` file exists in the project root
- Verify the API key starts with `sk-`
- Restart your development server after adding the key

**"File upload failed"**
- Check file size limits (25MB max)
- Verify supported file types (PDF, DOCX, TXT, CSV)
- Ensure proper file permissions

**"Export failed"**
- Check API keys for external services
- Verify webhook URLs are correct
- Ensure proper authentication

### Environment Variables

**Variables not loading:**
1. Make sure the file is named exactly `.env`
2. Check that it's in the project root directory
3. Restart your development server
4. Verify no spaces around the `=` sign

## 🔒 Security

- All file processing happens on your server
- No files are stored permanently (cleaned up after processing)
- API keys should be kept secure in environment variables
- Consider implementing user authentication for production use

## 📊 Monitoring and Costs

### OpenAI Usage

- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set up billing alerts
- Consider using GPT-3.5-turbo for cost optimization

### Rate Limits

- **OpenAI**: 3 requests/minute (free), 3500 requests/minute (paid)
- **Slack**: 1 request/second per webhook
- **Notion**: 3 requests/second
- **Trello**: 100 requests/10 seconds
- **SendGrid**: 100 emails/day (free tier)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify your backend is running and accessible
4. Ensure all environment variables are properly set

## 🎉 Success!

Once everything is configured correctly, you'll have:

- ✅ AI-powered meeting summarization
- ✅ Automatic action item extraction
- ✅ Multiple export options (Slack, Notion, Trello, Email)
- ✅ Document upload and processing
- ✅ Transcript management and storage
- ✅ Beautiful, responsive web interface

Your Transcribe.ai is now ready to transform your meetings into actionable insights!
