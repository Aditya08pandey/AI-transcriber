// Alternative MongoDB connection using Data API (no IP whitelisting required)
// This is a backup option if you can't whitelist your deployment IP

const MONGODB_DATA_API_URL = process.env.MONGODB_DATA_API_URL;
const MONGODB_DATA_API_KEY = process.env.MONGODB_DATA_API_KEY;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'transcribe_ai';
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION || 'transcripts';

export async function dbConnectDataAPI() {
  if (!MONGODB_DATA_API_URL || !MONGODB_DATA_API_KEY) {
    throw new Error('MongoDB Data API environment variables not configured');
  }

  return {
    url: MONGODB_DATA_API_URL,
    key: MONGODB_DATA_API_KEY,
    database: MONGODB_DATABASE,
    collection: MONGODB_COLLECTION
  };
}

export async function saveTranscriptDataAPI(data: any) {
  const config = await dbConnectDataAPI();
  
  const response = await fetch(`${config.url}/action/findOne`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.key,
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: config.database,
      collection: config.collection,
      filter: { id: data.id }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to save transcript via Data API');
  }

  return response.json();
}

export async function getTranscriptsDataAPI() {
  const config = await dbConnectDataAPI();
  
  const response = await fetch(`${config.url}/action/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.key,
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: config.database,
      collection: config.collection,
      sort: { createdAt: -1 }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcripts via Data API');
  }

  const result = await response.json();
  return result.documents || [];
} 