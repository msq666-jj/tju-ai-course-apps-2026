const STORAGE_KEY = "tju-action-os-v1";

const seedTasks = [
  {
    id: "task-01",
    title: "微积分 I 第 10 周错题复盘",
    type: "课程作业",
    goal: "课程成绩",
    priority: "高",
    due: "2026-11-13",
    status: "进行中",
    next: "先整理 8 道极限与连续错题，再重做一遍",
    estimate: 50,
    aiSuggestion: "",
    aiConfirmed: false
  },
  {
    id: "task-02",
    title: "无机化学实验报告 2A",
    type: "课程作业",
    goal: "课程成绩",
    priority: "高",
    due: "2026-11-14",
    status: "待开始",
    next: "补齐实验现象记录，完成数据处理",
    estimate: 70,
    aiSuggestion: "",
    aiConfirmed: false
  },
  {
    id: "task-03",
    title: "线上作业 4：数据应用 V1.0",
    type: "课程作业",
    goal: "课程成绩",
    priority: "高",
    due: "2026-11-16",
    status: "进行中",
    next: "完成行动表、行动看板和时间线三个视图",
    estimate: 90,
    aiSuggestion: "",
    aiConfirmed: false
  },
  {
    id: "task-04",
    title: "线上作业 5：WorkBuddy V1.0",
    type: "课程作业",
    goal: "课程成绩",
    priority: "中",
    due: "2026-11-17",
    status: "待开始",
    next: "完成洪澜搭子任务卡与真实测试记录",
    estimate: 80,
    aiSuggestion: "",
    aiConfirmed: false
  },
  {
    id: "task-05",
    title: "英语四级听力精听 30 分钟",
    type: "英语提升",
    goal: "英语四级",
    priority: "中",
    due: "2026-11-13",
    status: "待开始",
    next: "精听 1 段真题，整理 5 个没听出的短语",
    estimate: 30,
    aiSuggestion: "",
    aiConfirmed: false
  },
  {
    id: "task-06",
    title: "查保研与选调的关键条件",
    type: "成长机会",
    goal: "保研准备",
    priority: "中",
    due: "2026-11-20",
    status: "待开始",
    next: "找到学院最新推免细则，标出成绩与加分条件",
    estimate: 45,
    aiSuggestion: "",
    aiConfirmed: false
  },
  {
    id: "task-07",
    title: "篮球体能与上肢稳定训练",
    type: "体能训练",
    goal: "长期体能",
    priority: "低",
    due: "2026-11-12",
    status: "已完成",
    next: "完成 20 分钟热身和稳定训练",
    estimate: 40,
    aiSuggestion: "",
    aiConfirmed: true
  },
  {
    id: "task-08",
    title: "普通话考试报名信息核对",
    type: "生活事务",
    goal: "普通话考试",
    priority: "中",
    due: "2026-11-18",
    status: "待检查",
    next: "确认报名时间、照片要求和考试地点",
    estimate: 20,
    aiSuggestion: "",
    aiConfirmed: false
  }
];

let tasks = loadTasks();
let activeView = "table";
let toastTimer;

