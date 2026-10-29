import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/database.js';

let dbConnected = false;

export default async function handler(req, res) {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.warn('[Vercel Serverless MongoDB]:', err.message);
    }
  }
  return app(req, res);
}

