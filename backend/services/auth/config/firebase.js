import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "../serviceAccount.json" with { type: "json" };

export const isMockFirebase = !serviceAccount || serviceAccount.project_id === undefined || serviceAccount.type === "paste your service account file";

let appInstance = null;
if (!isMockFirebase) {
  try {
    appInstance = initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.warn("Failed to initialize Firebase Admin SDK. Falling back to mock firebase.", error.message);
  }
}

export const app = appInstance;