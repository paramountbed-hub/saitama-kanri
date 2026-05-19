// =============================================
// 全ステータス一覧 - list.js
// =============================================

const TASKS = [
  "01 商談中",
  "02 概算見積もり（参考価格書）提出",
  "03 導入環境確認（仮想／NW環境含む）",
  "04 仕入れ見積もり取得",
  "05 最終見積提出",
  "06 カスタマーサクセス打合せ",
  "07 受注",
  "08 社内キックオフ",
  "09 システム構築準備期間",
  "10 稼働（立会等）",
  "11 稼働後フォロー",
];

const STAFF = [
  "本田 正信", "西尾 仁志", "江副 洋介", "松浦 寿和", "小嶋 直樹",
  "中村 美月", "増田 慶太", "佐藤 裕二", "赤松 稔丈", "その他",
];

let allProjects = [];
let searchQuery = "";
let filterPerson = "";
let filterStatus = "";

// =============================================
// 遅延判定
// =============================================
function checkDelay(project) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const live = new Date(project.goLiveDate);
  const daysUntilLive = Math.ceil((live - today) / (1000 * 60 * 60 * 24));
  const t = project.currentTask;

  if (t >= TASKS.length) return "completed";
  if (t <= 9 && daysUntilLive < -1) return "warning";
  if (t < 8 && daysUntilLive <= 170) return "delay";
  if (t < 7 && daysUntilLive <= 180) return "delay";
  if (t < 5 && daysUntilLive <= 190) return "delay";
  if (t < 3 && daysUntilLive <= 210) return "delay";
  if (t === 0 && daysUntilLive <= 240) return "warning";
  return "";
}

function statusLabel(status) {
  switch (status) {
    case "delay":     return { text: "遅延",  cls: "badge badge-delay" };
    case "warning":   return { text: "注意",  cls: "badge badge-warning" };
    case "completed": return { text: "完了",  cls: "badge badge-completed" };
    default:          return { text: "正常",  cls: "badge badge-normal" };
  }
}

// =============================================
// テーブル描画
// =============================================
function renderTable() {
  const tbody = document.getElementById("tableBody");

  let filtered = allProjects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchName = p.hospitalName?.toLowerCase().includes(q) ?? false;
    const matchPerson =
      !filterPerson ||
      p.mainPerson === filterPerson ||
      p.subPerson === filterPerson;
    const status = checkDelay(p);
    const normalizedStatus = status === "" ? "normal" : status;
    const matchStatus = !filterStatus || normalizedStatus === filterStatus;
    return matchName && matchPerson && matchStatus;
  });

  const priority = { delay: 0, warning: 1, "": 2, completed: 3 };
  filtered.sort((a, b) => {
    const pa = priority[checkDelay(a)];
    const pb = priority[checkDelay(b)];
    if (pa !== pb) return pa - pb;
    return new Date(a.goLiveDate) - new Date(b.goLiveDate);
  });

  document.getElementById("projectCount").textContent = `${filtered.length} 件`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">該当する案件がありません</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p) => {
    const status = checkDelay(p);
    const { text, cls } = statusLabel(status);
    const isCompleted = p.currentTask >= TASKS.length;
    const taskLabel = isCompleted ? "✅ 全工程完了" : (TASKS[p.currentTask] || "―");

    const live = new Date(p.goLiveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilLive = p.goLiveDate
      ? Math.ceil((live - today) / (1000 * 60 * 60 * 24))
      : null;

    const liveFormatted = p.goLiveDate
      ? live.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
      : "―";

    let daysText = "―";
    let daysCls = "";
    if (daysUntilLive !== null) {
      if (daysUntilLive > 0) { daysText = `${daysUntilLive} 日`; }
      else if (daysUntilLive === 0) { daysText = "本日"; daysCls = "days-today"; }
      else { daysText = `+${Math.abs(daysUntilLive)} 日経過`; daysCls = "days-past"; }
    }

    return `
      <tr class="table-row-${status || 'normal'}">
        <td><span class="${cls}">${text}</span></td>
        <td class="cell-hospital">${escapeHtml(p.hospitalName)}</td>
        <td>${liveFormatted}</td>
        <td class="${daysCls}">${daysText}</td>
        <td class="cell-task">${taskLabel}</td>
        <td>${escapeHtml(p.mainPerson || "―")}</td>
        <td>${escapeHtml(p.subPerson || "―")}</td>
        <td class="cell-memo">${escapeHtml(p.memo || "")}</td>
      </tr>
    `;
  }).join("");
}

// =============================================
// Firestore リアルタイム同期
// =============================================
function initFirestore() {
  db.collection("projects")
    .orderBy("goLiveDate", "asc")
    .onSnapshot(
      (snapshot) => {
        allProjects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        renderTable();
      },
      (error) => {
        console.error("Firestore error:", error);
        document.getElementById("tableBody").innerHTML =
          `<tr><td colspan="8" class="loading-cell">データ取得に失敗しました</td></tr>`;
      }
    );
}

// =============================================
// 検索・フィルタ
// =============================================
function initFilters() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  const staffSel = document.getElementById("staffFilter");
  staffSel.innerHTML =
    `<option value="">全員表示</option>` +
    STAFF.map((s) => `<option value="${s}">${s}</option>`).join("");
  staffSel.addEventListener("change", (e) => {
    filterPerson = e.target.value;
    renderTable();
  });

  document.getElementById("statusFilter").addEventListener("change", (e) => {
    filterStatus = e.target.value;
    renderTable();
  });
}

// =============================================
// ユーティリティ
// =============================================
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// =============================================
// 初期化
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initFirestore();
});
