import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteField
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBR7AMsGD3P0lUfjvRHCHjMG3XmK12K4IU",
  authDomain: "miyakozuka-89982.firebaseapp.com",
  projectId: "miyakozuka-89982",
  storageBucket: "miyakozuka-89982.appspot.com",
  messagingSenderId: "80890323227",
  appId: "1:80890323227:web:f5d79ddbddbe480f8a33be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let waterTimes = [];
const maxCount = 10;
let selectedDate = getTodayStr();  // 初期は今日

// LINE設定
const LINE_ACCESS_TOKEN = 'IR54C6+5BAgTTgnZiAwh8kGuCi+3zqzw5jCm4jknpBHz22WPtUp1xXVWnrkDf/NijNoWMwecM3YGT+qvz84Vaau8XdHSD6SXA/JrGIOu7WSQC+xGhAnQcGV5a6rg7lcyzjNZypS0Bn4A9LxLq2uOUgdB04t89/1O/w1cDnyilFU=';  // ←あなたのチャンネルアクセストークン
const GROUP_ID = 'Cf22d3ef700a771c636ff04120cc57fbc';                // ←あなたのグループID

// 今日の日付を取得
function getTodayStr() {
  const now = new Date();
  now.setHours(now.getHours() + 9); // UTC→JST変換
  return now.toISOString().split('T')[0];
}

// 日付を日本語で表示
function formatJapaneseDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
}

// 現在選択中の日付を画面に表示
function displaySelectedDate() {
  document.getElementById('current-date').textContent = `表示日: ${formatJapaneseDate(selectedDate)}`;
}

// Firebaseに水やり時間を記録し、LINEに送信
async function recordWaterTime() {
  if (waterTimes.length >= maxCount) {
    alert("今日はすでに10回水やりしています。");
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit'
  });

  waterTimes.push(timeStr);
  await saveAllTimes();
  renderRecords();

  // 水やり完了後にLINEに通知！
  await sendLineMessage(`🌱 水やり完了！(${timeStr})`);
}

// 水やり記録一覧を表示
function renderRecords() {
  const recordBlock = document.getElementById("records");
  recordBlock.innerHTML = "";

  waterTimes.forEach((timeStr, index) => {
    const num = index + 1;
    const row = document.createElement("div");
    row.className = "record-row";
    row.id = `row-${num}`;

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = `${num}回目`;

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = timeStr;
    time.id = `time-${num}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "修正";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = () => editTime(num - 1);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.style.marginLeft = "5px";
    deleteBtn.onclick = () => deleteTime(num - 1);

    row.appendChild(label);
    row.appendChild(time);
    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
    recordBlock.appendChild(row);
  });
}

// 水やり時間を修正
async function editTime(index) {
  const newTime = prompt("新しい時間を入力してください（例: 14:30）", waterTimes[index]);
  if (!newTime) return;
  waterTimes[index] = newTime;
  await saveAllTimes();
  renderRecords();
}

// 水やり時間を削除
async function deleteTime(index) {
  if (!confirm("この記録を削除しますか？")) return;
  waterTimes.splice(index, 1);
  await saveAllTimes();
  renderRecords();
}

// Firebaseに水やり時間を保存
async function saveAllTimes() {
  const docRef = doc(db, "water-records", selectedDate);

  const data = {};
  waterTimes.forEach((timeStr, i) => {
    data[`time${i + 1}`] = timeStr;
  });

  const clearData = {};
  for (let i = 1; i <= maxCount; i++) {
    clearData[`time${i}`] = deleteField();
  }

  await updateDoc(docRef, clearData).catch(() => {});
  await setDoc(docRef, data, { merge: true });
}

// 日付ごとの水やり記録をロード
async function loadWaterTimes() {
  const docRef = doc(db, "water-records", selectedDate);
  const docSnap = await getDoc(docRef);

  waterTimes = [];

  if (docSnap.exists()) {
    const data = docSnap.data();
    for (let i = 1; i <= maxCount; i++) {
      const key = `time${i}`;
      if (data[key]) {
        waterTimes.push(data[key]);
      }
    }
  }
  renderRecords();
  displaySelectedDate();
}

// LINEにメッセージを送信
async function sendLineMessage(text) {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: GROUP_ID,
      messages: [{ type: 'text', text }]
    })
  });
}

// 画面ロード時の初期設定
window.onload = () => {
  const picker = document.getElementById("date-picker");
  picker.value = selectedDate;

  picker.addEventListener("change", async (e) => {
    selectedDate = e.target.value;
    await loadWaterTimes();
  });

  document.getElementById("water-btn").addEventListener("click", recordWaterTime);

  loadWaterTimes();
};

// アプリへのリンクボタン
document.getElementById("recordAppBtn").addEventListener("click", () => {
  window.location.href = "https://miyakozukakita.github.io/calendar.io/";
});
