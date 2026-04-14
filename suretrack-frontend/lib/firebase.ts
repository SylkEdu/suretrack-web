import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRvbxCqvtGCrjDJ7JUJkyYfcs7PEwBZ8s",
  authDomain: "suretrack-5a1dd.firebaseapp.com",
  projectId: "suretrack-5a1dd",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
