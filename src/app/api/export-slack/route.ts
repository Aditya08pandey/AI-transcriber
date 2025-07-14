import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { summary, actionItems } = await request.json();
    const webhook = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhook) {
      return NextResponse.json(
        { error: 'No Slack webhook configured.' },
        { status: 500 }
      );
    }
    
    const text = `*Meeting Summary*\n${summary}\n\n*Action Items*\n${actionItems.map((item: any) => `• ${item.task} _(Assignee: ${item.assignee || '—'}${item.deadline? ", Due: "+item.deadline : ''})_`).join("\n")}`;
    
    const slackRes = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!slackRes.ok) {
      throw new Error('Slack error');
    }
    
    return NextResponse.json({ message: 'Exported to Slack!' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Slack export failed' },
      { status: 500 }
    );
  }
} 