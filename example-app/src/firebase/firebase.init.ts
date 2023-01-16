import {
  initializeFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { initializeApp, setLogLevel } from "firebase/app";
import {
  initializeAuth,
  connectAuthEmulator,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  browserLocalPersistence,
} from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./firebase.config";

const { defaultBucket, emulator, ...baseFirebaseConfig } = firebaseConfig;

export const app = initializeApp(baseFirebaseConfig);
export const firestoreInstance = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
export const storageInstance = getStorage(app, defaultBucket);
export const functionsInstance = getFunctions(app);
export const analyticsInstance =
  process.env.NODE_ENV === "production" ? getAnalytics(app) : null;

if (emulator) {
  setLogLevel("silent");
  connectFirestoreEmulator(
    firestoreInstance,
    `${window.location.hostname}`,
    8090
  );
  connectStorageEmulator(storageInstance, `${window.location.hostname}`, 9199);
  connectAuthEmulator(auth, `http://${window.location.hostname}:9099`, {
    disableWarnings: true,
  });
  connectFunctionsEmulator(
    functionsInstance,
    `${window.location.hostname}`,
    5001
  );
}
