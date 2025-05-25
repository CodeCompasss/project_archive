// Import User and other necessary types/functions from Firebase Auth
import { signInWithPopup, GoogleAuthProvider, User, UserCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore, isFirebaseInitialized } from './config';

// Function to track authentication state changes
export function onAuthStateChanged(callback: (authUser: User | null) => void) {
  if (!isFirebaseInitialized()) {
    // If Firebase is not initialized, always return null user
    setTimeout(() => callback(null), 0);
    return () => {}; // Return a no-op unsubscribe function
  }
  return auth.onAuthStateChanged(callback);
}

// Function for Google sign-in and role check
export async function signInWithGoogle(): Promise<{ isAdmin: boolean }> {
  if (!isFirebaseInitialized()) {
    console.warn('Firebase is not initialized. Running in development mode.');
    return { isAdmin: false };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ display: "popup" }); // Force popup

  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    const user: User = result.user;

    if (!user || !user.email) {
      throw new Error('Google sign-in failed');
    }

    // Restrict login to only emails from "gecskp.ac.in", except for a specific admin email
    const allowedEmailPattern = /^[a-zA-Z0-9]+@gecskp\.ac\.in$/;
    const adminOverrideEmail = "codecompass2024@gmail.com";

    if (user.email !== adminOverrideEmail && !allowedEmailPattern.test(user.email)) {
      await auth.signOut(); // Sign out the user if email is not allowed
      throw new Error('Only GEC SKP emails are allowed');
    }

    const userDocRef = doc(firestore, 'adminemail', user.email);
    const userDoc = await getDoc(userDocRef);

    const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';

    return { isAdmin };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOutWithGoogle(): Promise<void> {
  if (!isFirebaseInitialized()) {
    console.warn('Firebase is not initialized. No need to sign out.');
    return;
  }
  
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out with Google:', error);
    throw error;
  }
}
