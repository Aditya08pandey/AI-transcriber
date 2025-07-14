import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { summary, actionItems } = await request.json();
    
    if (!summary || !Array.isArray(actionItems)) {
      return NextResponse.json(
        { error: 'Missing summary or action items.' },
        { status: 400 }
      );
    }

    // Build a simple, readable email body
    const emailSubject = `Meeting Summary & Action Items - ${new Date().toLocaleDateString()}`;
    const emailBody = `Hello,\n\nHere is the summary and action items from our recent meeting:\n\n---\n\nSummary:\n${summary}\n\nAction Items:\n${actionItems.length ? actionItems.map((item: any, i: number) => `${i+1}. ${item.task} (Assignee: ${item.assignee || '—'}${item.deadline ? ", Due: " + item.deadline : ''})`).join("\n") : 'None.'}\n\n---\n\nBest regards,\nAI Meeting Agent`;

    return NextResponse.json({ 
      subject: emailSubject, 
      body: emailBody, 
      message: 'Email format generated!' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Email export failed' },
      { status: 500 }
    );
  }
} 