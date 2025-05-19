import { MONGO_CONFIG } from '../../config/mongo';
import { SEARCH_CHATS_INDEX } from '../indexes-descripitions';

import { MongoClient } from 'mongodb';

const { uri, options } = MONGO_CONFIG;

const client = new MongoClient(uri);

async function run(): Promise<void> {
  try {
    const database = client.db(options.dbName);
    const collection = database.collection('chats');

    const index = SEARCH_CHATS_INDEX;
    const _result = await collection.createSearchIndex(index);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
