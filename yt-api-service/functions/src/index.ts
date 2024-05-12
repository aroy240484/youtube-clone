import * as v1Functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import {Storage} from "@google-cloud/storage";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();
const rawVideoBucketName = "aroy-yt-raw-videos";
const REGION = "northamerica-northeast1";

export const createUser = v1Functions.region(REGION)
  .runWith({maxInstances: 1, memory: "2GB"})
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

export const generateUploadUrl = v1Functions.region(REGION)
  .runWith({maxInstances: 1, memory: "2GB"})
  .https.onCall(async (request) => {
    // Check if user is authenticated
    if (!request.auth) {
      v1Functions.logger.error("User is not authenticated.");
      throw new v1Functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);

    // Generate a unique filename for upload
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    v1Functions.logger.info("Signed URL successfully obtained");
    return [url, fileName];
  });
