import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

let count = 0;
const maxCount = 10;

function displayToday() {
  const now = new Date();
  const todayStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  document.getElementById('current-date').textContent = `本日: ${todayStr}`;
}

async function recordWaterTime() {
  if (count >= maxCount) {
    alert("今日はすでに10回水やりしています。");
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit'
  });

  count++;
  addRecordRow(count, timeStr);

  const todayStr = now.toISOString().split('T')[0];
  const docRef = doc(db, "water-records", todayStr);

  try {
    const data = {};
    data[`time${count}`] = timeStr;
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.error("データ保存失敗", err);
  }
}

function addRecordRow(num, timeStr) {
  const recordBlock = document.getElementById("records");

  const row = document.createElement("div");
  row.className = "record-row";

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = `${num}回目`;

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = timeStr;

  row.appendChild(label);
  row.appendChild(time);
  recordBlock.appendChild(row);
}

async function loadWaterTimes() {
  const todayStr = new Date().toISOString().split('T')[0];
  const docRef = doc(db, "water-records", todayStr);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    for (let i = 1; i <= maxCount; i++) {
      const key = `time${i}`;
      if (data[key]) {
        count++;
        addRecordRow(i, data[key]);
      }
    }
  }
}

window.onload = () => {
  displayToday();
  loadWaterTimes();
  document.getElementById("water-btn").addEventListener("click", recordWaterTime);
};
