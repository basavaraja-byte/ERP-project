import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '') : '';
if (uri && (uri.includes('<') || uri.includes('>'))) {
  uri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, (_match, user, pass) => {
    return `mongodb+srv://${user.replace(/^<|>$/g, '')}:${pass.replace(/^<|>$/g, '')}@`;
  });
}

async function verifyCounts() {
  await mongoose.connect(uri, { dbName: 'trustview_erp' });
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('--- ATLAS trustview_erp COLLECTION COUNTS ---');
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`${c.name}: ${count} records`);
  }
  await mongoose.disconnect();
}
verifyCounts();

