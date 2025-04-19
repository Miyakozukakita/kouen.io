import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBR7AMsGD3P0lUfjvRHCHjMG3XmK12K4IU",
  authDomain: "miyakozuka-89982.firebaseapp.com",
  projectId: "miyakozuka-89982",
  storageBucket: "miyakozuka-89982.firebasestorage.app",
  messagingSenderId: "80890323227",
  appId: "1:80890323227:web:f5d79ddbddbe480f8a33be",
  measurementId: "G-3N56F9MCSG"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 現在の時刻を取得
function getTimeStr() {
  const now = new Date();
  return now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 今日の記録を取得
async function loadWaterTimes() {
  const todayStr = new Date().toISOString().split('T')[0];
  const docRef = doc(db, "water-times", todayStr);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.time1) document.getElementById("time1").textContent = data.time1;
    if (data.time2) document.getElementById("time2").textContent = data.time2;
  }
}

// ボタンイベント
async function recordWaterTime() {
  const now = getTimeStr();
  const todayStr = new Date().toISOString().split('T')[0];
  const docRef = doc(db, "water-times", todayStr);
  const docSnap = await getDoc(docRef);
  const data = docSnap.exists() ? docSnap.data() : {};

  if (!data.time1) {
    data.time1 = now;
    document.getElementById("time1").textContent = now;
  } else if (!data.time2) {
    data.time2 = now;
    document.getElementById("time2").textContent = now;
  } else {
    alert("今日はすでに2回記録されています。");
    return;
  }

  await setDoc(docRef, data, { merge: true });
}

// 初期処理
window.onload = () => {
  displayToday();
  loadWaterTimes();
  document.getElementById("water-btn").addEventListener("click", recordWaterTime);
};
