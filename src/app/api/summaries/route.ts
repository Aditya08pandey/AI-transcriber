import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Summary from '../../../models/Summary';
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
    const summaries = await Summary.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ summaries });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch summaries.' },
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
    const { transcript, fullSummaryText } = await request.json();
    if (!transcript || !fullSummaryText) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const newSummary = await Summary.create({
      user: userId,
      transcript,
      fullSummaryText
    });
    return NextResponse.json({ summary: newSummary });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create summary.' },
      { status: 500 }
    );
  }
} 