const elements = {
  tableBody: document.querySelector("#taskTableBody"),
  board: document.querySelector("#taskBoard"),
  timeline: document.querySelector("#taskTimeline"),
  tableView: document.querySelector("#tableView"),
  boardView: document.querySelector("#boardView"),
  timelineView: document.querySelector("#timelineView"),
  search: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  visibleCount: document.querySelector("#visibleCount"),
  activeCount: document.querySelector("#activeCount"),
  soonCount: document.querySelector("#soonCount"),
  doneCount: document.querySelector("#doneCount"),
  confirmCount: document.querySelector("#confirmCount"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  dialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  toast: document.querySelector("#toast")
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(seedTasks);
  } catch {
    return structuredClone(seedTasks);
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    showToast("浏览器无法保存数据，本次修改只在当前页面有效");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysUntil(value) {
  return Math.round((parseDate(value) - todayStart()) / 86400000);
}

function formatDate(value) {
  const date = parseDate(value);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatWeekday(value) {
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(parseDate(value));
}

function statusClass(status) {
  if (status === "进行中") return "in-progress";
  if (status === "待检查") return "waiting";
  if (status === "已完成") return "done";
  return "";
}

function getFilteredTasks() {
  const query = elements.search.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  return tasks
    .filter((task) => type === "all" || task.type === type)
    .filter((task) => {
      if (!query) return true;
      return [task.title, task.type, task.goal, task.next, task.status, task.priority]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      const doneDelta = Number(a.status === "已完成") - Number(b.status === "已完成");
      return doneDelta || parseDate(a.due) - parseDate(b.due);
    });
}

function renderTable(items) {
  if (!items.length) {
    elements.tableBody.innerHTML = '<tr><td colspan="8" class="board-empty">没有匹配的行动</td></tr>';
    return;
  }

  elements.tableBody.innerHTML = items
    .map((task) => {
      const days = daysUntil(task.due);
      const dueTone = days < 0 ? "due-risk" : days <= 2 ? "due-risk" : "";
      return `
        <tr class="${task.status === "已完成" ? "is-done" : ""}" data-id="${escapeHtml(task.id)}">
          <td>
            <span class="task-title">${escapeHtml(task.title)}</span>
            <span class="task-note">预计 ${Number(task.estimate)} 分钟</span>
          </td>
          <td>
            <span class="stack">
              <span class="small-tag">${escapeHtml(task.type)}</span>
              <span class="task-note">${escapeHtml(task.goal)}</span>
            </span>
          </td>
          <td><span class="priority ${task.priority === "高" ? "high" : task.priority === "中" ? "medium" : "low"}">${escapeHtml(task.priority)}</span></td>
          <td>
            <span class="${dueTone}">${formatDate(task.due)} · ${formatWeekday(task.due)}</span>
            <span class="task-note">${days < 0 ? `已逾期 ${Math.abs(days)} 天` : days === 0 ? "今天截止" : `剩余 ${days} 天`}</span>
          </td>
          <td><span class="status-pill ${statusClass(task.status)}">${escapeHtml(task.status)}</span></td>
          <td><span class="next-action">${escapeHtml(task.next)}</span></td>
          <td class="ai-cell">
            ${
              task.aiSuggestion
                ? `<p class="ai-copy ${task.aiConfirmed ? "ai-confirmed" : "ai-unconfirmed"}">${escapeHtml(task.aiSuggestion)}</p>
                   <button class="tiny-button" type="button" data-action="confirm-ai">${task.aiConfirmed ? "已确认" : "人工确认"}</button>`
                : '<span class="task-note">尚未运行 AI 初筛</span>'
            }
          </td>
          <td>
            <div class="row-actions">
              ${task.status !== "已完成" ? '<button class="tiny-button" type="button" data-action="advance" title="推进到下一状态">推进</button>' : ""}
              <button class="tiny-button" type="button" data-action="delete" title="删除这条行动">删除</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderBoard(items) {
  const states = ["待开始", "进行中", "待检查", "已完成"];
  elements.board.innerHTML = states
    .map((state) => {
      const stateTasks = items.filter((task) => task.status === state);
      return `
        <section class="board-column">
          <header><strong>${state}</strong><span>${stateTasks.length}</span></header>
          <div class="board-list">
            ${
              stateTasks.length
                ? stateTasks
                    .map(
                      (task) => `
                        <article class="board-card" data-priority="${escapeHtml(task.priority)}" data-id="${escapeHtml(task.id)}">
                          <span class="small-tag">${escapeHtml(task.type)}</span>
                          <h3>${escapeHtml(task.title)}</h3>
                          <p>${escapeHtml(task.next)}</p>
                          <footer>
                            <span class="priority ${task.priority === "高" ? "high" : task.priority === "中" ? "medium" : "low"}">${escapeHtml(task.priority)}</span>
                            <span>${formatDate(task.due)}</span>
                            ${task.status !== "已完成" ? '<button class="tiny-button" type="button" data-action="advance">推进</button>' : ""}
                          </footer>
                        </article>
                      `
                    )
                    .join("")
                : '<p class="board-empty">暂无行动</p>'
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderTimeline(items) {
  if (!items.length) {
    elements.timeline.innerHTML = '<p class="board-empty">没有匹配的行动</p>';
    return;
  }

  elements.timeline.innerHTML = [...items]
    .sort((a, b) => parseDate(a.due) - parseDate(b.due))
    .map((task) => {
      const date = parseDate(task.due);
      return `
        <article class="timeline-row" data-id="${escapeHtml(task.id)}">
          <div class="timeline-date"><b>${String(date.getDate()).padStart(2, "0")}</b>${date.getMonth() + 1}月 · ${formatWeekday(task.due)}</div>
          <div class="timeline-copy">
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.next)}</p>
          </div>
          <span class="status-pill ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
        </article>
      `;
    })
    .join("");
}

function updateStats() {
  const open = tasks.filter((task) => task.status !== "已完成");
  const soon = open.filter((task) => {
    const days = daysUntil(task.due);
    return days >= 0 && days <= 3;
  });
  const done = tasks.filter((task) => task.status === "已完成");
  const confirm = tasks.filter((task) => task.aiSuggestion && !task.aiConfirmed);
  const progress = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  elements.activeCount.textContent = open.length;
  elements.soonCount.textContent = soon.length;
  elements.doneCount.textContent = done.length;
  elements.confirmCount.textContent = confirm.length;
  elements.progressText.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
}

function render() {
  const items = getFilteredTasks();
  renderTable(items);
  renderBoard(items);
  renderTimeline(items);
  elements.visibleCount.textContent = `显示 ${items.length} 条`;
  updateStats();
}

function setView(view) {
  activeView = view;
  const panels = {
    table: elements.tableView,
    board: elements.boardView,
    timeline: elements.timelineView
  };
  Object.entries(panels).forEach(([name, panel]) => {
    panel.hidden = name !== view;
  });
  document.querySelectorAll(".view-tab").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

function advanceTask(id) {
  const task = findTask(id);
  if (!task) return;
  const states = ["待开始", "进行中", "待检查", "已完成"];
  task.status = states[(states.indexOf(task.status) + 1) % states.length];
  saveTasks();
  render();
  showToast(`已推进到“${task.status}”`);
}

function suggestFor(task) {
  const days = daysUntil(task.due);
  const missing = [];
  if (!task.next || task.next.length < 8) missing.push("下一步行动不够具体");
  if (!task.estimate || Number(task.estimate) < 10) missing.push("预计用时缺失");

  if (task.status === "已完成") return "已完成。建议补一句复盘：这次为什么按时完成？";
  if (days < 0) return `已逾期 ${Math.abs(days)} 天。先决定今天是否继续，再补新的截止日期。`;
  if (days === 0) return "今天截止。建议先完成最小交付版本，并在提交前留 10 分钟检查。";
  if (days <= 2) return `距截止 ${days} 天，建议提升到高优先级，今天完成第一段。`;
  if (task.goal.includes("英语四级")) return "建议绑定一次 25 分钟专项练习，并把结果记录到下一次复盘。";
  if (task.goal.includes("保研")) return "建议只查官方来源，提炼 3 个硬条件，暂不扩展成泛泛的生涯讨论。";
  if (missing.length) return `信息待补：${missing.join("、")}。确认后再排期。`;
  return "当前信息足够。建议按“下一步行动”完成一个 20 分钟启动块，再决定是否继续。";
}

function runAiScreening() {
  const visible = getFilteredTasks();
  if (!visible.length) {
    showToast("当前筛选结果为空");
    return;
  }
  visible.forEach((task) => {
    task.aiSuggestion = suggestFor(task);
    task.aiConfirmed = false;
  });
  saveTasks();
  render();
  showToast(`已生成 ${visible.length} 条建议，请逐条人工确认`);
}

elements.search.addEventListener("input", render);
elements.typeFilter.addEventListener("change", render);
document.querySelectorAll(".view-tab").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#runAi").addEventListener("click", runAiScreening);
document.querySelector("#openTaskDialog").addEventListener("click", () => elements.dialog.showModal());
document.querySelector("#closeDialog").addEventListener("click", () => elements.dialog.close());
document.querySelector("#cancelDialog").addEventListener("click", () => elements.dialog.close());

elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(elements.taskForm);
  const task = {
    id: `task-${Date.now()}`,
    title: String(form.get("title")).trim(),
    type: String(form.get("type")),
    goal: String(form.get("goal")).trim(),
    priority: String(form.get("priority")),
    due: String(form.get("due")),
    status: String(form.get("status")),
    next: String(form.get("next")).trim(),
    estimate: Number(form.get("estimate")),
    aiSuggestion: "",
    aiConfirmed: false
  };
  tasks.push(task);
  saveTasks();
  elements.taskForm.reset();
  elements.dialog.close();
  render();
  showToast("行动已加入系统");
});

document.querySelector("#resetData").addEventListener("click", () => {
  tasks = structuredClone(seedTasks);
  saveTasks();
  elements.search.value = "";
  elements.typeFilter.value = "all";
  render();
  showToast("已恢复示例数据");
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const record = button.closest("[data-id]");
  const task = record ? findTask(record.dataset.id) : null;
  if (!task) return;

  if (button.dataset.action === "advance") advanceTask(task.id);
  if (button.dataset.action === "delete") {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
    showToast("行动已删除");
  }
  if (button.dataset.action === "confirm-ai") {
    task.aiConfirmed = true;
    saveTasks();
    render();
    showToast("AI 建议已通过人工确认");
  }
});

render();
setView(activeView);
