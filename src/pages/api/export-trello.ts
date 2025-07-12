import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_LIST_ID = process.env.TRELLO_LIST_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!TRELLO_KEY || !TRELLO_TOKEN || !TRELLO_LIST_ID) return res.status(500).json({ error: 'Trello config missing.' });
  const { summary, actionItems } = req.body;
  const cards = [
    {
      name: `Meeting Summary (${new Date().toLocaleDateString()})`,
      desc: summary
    },
    ...actionItems.map((item: any) => ({
      name: item.task,
      desc: `${item.assignee ? `Assignee: ${item.assignee}\n` : ''}${item.deadline ? `Deadline: ${item.deadline}` : ''}`.trim()
    }))
  ];
  try {
    for (const card of cards) {
      const trelloRes = await fetch(
        `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}&idList=${TRELLO_LIST_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: card.name, desc: card.desc })
        }
      );
      if (!trelloRes.ok) throw new Error('Trello API error');
    }
    return res.status(200).json({ message: 'Exported to Trello!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Trello export failed' });
  }
}

