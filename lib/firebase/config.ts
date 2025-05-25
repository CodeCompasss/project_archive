import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';

// Function to check if all required Firebase config values are present
const hasValidFirebaseConfig = () => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  return requiredKeys.every(key => !!process.env[key]);
};

// Mock implementations for when Firebase is not configured
const createMockAuth = (): Auth => ({
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  },
  signOut: async () => Promise.resolve(),
} as unknown as Auth);

const createMockStorage = (app: FirebaseApp): FirebaseStorage => ({
  app,
  maxUploadRetryTime: 600000,
  maxOperationRetryTime: 600000,
  ref: () => ({}),
} as unknown as FirebaseStorage);

// Initialize Firebase or mock services
let firebaseApp: FirebaseApp = {} as FirebaseApp;
let auth: Auth = createMockAuth();
let firestore: Firestore = {} as Firestore;
let storage: FirebaseStorage = createMockStorage(firebaseApp);

// Only initialize Firebase if we have all required config values
if (hasValidFirebaseConfig()) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // Initialize Firebase only if it hasn't been initialized yet
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize services
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error);
    // Keep using mock implementations if initialization fails
  }
} else if (process.env.NODE_ENV === 'development') {
  console.warn(
    'Firebase configuration is incomplete. Running in development mode with mock services.\n' +
    'To use real Firebase services, ensure all required environment variables are set in your .env.local file.'
  );
}

// Export the Firebase services (real or mock)
export { firebaseApp, auth, firestore, storage };

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => getApps().length > 0;

export async function uploadFileToFirebase(file: File, folder: string): Promise<string> {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase is not initialized. Please check your configuration.');
  }
  
  const storageRef = ref(storage, `${folder}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}