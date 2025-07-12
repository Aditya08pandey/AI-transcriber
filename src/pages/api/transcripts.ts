import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const transcriptsDir = './transcripts';
    
    // Check if transcripts directory exists
    if (!fs.existsSync(transcriptsDir)) {
      return res.status(200).json({ transcripts: [] });
    }

    // Read all transcript files
    const files = fs.readdirSync(transcriptsDir);
    const transcriptFiles = files.filter(file => file.endsWith('.json'));

    const transcripts = [];

    for (const file of transcriptFiles) {
      try {
        const filePath = path.join(transcriptsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const transcriptData = JSON.parse(fileContent);
        transcripts.push(transcriptData);
      } catch (error) {
        console.error(`Error reading transcript file ${file}:`, error);
        // Continue with other files
      }
    }

    // Sort transcripts by creation date (newest first)
    transcripts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ transcripts });

  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return res.status(500).json({ error: 'Failed to fetch transcripts.' });
  }
} 