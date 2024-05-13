import * as v1Functions from "firebase-functions";
import * as v2Functions from "firebase-functions/v2";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import {Storage} from "@google-cloud/storage";
import {RAW_VIDEO_BUCKET_NAME} from "./config";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();
const v1Region = "northamerica-northeast1";
const v2Region = "northamerica-northeast2";
const videoCollectionId = "videos";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string
}

export const createUser = v1Functions.region(v1Region)
  .runWith({maxInstances: 1})
  .auth.user().onCreate((user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      photoUrl: user.photoURL,
    };

    firestore.collection("users").doc(user.uid).set(userInfo);
    v1Functions.logger.info(`User created: ${JSON.stringify(userInfo)}`);
    return;
  });

export const generateUploadUrl = v2Functions.https
  .onCall({region: v2Region, maxInstances: 1}, async (request) => {
    // Check if user is authenticated
    if (!request.auth) {
      throw new v2Functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    v2Functions.logger
      .info("Authenticated call. Generating signed URL...");
    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(RAW_VIDEO_BUCKET_NAME);

    // Generate a unique filename for upload
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    v2Functions.logger.info(`Signed URL generated: ${url}`);
    return {url, fileName};
  });

export const getVideos = v2Functions.https
  .onCall({region: v2Region, maxInstances: 1}, async () => {
    const querySnapshot =
      await firestore.collection(videoCollectionId).limit(10).get();
    return querySnapshot.docs.map((doc) => doc.data());
  });
