import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import {Firestore} from "firebase-admin/firestore";

initializeApp();

const firestore = new Firestore();

export const createUser = functions
  .region("northamerica-northeast1").auth.user().onCreate((user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      photoUrl: user.photoURL,
    };

    firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User created: ${JSON.stringify(userInfo)}`);
    return;
  });
