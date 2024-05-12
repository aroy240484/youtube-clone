// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, User, getAuth, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { API_KEY, APP_ID, AUTH_DOMAIN, PROJECT_ID } from "./firebaseconfig";
import { getFunctions, httpsCallable } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: `${API_KEY}`,
  authDomain: `${AUTH_DOMAIN}`,
  projectId: `${PROJECT_ID}`,
  appId: `${APP_ID}`,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut() {
  return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 */
export function onAuthStateChangedHandler(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

const functions = getFunctions(app, 'northamerica-northeast2');
const generateUploadUrlFunction = httpsCallable(functions, 'generateUploadUrl');

export async function uploadRawVideo(file: File) {
  // Request a signed URL for uploading the file
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split('.').pop()
  });

  // Upload the file to the signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  return uploadResult;
}