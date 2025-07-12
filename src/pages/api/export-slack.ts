import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { summary, actionItems } = req.body;
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return res.status(500).json({ error: 'No Slack webhook configured.' });
  const text = `*Meeting Summary*\n${summary}\n\n*Action Items*\n${actionItems.map((item: any) => `• ${item.task} _(Assignee: ${item.assignee || '—'}${item.deadline? ", Due: "+item.deadline : ''})_`).join("\n")}`;
  try {
    const slackRes = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!slackRes.ok) throw new Error('Slack error');
    return res.status(200).json({ message: 'Exported to Slack!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Slack export failed' });
  }
}

