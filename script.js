// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

function displayToday(date = new Date()) {
  const todayStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  document.getElementById('current-date').textContent = `表示日: ${todayStr}`;
}

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
}

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

async function editTime(index) {
  const newTime = prompt("新しい時間を入力してください（例: 14:30）", waterTimes[index]);
  if (!newTime) return;
  waterTimes[index] = newTime;
  await saveAllTimes();
  renderRecords();
}

async function deleteTime(index) {
  if (!confirm("この記録を削除しますか？")) return;
  waterTimes.splice(index, 1);
  await saveAllTimes();
  renderRecords();
}

async function saveAllTimes(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const docRef = doc(db, "water-records", dateStr);

  const data = {};
  waterTimes.forEach((timeStr, i) => {
    data[`time${i + 1}`] = timeStr;
  });

  const clearData = {};
  for (let i = 1; i <= maxCount; i++) {
    clearData[`time${i}`] = deleteField();
  }

  await updateDoc(docRef, clearData);
  await setDoc(docRef, data, { merge: true });
}

async function loadWaterTimes(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const docRef = doc(db, "water-records", dateStr);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    waterTimes = [];
    for (let i = 1; i <= maxCount; i++) {
      const key = `time${i}`;
      if (data[key]) {
        waterTimes.push(data[key]);
      }
    }
    renderRecords();
  } else {
    waterTimes = [];
    renderRecords();
  }
}

function setupDatePicker() {
  const input = document.getElementById("date-picker");
  input.addEventListener("change", async () => {
    const selectedDate = new Date(input.value);
    displayToday(selectedDate);
    await loadWaterTimes(selectedDate);
  });
}

window.onload = () => {
  displayToday();
  loadWaterTimes();
  setupDatePicker();
  document.getElementById("water-btn").addEventListener("click", recordWaterTime);
};
