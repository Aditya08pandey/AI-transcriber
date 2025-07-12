import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'File upload error.' });
    }
    
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    const fileObj = Array.isArray(file) ? file[0] : file;
    const originalName = fileObj.originalFilename || fileObj.filepath;
    const ext = originalName.split('.').pop()?.toLowerCase();
    const filepath = fileObj.filepath;
    
    console.log('Processing file:', originalName, 'with extension:', ext);
    
    try {
      let text = '';
      if (ext === 'pdf') {
        console.log('Processing PDF file...');
        const data = fs.readFileSync(filepath);
        const pdf = await pdfParse(data);
        text = pdf.text;
        console.log('PDF processed successfully, text length:', text.length);
      } else if (ext === 'docx') {
        console.log('Processing DOCX file...');
        const data = fs.readFileSync(filepath);
        const result = await mammoth.extractRawText({ buffer: data });
        text = result.value;
        console.log('DOCX processed successfully, text length:', text.length);
      } else if (ext === 'txt' || ext === 'csv') {
        console.log('Processing text file...');
        text = fs.readFileSync(filepath, 'utf8');
        console.log('Text file processed successfully, text length:', text.length);
      } else {
        return res.status(400).json({ error: `Unsupported file type: .${ext}` });
      }
      
      // Clean up the uploaded file
      try {
        fs.unlinkSync(filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      
      return res.status(200).json({ text });
    } catch (e: any) {
      console.error('Error processing file:', e);
      return res.status(500).json({ error: 'Failed to parse file.', details: e.message });
    }
  });
} 