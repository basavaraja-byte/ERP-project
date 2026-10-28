import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB, getDbState } from './config/database.js';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('='.repeat(60));
  console.log('  TrustView ERP Management Backend');
  console.log('='.repeat(60));

  // Initiate database connection in background so HTTP server starts instantaneously
  connectDB().catch((err) => {
    console.warn('[MongoDB Background Connect]:', err.message);
  });

  const server = app.listen(PORT, () => {
    const dbState = getDbState();
    console.log(`[TrustView Server] Listening on http://localhost:${PORT}`);
    console.log(`[TrustView Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[TrustView Server] MongoDB State: ${dbState.status.toUpperCase()}`);
    if (dbState.connected) {
      console.log(`[TrustView Server] Atlas Database: "${dbState.dbName}"`);
    } else {
      console.log('[TrustView Server] Notice: Backend running with synchronized demonstration cache.');
      console.log('[TrustView Server] To connect MongoDB Atlas, set MONGODB_URI in server/.env');
    }
    console.log('='.repeat(60));
  });

  const shutdown = async (signal) => {
    console.log(`\n[TrustView Server] Received ${signal}. Gracefully stopping...`);
    server.close(() => {
      console.log('[TrustView Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[TrustView Server] Failed to initialize server:', err);
  process.exit(1);
});

