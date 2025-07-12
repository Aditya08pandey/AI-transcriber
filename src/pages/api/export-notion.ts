import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (!databaseId || !process.env.NOTION_TOKEN) return res.status(500).json({ error: 'Notion config missing.' });
  const { summary, actionItems } = req.body;
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: `Meeting note - ${new Date().toLocaleDateString()}` } }] },
        Summary: { rich_text: [{ text: { content: summary } }] }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: { text: [{ type: 'text', text: { content: 'Action Items' } }] }
        },
        ...actionItems.map((item: any) => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            text: [{ type: 'text', text: { content: `${item.task} - ${item.assignee || ''} ${item.deadline ? `(Due: ${item.deadline})` : ''}`.trim() } }]
          }
        }))
      ]
    });
    return res.status(200).json({ message: 'Exported to Notion!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Notion export failed' });
  }
}

