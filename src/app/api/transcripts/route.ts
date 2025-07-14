import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Transcript from '../../../models/Transcript';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserIdFromRequest(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const transcripts = await Transcript.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ transcripts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transcripts.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, timestamp, source, transcript, summary, actionItems, createdAt, fullSummaryText } = await request.json();
    if (!transcript || !summary || !fullSummaryText) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const newTranscript = await Transcript.create({
      id,
      user: userId,
      timestamp,
      source,
      transcript,
      summary,
      actionItems,
      createdAt,
      fullSummaryText
    });
    return NextResponse.json({ transcript: newTranscript });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create transcript.' },
      { status: 500 }
    );
  }
} 