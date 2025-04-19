import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBR7AMsGD3P0lUfjvRHCHjMG3XmK12K4IU",
    authDomain: "miyakozuka-89982.firebaseapp.com",
    projectId: "miyakozuka-89982",
    storageBucket: "miyakozuka-89982.firebasestorage.app",
    messagingSenderId: "80890323227",
    appId: "1:80890323227:web:f5d79ddbddbe480f8a33be",
    measurementId: "G-3N56F9MCSG"
};

// Firebaseを初期化aa
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

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
function loadTimes() {
  const todayStr = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  // Firestoreからデータを取得
  db.collection("work-times").doc(todayStr).get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data.start) document.getElementById('start-time').textContent = data.start;
        if (data.end) document.getElementById('end-time').textContent = data.end;
      }
    })
    .catch((error) => {
      console.error("データ取得エラー:", error);
    });
}

// 出勤 or 退勤を記録
function recordTime(type) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const todayStr = now.toISOString().split('T')[0]; // yyyy-mm-dd

  // Firestoreのドキュメントを取得または作成
  const docRef = db.collection("work-times").doc(todayStr);

  // データを更新または追加
  docRef.set({
    date: todayStr,
    [type]: timeStr,
  }, { merge: true })
  .then(() => {
    document.getElementById(`${type}-time`).textContent = timeStr;
  })
  .catch((error) => {
    console.error("データ保存エラー:", error);
  });
}
