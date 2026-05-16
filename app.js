// =============================================
// さいたま支店 案件管理ツール - app.js
// =============================================

const TASKS = [
  "01 商談中",
  "02 デモンストレーション",
  "03 概算見積もり（参考価格書）提出",
  "04 導入環境確認（仮想／NW環境含む）",
  "05 仕入れ見積もり取得",
  "06 最終見積提出",
  "07 受注",
  "08 社内キックオフ",
  "09 稼働（立会等）",
  "10 稼働後フォロー",
];

const STAFF = [
  "奥山 義弘",
  "西尾 仁志",
  "江副 洋介",
  "松浦 寿和",
  "小嶋 直樹",
  "中村 美月",
  "増田 慶太",
  "佐藤 裕二",
  "赤松 稔丈",
  "その他",
];

let allProjects = [];
let searchQuery = "";
let filterPerson = "";

// =============================================
// 遅延判定
// =============================================
function checkDelay(project) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const live = new Date(project.goLiveDate);
  const daysUntilLive = Math.ceil((live - today) / (1000 * 60 * 60 * 24));
  const t = project.currentTask;

  // 完了済み（全工程終了）
  if (t >= TASKS.length) return "completed";

  // 赤：社内キックオフ（08）が稼働180日前で未完
  if (t < 8 && daysUntilLive <= 180) return "delay";

  // 赤：導入環境確認（04）が稼働200日前で未完
  if (t < 4 && daysUntilLive <= 200) return "delay";

  // 黄：商談中（01）のみで稼働200日前
  if (t === 0 && daysUntilLive <= 200) return "warning";

  return "";
}

// =============================================
// カード生成
// =============================================
function createCard(project) {
  const statusClass = checkDelay(project);
  const progress = Math.min(
    Math.round((project.currentTask / TASKS.length) * 100),
    100
  );
  const isCompleted = project.currentTask >= TASKS.length;
  const currentTaskLabel = isCompleted
    ? "✅ 全工程完了"
    : TASKS[project.currentTask];

  const live = new Date(project.goLiveDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilLive = Math.ceil((live - today) / (1000 * 60 * 60 * 24));
  const liveFormatted = project.goLiveDate
    ? live.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "未設定";

  let daysLabel = "";
  if (project.goLiveDate) {
    if (daysUntilLive > 0) daysLabel = `稼働まで ${daysUntilLive} 日`;
    else if (daysUntilLive === 0) daysLabel = "稼働日（本日）";
    else daysLabel = `稼働 ${Math.abs(daysUntilLive)} 日経過`;
  }

  let statusBadge = "";
  if (statusClass === "delay")
    statusBadge = `<span class="badge badge-delay">遅延</span>`;
  else if (statusClass === "warning")
    statusBadge = `<span class="badge badge-warning">注意</span>`;
  else if (statusClass === "completed")
    statusBadge = `<span class="badge badge-completed">完了</span>`;

  // 進捗ドット
  const dots = TASKS.map((_, i) => {
    let cls = "dot";
    if (i < project.currentTask) cls += " dot-done";
    else if (i === project.currentTask && !isCompleted) cls += " dot-current";
    return `<span class="${cls}" title="${TASKS[i]}"></span>`;
  }).join("");

  return `
    <div class="project-card ${statusClass}" data-id="${project.id}">
      <div class="card-header">
        <div class="card-title-row">
          <h3 class="hospital-name">${escapeHtml(project.hospitalName)}</h3>
          <div class="card-badges">${statusBadge}</div>
        </div>
        <div class="card-meta">
          <span class="meta-item">📅 稼働予定：${liveFormatted}</span>
          ${daysLabel ? `<span class="meta-days ${daysUntilLive < 0 ? 'days-past' : ''}">${daysLabel}</span>` : ""}
        </div>
        <div class="card-staff">
          <span class="staff-tag main">M：${escapeHtml(project.mainPerson || "未設定")}</span>
          <span class="staff-tag sub">S：${escapeHtml(project.subPerson || "未設定")}</span>
        </div>
      </div>

      <div class="card-progress">
        <div class="progress-header">
          <span class="current-task-label">${currentTaskLabel}</span>
          <span class="progress-pct">${progress}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>
        <div class="progress-dots">${dots}</div>
      </div>

      ${project.memo ? `<div class="card-memo">📝 ${escapeHtml(project.memo)}</div>` : ""}

      <div class="card-actions">
        ${
          !isCompleted
            ? `<button class="btn btn-next" onclick="advanceTask('${project.id}', ${project.currentTask})">完了 → 次へ</button>`
            : `<button class="btn btn-done" disabled>全工程完了</button>`
        }
        <button class="btn btn-edit" onclick="openEditModal('${project.id}')">編集</button>
        <button class="btn btn-delete" onclick="openDeleteModal('${project.id}')">削除</button>
      </div>
    </div>
  `;
}

// =============================================
// レンダリング
// =============================================
function renderProjects() {
  const container = document.getElementById("projectList");
  const emptyState = document.getElementById("emptyState");

  let filtered = allProjects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchName = p.hospitalName?.toLowerCase().includes(q) ?? false;
    const matchPerson =
      !filterPerson ||
      p.mainPerson === filterPerson ||
      p.subPerson === filterPerson;
    return matchName && matchPerson;
  });

  // 遅延→注意→通常→完了 の優先ソート、次に稼働日昇順
  const priority = { delay: 0, warning: 1, "": 2, completed: 3 };
  filtered.sort((a, b) => {
    const pa = priority[checkDelay(a)];
    const pb = priority[checkDelay(b)];
    if (pa !== pb) return pa - pb;
    return new Date(a.goLiveDate) - new Date(b.goLiveDate);
  });

  document.getElementById("projectCount").textContent = `${filtered.length} 件`;

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "flex";
  } else {
    emptyState.style.display = "none";
    container.innerHTML = filtered.map(createCard).join("");
  }
}

