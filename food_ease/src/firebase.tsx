// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxBmFHT3P6IsY0eQC9R36CZpQ23H2cyMI",
  authDomain: "food-ease-se.firebaseapp.com",
  projectId: "food-ease-se",
  storageBucket: "food-ease-se.firebasestorage.app",
  messagingSenderId: "753740067803",
  appId: "1:753740067803:web:cffceeaeddaeeb29b62dfe",
  measurementId: "G-GS9CG6LECM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export default db;