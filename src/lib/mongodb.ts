/**
 * MongoDB Connection Utility
 * Reuses a single connection across requests, handles hot-reload in dev.
 * NEVER import this in client components — server-side only.
 */

import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Provide a deferred rejection instead of throwing at import time
  clientPromise = Promise.reject(
    new Error('MONGODB_URI environment variable is not set. Please configure it in your environment or .env file.')
  );
  // Prevent unhandled promise rejection warnings during static builds
  clientPromise.catch(() => {});
} else if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection across HMR reloads.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