// =============================================
// Firestore リアルタイム同期
// =============================================
function initFirestore() {
  db.collection("projects")
    .orderBy("goLiveDate", "asc")
    .onSnapshot(
      (snapshot) => {
        allProjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        renderProjects();
        updateStats();
      },
      (error) => {
        console.error("Firestore error:", error);
        showToast("データ取得に失敗しました。Firebase設定を確認してください。", "error");
      }
    );
}

// =============================================
// 統計
// =============================================
function updateStats() {
  const total = allProjects.length;
  const delays = allProjects.filter((p) => checkDelay(p) === "delay").length;
  const warnings = allProjects.filter((p) => checkDelay(p) === "warning").length;
  const completed = allProjects.filter((p) => checkDelay(p) === "completed").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statDelay").textContent = delays;
  document.getElementById("statWarning").textContent = warnings;
  document.getElementById("statCompleted").textContent = completed;
}

// =============================================
// 進捗アドバンス
// =============================================
async function advanceTask(id, currentTask) {
  const nextTask = currentTask + 1;
  if (nextTask > TASKS.length) return;

  const label = nextTask >= TASKS.length ? "全工程完了" : TASKS[nextTask];
  const confirmed = confirm(
    `現在のタスクを完了にして次へ進みます。\n次：${label}\n\nよろしいですか？`
  );
  if (!confirmed) return;

  try {
    await db.collection("projects").doc(id).update({ currentTask: nextTask });
    showToast("進捗を更新しました");
  } catch (e) {
    console.error(e);
    showToast("更新に失敗しました", "error");
  }
}

// =============================================
// 案件追加モーダル
// =============================================
function openAddModal() {
  document.getElementById("modalTitle").textContent = "新規案件登録";
  document.getElementById("projectForm").reset();
  document.getElementById("editProjectId").value = "";
  document.getElementById("formCurrentTask").value = 0;
  populateStaffSelects();
  document.getElementById("projectModal").classList.add("open");
}

