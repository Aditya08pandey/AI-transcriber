import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { summary, actionItems } = req.body;
  if (!summary || !Array.isArray(actionItems)) {
    return res.status(400).json({ error: 'Missing summary or action items.' });
  }

  // Build a simple, readable email body
  const emailSubject = `Meeting Summary & Action Items - ${new Date().toLocaleDateString()}`;
  const emailBody = `Hello,\n\nHere is the summary and action items from our recent meeting:\n\n---\n\nSummary:\n${summary}\n\nAction Items:\n${actionItems.length ? actionItems.map((item: any, i: number) => `${i+1}. ${item.task} (Assignee: ${item.assignee || '—'}${item.deadline ? ", Due: " + item.deadline : ''})`).join("\n") : 'None.'}\n\n---\n\nBest regards,\nAI Meeting Agent`;

  return res.status(200).json({ subject: emailSubject, body: emailBody, message: 'Email format generated!' });
} 