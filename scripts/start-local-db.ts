/**
 * Local MongoDB Server Runner
 * Runs a standalone MongoDB server on localhost:27017 with persistent storage.
 * Designed for local development and MongoDB Compass visualization.
 * 
 * Usage: npm run db:start
 */

import fs from 'fs';
import path from 'path';
import net from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      resolve(false);
    });
  });
}

async function start() {
  // 1. Check if MongoDB is already active and listening on port 27017
  const isRunning = await isPortInUse(27017);

  if (isRunning) {
    console.log('\n======================================================');
    console.log('🍃 MongoDB is ALREADY running on port 27017!');
    console.log('======================================================');
    console.log('📡 Connection URI:  mongodb://127.0.0.1:27017/moneymatrix');
    console.log('🔌 Port:            27017');
    console.log('📁 Database Name:   moneymatrix');
    console.log('💾 Storage:         .mongodb_data/ (persisted on disk)');
    console.log('======================================================');
    console.log('👉 Open MongoDB Compass and connect to:');
    console.log('   mongodb://localhost:27017');
    console.log('======================================================\n');
    return;
  }

  const dataDir = path.resolve(process.cwd(), '.mongodb_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  } else {
    // If port is free, remove any stale lock file left over from an abnormal shutdown
    const lockFile = path.join(dataDir, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch {
        // Ignored if lock file is already unlocked
      }
    }
  }

  console.log('⏳ Starting local MongoDB server on port 27017...');

  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'moneymatrix',
        dbPath: dataDir,
        storageEngine: 'wiredTiger',
      },
    });

    const uri = mongod.getUri();
    console.log('\n======================================================');
    console.log('🍃 Local MongoDB Server is RUNNING!');
    console.log('======================================================');
    console.log(`📡 Connection URI:  ${uri}moneymatrix`);
    console.log(`🔌 Port:            27017`);
    console.log(`📁 Database Name:   moneymatrix`);
    console.log(`💾 Storage:         .mongodb_data/ (persisted on disk)`);
    console.log('======================================================');
    console.log('👉 Open MongoDB Compass and connect to:');
    console.log('   mongodb://localhost:27017');
    console.log('======================================================\n');
    console.log('Press Ctrl+C to stop the local database.\n');

    const cleanup = async () => {
      console.log('\nStopping local MongoDB server...');
      await mongod.stop();
      console.log('Local MongoDB server stopped.');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (err: unknown) {
    // Double check if MongoDB successfully launched or another process took the port
    if (await isPortInUse(27017)) {
      console.log('\n======================================================');
      console.log('🍃 MongoDB is ALREADY running on port 27017!');
      console.log('======================================================');
      console.log('👉 Open MongoDB Compass and connect to:');
      console.log('   mongodb://localhost:27017');
      console.log('======================================================\n');
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Could not start local MongoDB server:', message);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error('Failed to start local MongoDB server:', err);
  process.exit(1);
});
