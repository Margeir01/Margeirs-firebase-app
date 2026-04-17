import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTmDx5IzB1GeMA9w0GflJvTy2CRx0DaPw",
  authDomain: "database-prosjekt-d7f33.firebaseapp.com",
  projectId: "database-prosjekt-d7f33",
  storageBucket: "database-prosjekt-d7f33.firebasestorage.app",
  messagingSenderId: "211536762103",
  appId: "1:211536762103:web:1da5eac3fbca85df50eff2",
  measurementId: "G-37603ED50B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const message = document.getElementById("message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#dc2626" : "#16a34a";
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./app.html";
  }
});

registerBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(
      auth,
      registerEmail.value,
      registerPassword.value
    );
  } catch (error) {
    showMessage(error.message, true);
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    );
  } catch (error) {
    showMessage(error.message, true);
  }
});

googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    showMessage(error.message, true);
  }
});