import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCV9vo9biZIa_mocJWX_XAzPiv-owMHAH8",
  authDomain: "marketing-race-game.firebaseapp.com",
  projectId: "marketing-race-game",
  storageBucket: "marketing-race-game.firebasestorage.app",
  messagingSenderId: "705909994406",
  appId: "1:705909994406:web:229973afad769c07e09567"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
