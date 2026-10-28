import { getDbState } from '../config/database.js';
import { Campus } from '../models/Campus.js';

export const getHealth = async (req, res) => {
  const dbState = getDbState();
  let campusRecordCount = 0;

  if (dbState.connected) {
    try {
      campusRecordCount = await Campus.countDocuments().maxTimeMS(2000);
    } catch {
      campusRecordCount = 0;
    }
  }

  const hasRecords = campusRecordCount > 0;

  const healthPayload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: process.env.PORT || 5000,
      corsOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
    },
    database: {
      connected: dbState.connected,
      status: dbState.status,
      hasUriConfigured: dbState.hasUriConfigured,
      targetDatabase: dbState.dbName,
      host: dbState.host,
      hasRecords,
      recordCount: campusRecordCount,
      dataMode: dbState.connected
        ? (hasRecords ? 'live-database' : 'connected-empty-demo-cache')
        : 'offline-demo-cache',
      message: dbState.connected
        ? (hasRecords
            ? `MongoDB Atlas connected: ${campusRecordCount} campuses active.`
            : 'MongoDB Atlas connected: Database collections are currently empty (0 records). Running with verified synthetic demo cache.')
        : dbState.hasUriConfigured
        ? `Database connection state is "${dbState.status}". Check network and credentials.`
        : 'MONGODB_URI is not set in server/.env. Running with verified synthetic demonstration records.'
    }
  };

  return res.status(200).json(healthPayload);
};

