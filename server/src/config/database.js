import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env regardless of process current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let connectionError = null;

/**
 * Mongoose Connection States:
 * 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
 */
export const getDbState = () => {
  const readyState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateStr = states[readyState] || 'unknown';

  return {
    connected: readyState === 1,
    readyState,
    status: stateStr,
    dbName: mongoose.connection.name || process.env.DB_NAME || 'trustview_erp',
    host: mongoose.connection.host || null,
    hasUriConfigured: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0),
    lastError: connectionError ? connectionError.message : null
  };
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '') : '';
  const dbName = process.env.DB_NAME || 'trustview_erp';

  if (!uri) {
    console.warn(
      '\n[MongoDB Notice] MONGODB_URI is not configured in server/.env.\n' +
      '-> The Express server is running in offline demonstration mode.\n' +
      '-> To connect to MongoDB Atlas, add your connection string to server/.env.\n'
    );
    return false;
  }

  // Auto-sanitize accidental angle brackets from Atlas connection templates (<username>:<password>)
  if (uri.includes('<') || uri.includes('>')) {
    uri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, (_match, user, pass) => {
      const cleanUser = user.replace(/^<|>$/g, '');
      const cleanPass = pass.replace(/^<|>$/g, '');
      return `mongodb+srv://${cleanUser}:${cleanPass}@`;
    });
  }

  try {
    console.log('[MongoDB] Attempting connection to MongoDB Atlas...');
    
    // Connect with an 8-second timeout for resilient Atlas discovery
    const connectPromise = mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection attempt timed out after 8000ms')), 8000)
    );

    const conn = await Promise.race([connectPromise, timeoutPromise]);

    connectionError = null;
    console.log(`[MongoDB Connected] Successfully connected to database: ${conn.connection.name} on ${conn.connection.host}`);
    return true;
  } catch (error) {
    connectionError = error;
    // Sanitize any potential credentials from error logging
    const sanitizedMsg = (error.message || '').replace(/\/\/.*@/, '//<CREDENTIALS_MASKED>@');
    console.error(`[MongoDB Connection Error] Failed to connect: ${sanitizedMsg}`);
    console.error('-> Please check your MongoDB Atlas credentials, cluster status, and IP whitelist in Atlas Network Access.\n');
    return false;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected gracefully.');
  }
};

// Graceful process exit handlers
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

