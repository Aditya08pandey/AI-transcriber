import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import dbConnect from '../../../lib/mongodb';
import Transcript from '../../../models/Transcript';
import jwt from 'jsonwebtoken';

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserFromRequest(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Debug logging
  console.log('=== API Debug Info ===');
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('Node Environment:', process.env.NODE_ENV);
  console.log('Request Method:', request.method);
  
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return NextResponse.json(
      { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    const { transcript, source = 'manual-import' } = await request.json();
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript text is required.' },
        { status: 400 }
      );
    }

    console.log('Processing transcript with OpenAI...');
    
    // Enhanced prompt for smart context awareness, deadline inference, and ownership detection
    const prompt = `You are an advanced meeting assistant. Given the following transcript, perform the following:

1. Provide a concise, human-like meeting summary. Do NOT include any speaker names or tags; just give a general summary of the whole meeting.
2. Extract action items. For each action item, include:
   - task: A clear description of the action.
   - assignee: The person responsible (infer from context, e.g., "Let's have John lead this").
   - deadline: The deadline (infer from context, e.g., "by Friday", "before next call").
   - tone: The tone of the request (e.g., urgent, casual, critical, optional, etc.).
   - importance: Rate the importance (high, medium, low) based on context and language cues.
3. If any of the above cannot be determined, set the value to null.

Transcript:
"""
${transcript}
"""

Respond in JSON with:
{
  summary: "...",
  actionItems: [
    {
      task: "...",
      assignee: "...",
      deadline: "...",
      tone: "...",
      importance: "..."
    },
    ...
  ]
}`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.3,
    });
    
    console.log('Received response from OpenAI');
    const content = completion.choices[0].message.content;
    if (!content) {
      console.error('No content received from OpenAI');
      throw new Error('No content from OpenAI.');
    }
    
    console.log('Parsing OpenAI response...');
    const data = JSON.parse(content);
    console.log('Successfully parsed OpenAI response');

    // Only use the meeting summary for summary and fullSummaryText
    const meetingSummary = data.summary;

    // Clean and validate action items before saving
    const cleanedActionItems = data.actionItems.map((item: any) => ({
      task: item.task || 'No task specified',
      assignee: item.assignee || 'Unassigned',
      deadline: item.deadline || null,
      tone: item.tone || null,
      importance: item.importance || null
    }));

    // Connect to MongoDB
    try {
      await dbConnect();
      console.log('Connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();
    const id = `manual-${Date.now()}`;
    
    // Save to MongoDB
    const transcriptData = {
      id,
      timestamp,
      source,
      transcript,
      summary: meetingSummary,
      actionItems: cleanedActionItems,
      createdAt: timestamp,
      user: user.userId,
      userEmail: user.email,
      fullSummaryText: meetingSummary,
    };

    const newTranscript = new Transcript(transcriptData);
    await newTranscript.save();
    console.log('Successfully saved transcript to MongoDB');

    return NextResponse.json({
      ...data,
      id,
      timestamp,
      source,
      summary: meetingSummary // Only return the meeting summary
    });
  } catch (err: any) {
    console.error('Error in summarize API:', err);
    return NextResponse.json(
      { 
        error: 'Failed to summarize transcript.',
        details: err.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 