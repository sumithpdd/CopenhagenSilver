import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  connectAuthEmulator as connectAuthEmulatorFB,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator as connectFirestoreEmulatorFB,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  connectStorageEmulator as connectStorageEmulatorFB,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Connect to emulators in development (disabled - using real Firebase)
  // if (process.env.NODE_ENV === 'development') {
  //   try {
  //     connectAuthEmulatorFB(auth, 'http://localhost:9099');
  //     connectFirestoreEmulatorFB(db, 'localhost', 8080);
  //     connectStorageEmulatorFB(storage, 'localhost', 9199);
  //   } catch (error) {
  //     console.log('Emulator connection skipped (not running)');
  //   }
  // }

  console.log('✅ Firebase initialized with project:', firebaseConfig.projectId);
} else {
  app = getApps()[0]!;
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