function openEditModal(id) {
  const project = allProjects.find((p) => p.id === id);
  if (!project) return;

  document.getElementById("modalTitle").textContent = "案件編集";
  document.getElementById("editProjectId").value = id;
  document.getElementById("formHospitalName").value = project.hospitalName || "";
  document.getElementById("formGoLiveDate").value = project.goLiveDate || "";
  document.getElementById("formCurrentTask").value = project.currentTask ?? 0;
  document.getElementById("formMemo").value = project.memo || "";
  populateStaffSelects();
  document.getElementById("formMainPerson").value = project.mainPerson || "";
  document.getElementById("formSubPerson").value = project.subPerson || "";
  document.getElementById("projectModal").classList.add("open");
}

function closeModal() {
  document.getElementById("projectModal").classList.remove("open");
}

function populateStaffSelects() {
  ["formMainPerson", "formSubPerson"].forEach((id) => {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">-- 選択してください --</option>` +
      STAFF.map((s) => `<option value="${s}">${s}</option>`).join("");
  });
}

async function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById("editProjectId").value;
  const data = {
    hospitalName: document.getElementById("formHospitalName").value.trim(),
    goLiveDate: document.getElementById("formGoLiveDate").value,
    mainPerson: document.getElementById("formMainPerson").value,
    subPerson: document.getElementById("formSubPerson").value,
    memo: document.getElementById("formMemo").value.trim(),
    currentTask: parseInt(document.getElementById("formCurrentTask").value) || 0,
  };

  if (!data.hospitalName) {
    showToast("病院名を入力してください", "error");
    return;
  }

  try {
    if (id) {
      await db.collection("projects").doc(id).update(data);
      showToast("案件を更新しました");
    } else {
      data.createdAt = new Date().toISOString();
      await db.collection("projects").add(data);
      showToast("案件を登録しました");
    }
    closeModal();
  } catch (err) {
    console.error(err);
    showToast("保存に失敗しました", "error");
  }
}

// =============================================
// 削除モーダル
// =============================================
let pendingDeleteId = null;

function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById("deletePassword").value = "";
  document.getElementById("deleteError").textContent = "";
  document.getElementById("deleteModal").classList.add("open");
  setTimeout(() => document.getElementById("deletePassword").focus(), 100);
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("open");
  pendingDeleteId = null;
}

async function confirmDelete() {
  const pw = document.getElementById("deletePassword").value;
  if (pw !== "0000") {
    document.getElementById("deleteError").textContent =
      "パスワードが違います";
    return;
  }
  if (!pendingDeleteId) return;

  try {
    await db.collection("projects").doc(pendingDeleteId).delete();
    showToast("案件を削除しました");
    closeDeleteModal();
  } catch (err) {
    console.error(err);
    showToast("削除に失敗しました", "error");
  }
}

// =============================================
// 検索・フィルタ
// =============================================
function initSearch() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProjects();
  });

  const sel = document.getElementById("staffFilter");
  sel.innerHTML =
    `<option value="">全員表示</option>` +
    STAFF.map((s) => `<option value="${s}">${s}</option>`).join("");
  sel.addEventListener("change", (e) => {
    filterPerson = e.target.value;
    renderProjects();
  });
}

// =============================================
// トースト通知
// =============================================
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
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

// =============================================
// 初期化
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initFirestore();

  document.getElementById("projectForm").addEventListener("submit", saveProject);

  // モーダル外クリックで閉じる
  document.getElementById("projectModal").addEventListener("click", (e) => {
    if (e.target.id === "projectModal") closeModal();
  });
  document.getElementById("deleteModal").addEventListener("click", (e) => {
    if (e.target.id === "deleteModal") closeDeleteModal();
  });

  // Enterキーで削除確定
  document.getElementById("deletePassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmDelete();
  });

  // タスクセレクト初期化
  const taskSel = document.getElementById("formCurrentTask");
  taskSel.innerHTML = TASKS.map(
    (t, i) => `<option value="${i}">${t}</option>`
  ).join("") + `<option value="${TASKS.length}">完了（全工程終了）</option>`;
});
