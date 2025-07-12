import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import dbConnect from '../../lib/mongodb';
import Transcript from '../../models/Transcript';

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return res.status(500).json({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' });
  }

  const { transcript, source = 'manual-import' } = req.body;
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Transcript text is required.' });
  }

  try {
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

    // Create comprehensive summary that includes all generated content
    const comprehensiveSummary = `MEETING SUMMARY

${data.summary}

ACTION ITEMS

${data.actionItems.map((item: any, index: number) => {
  const task = item.task || 'No task specified';
  const assignee = item.assignee || 'Unassigned';
  const deadline = item.deadline || 'No deadline specified';
  const tone = item.tone || 'Not specified';
  const importance = item.importance || 'Not specified';
  
  return `${index + 1}. ${task}
   • Assignee: ${assignee}
   • Deadline: ${deadline}
   • Tone: ${tone}
   • Importance: ${importance}`;
}).join('\n\n')}`;

    // Clean and validate action items before saving
    const cleanedActionItems = data.actionItems.map((item: any) => ({
      task: item.task || 'No task specified',
      assignee: item.assignee || 'Unassigned',
      deadline: item.deadline || null,
      tone: item.tone || null,
      importance: item.importance || null
    }));

    // Connect to MongoDB
    await dbConnect();
    console.log('Connected to MongoDB');

    const timestamp = new Date().toISOString();
    const id = `manual-${Date.now()}`;
    
    // Save to MongoDB
    const transcriptData = {
      id,
      timestamp,
      source,
      transcript,
      summary: comprehensiveSummary,
      actionItems: cleanedActionItems,
      createdAt: timestamp
    };

    const newTranscript = new Transcript(transcriptData);
    await newTranscript.save();
    console.log('Successfully saved transcript to MongoDB');

    return res.status(200).json({
      ...data,
      id,
      timestamp,
      source
    });
  } catch (err: any) {
    console.error('Error in summarize API:', err);
    return res.status(500).json({ 
      error: 'Failed to summarize transcript.',
      details: err.message || 'Unknown error'
    });
  }
}

