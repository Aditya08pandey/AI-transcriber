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
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File upload error.' });
    const file = files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });
    const fileObj = Array.isArray(file) ? file[0] : file;
    const originalName = fileObj.originalFilename || fileObj.filepath;
    const ext = originalName.split('.').pop()?.toLowerCase();
    const filepath = fileObj.filepath;
    try {
      let text = '';
      if (ext === 'pdf') {
        const data = fs.readFileSync(filepath);
        const pdf = await pdfParse(data);
        text = pdf.text;
      } else if (ext === 'docx') {
        const data = fs.readFileSync(filepath);
        const result = await mammoth.extractRawText({ buffer: data });
        text = result.value;
      } else if (ext === 'txt' || ext === 'csv') {
        text = fs.readFileSync(filepath, 'utf8');
      } else {
        return res.status(400).json({ error: `Unsupported file type: .${ext}` });
      }
      return res.status(200).json({ text });
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to parse file.' });
    }
  });
} 