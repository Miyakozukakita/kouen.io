// Firebase SDKをモジュールとして読み込む
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

// ページ読み込み時の処理
window.onload = () => {
  displayToday();
  loadTimes();
};

// 今日の日付を表示
function displayToday() {
  const now = new Date();
  const todayStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  document.getElementById('current-date').textContent = `本日: ${todayStr}`;
}

// Firestoreから時刻読み込み
async function loadTimes() {
  const todayStr = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  const docRef = doc(db, "work-times", todayStr);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.start) document.getElementById('start-time').textContent = data.start;
    if (data.end) document.getElementById('end-time').textContent = data.end;
  } else {
    console.log("No data for today.");
  }
}

// 出勤 or 退勤を記録
async function recordTime(type) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const todayStr = now.toISOString().split('T')[0];
  const docRef = doc(db, "work-times", todayStr);

  try {
    await setDoc(docRef, {
      date: todayStr,
      [type]: timeStr,
    }, { merge: true });

    document.getElementById(`${type}-time`).textContent = timeStr;
  } catch (error) {
    console.error("データ保存エラー:", error);
  }
}

window.onload = () => {
  displayToday();
  loadTimes();

  // イベントリスナー追加
  document.getElementById("start-btn").addEventListener("click", () => recordTime("start"));
  document.getElementById("end-btn").addEventListener("click", () => recordTime("end"));
};
