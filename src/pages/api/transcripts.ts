import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Transcript from '../../models/Transcript';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Connect to MongoDB
    await dbConnect();
    console.log('Connected to MongoDB');

    // Fetch all transcripts from MongoDB, sorted by creation date (newest first)
    const transcripts = await Transcript.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${transcripts.length} transcripts in MongoDB`);

    return res.status(200).json({ transcripts });

  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return res.status(500).json({ error: 'Failed to fetch transcripts.' });
  }
} 