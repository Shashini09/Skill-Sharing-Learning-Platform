import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCIOMEcOcp3AkFgMCGK-5wnnofND1Y5Tkw",
    authDomain: "skill-e471d.firebaseapp.com",
    projectId: "skill-e471d",
    storageBucket: "skill-e471d.firebasestorage.app",
    messagingSenderId: "739486484168",
    appId: "1:739486484168:web:dc6c6a8e2f8f6aa49347fd",
    measurementId: "G-33R0MT5B8B"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };