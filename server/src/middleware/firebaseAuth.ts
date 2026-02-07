import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let initialized = false;

function initAdmin() {
  if (initialized) return;
  try {
    // Prefer Application Default Credentials if provided via env var
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
      initialized = true;
      return;
    }

    // Fallback: look for serviceAccountKey.json in the server root
    const candidate = path.resolve(__dirname, '..', '..', 'serviceAccountKey.json');
    if (fs.existsSync(candidate)) {
      // require the JSON file (keeps it out of the compiled bundle)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(candidate);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      initialized = true;
      return;
    }

    // Final fallback: try to initialize default app (may work if env creds available)
    admin.initializeApp();
    initialized = true;
  } catch (err) {
    console.error('Firebase Admin initialization failed:', err);
  }
}

export async function firebaseAuth(req: Request, res: Response, next: NextFunction) {
  initAdmin();

  const auth = (req.headers['authorization'] || '') as string;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const idToken = auth.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    (req as any).user = { id: decoded.uid, ...decoded };
    return next();
  } catch (err) {
    console.error('Firebase token verification failed:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
