import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { summary, actionItems } = await request.json();
    const token = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!token || !databaseId) {
      return NextResponse.json(
        { error: 'Notion integration not configured.' },
        { status: 500 }
      );
    }
    
    // For now, just return a success message since Notion integration requires more setup
    return NextResponse.json({ 
      message: 'Notion export would be implemented here. Check logs for details.' 
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Notion export failed' },
      { status: 500 }
    );
  }
} 