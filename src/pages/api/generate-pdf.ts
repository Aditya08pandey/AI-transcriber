import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, filename, type } = req.body;

    if (!content || !filename || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For now, we'll generate a simple text file that can be converted to PDF
    // In a production environment, you'd want to use a proper PDF library like jsPDF
    const fileContent = type === 'transcript' 
      ? `Meeting Transcript - ${filename}\n\nFULL TRANSCRIPT:\n${content}`
      : `Meeting Summary - ${filename}\n\nSUMMARY:\n${content}`;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Return the content and filename for client-side PDF generation
    res.status(200).json({ 
      success: true, 
      content: fileContent,
      filename: `${type}-${filename}.txt`
    });

  } catch (error) {
    console.error('Error generating file:', error);
    res.status(500).json({ error: 'Failed to generate file' });
  }
} 