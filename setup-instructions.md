# Transcribe.ai - Complete Setup Guide

This guide will help you set up the complete Transcribe.ai for document-based transcription and summarization.

## 🚀 Quick Start

### 1. Start Your Backend Server

```bash
# Navigate to your project directory
cd ai-meeting-agent

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Your Transcribe.ai will be running at `http://localhost:3000`

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**To get these credentials:**

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 3. Test the Application

1. **Upload a Document**: Use the file upload feature to upload PDF, DOCX, TXT, or CSV files
2. **Paste Text**: Manually paste meeting transcripts into the text area
3. **Import from URL**: Import documents from URLs
4. **Check Results**: 
   - Visit `http://localhost:3000/transcripts` to view all transcripts
   - Export results to Slack, Notion, Trello, or copy as Markdown

## 📁 Project Structure

```
ai-meeting-agent/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main homepage
│   │   └── transcripts/
│   │       └── page.tsx             # Transcripts management page
│   └── pages/
│       └── api/
│           ├── upload-transcript.ts  # File upload and parsing
│           ├── transcripts.ts        # Lists all transcripts
│           ├── summarize.ts          # Summarization API
│           └── export-*.ts          # Export APIs (slack, notion, trello, email)
├── transcripts/                      # Generated transcripts (auto-created)
└── setup-instructions.md            # This file
```

## 🔧 Configuration Options

### Email Configuration
To enable actual email sending, uncomment and configure the email section in the export APIs:

```typescript
// Example with SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: 'user@example.com',
  from: 'noreply@yourdomain.com',
  subject: `Meeting Summary`,
  text: `Summary: ${summary}\n\nAction Items: ${actionItems}`,
};
await sgMail.send(msg);
```

### Database Storage
Currently, transcripts are stored as JSON files. To use a database:

1. Install a database package (e.g., `npm install sqlite3` or `npm install mongodb`)
2. Update the save functions in the APIs
3. Update the transcripts API to read from database

## 🎯 Features Overview

### ✅ What's Working Now

- **Document Upload**: Upload PDF, DOCX, TXT, and CSV files
- **Text Input**: Manually paste meeting transcripts
- **URL Import**: Import documents from URLs
- **Summarization**: Generates meeting summaries using OpenAI
- **Action Item Extraction**: Extracts tasks, assignees, and deadlines
- **Web UI**: View and manage transcripts at `/transcripts`
- **File Storage**: Saves transcripts as JSON files
- **Download**: Export transcripts as text files
- **Copy to Clipboard**: Copy transcript text
- **Export Options**: Export to Slack, Notion, Trello, Email, or Markdown

### 🔄 What's Logged (Not Yet Implemented)

- **Email Delivery**: Currently logs to console instead of sending emails
- **Real-time Processing**: Currently processes after upload
- **Multiple Platforms**: Currently supports document-based input

## 🐛 Troubleshooting

### Backend Issues

**OpenAI API errors:**
- Verify OpenAI API key is correct
- Check that you have sufficient API credits
- Ensure the API key has the correct permissions

**File upload errors:**
- Check file size limits (25MB max)
- Verify supported file types (PDF, DOCX, TXT, CSV)
- Ensure proper file permissions

**Export errors:**
- Check API keys for external services (Slack, Notion, Trello)
- Verify webhook URLs are correct
- Ensure proper authentication

### Frontend Issues

**Page not loading:**
- Check that the Next.js server is running
- Verify port 3000 is available
- Check browser console for errors

**File upload not working:**
- Ensure file is in supported format
- Check file size is under 25MB
- Verify browser supports File API

## 🚀 Development

### Adding New Export Options

1. Create a new API endpoint in `src/pages/api/export-[service].ts`
2. Add the export button to the UI
3. Handle the response and show success/error messages

### Adding New File Types

1. Update the file upload handler in `src/pages/api/upload-transcript.ts`
2. Add the new parser library to dependencies
3. Update the frontend file input accept attribute

### Customizing Summaries

1. Modify the prompt in `src/pages/api/summarize.ts`
2. Adjust the OpenAI model parameters
3. Test with different types of content

## Security Notes

- All file processing happens on your server
- No files are stored permanently (cleaned up after processing)
- API keys should be kept secure in environment variables
- Consider implementing user authentication for production use

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify your backend is running and accessible
4. Ensure all environment variables are properly set 