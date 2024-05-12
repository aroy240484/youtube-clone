import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/** if (process.env.NODE_ENV !== 'production') {
  firestore.settings({
      host: "localhost:8080", // Default port for Firestore emulator
      ssl: false
  });
} */

const videoCollectionId = 'videos';

export interface VideoInfo {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string,
}

async function getVideoInfo(videoId: string) {
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  return (snapshot.data() as VideoInfo) ?? {};
}

export function setVideoInfo(videoId: string, videoInfo: VideoInfo) {
  return firestore.collection(videoCollectionId)
    .doc(videoId)
    .set(videoInfo, { merge: true });
}

export async function isVideoNew(videoId: string) {
  const videoInfo = await getVideoInfo(videoId);
  return videoInfo?.status === undefined;
}