import { initializeApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database"; 

const firebaseConfig = {
  apiKey: "AIzaSyCvgb4XkWFk7L1yl_DSm_SgqcCBhvzMkvI",
  authDomain: "chat-app-c21d3.firebaseapp.com",
  databaseURL: "https://chat-app-c21d3-default-rtdb.firebaseio.com",
  projectId: "chat-app-c21d3",
  storageBucket: "chat-app-c21d3.firebasestorage.app",
  messagingSenderId: "508883095535",
  appId: "1:508883095535:web:50b50cbdf176f8692b301a",
  measurementId: "G-GKXBQ3YLWN"
};

const app = initializeApp(firebaseConfig);

export const db: Database = getDatabase(app);
