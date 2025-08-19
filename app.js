let tasks = [];

/* ---------- Storage ---------- */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasks() {
  try {
    const raw = localStorage.getItem("tasks");
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) tasks = parsed;
  } catch (e) {
    console.warn("Couldn't parse tasks from storage:", e);
    tasks = [];
  }
}

/* ---------- UI Updates ---------- */
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const bar = document.getElementById("progress");   // <- matches your HTML
  if (bar) bar.style.width = pct + "%";

  const badge = document.getElementById("numbers");  // <- matches your HTML
  if (badge) badge.textContent = `${completed}/${total}`;
}

const updateTaskslist = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="taskItem ${task.completed ? "completed" : ""}">
        <div class="task-left">
          <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} />
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <img src="edit.png" alt="edit" onclick="editTask(${index})" />
          <img src="delete.png" alt="delete" onclick="deleteTask(${index})" />
        </div>
      </div>
    `;

    // checkbox toggle
    li.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      toggleTaskComplete(index);
    });

    taskList.append(li);
  });

  updateProgress();
  saveTasks(); // save after every render/change
};

/* ---------- CRUD ---------- */
const addTask = () => {
  const taskInput = document.getElementById("taskInput"); // <- matches your HTML
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ text, completed: false });
  taskInput.value = "";
  updateTaskslist();
};

function toggleTaskComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  updateTaskslist();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  updateTaskslist();
}

function editTask(index) {
  const taskList = document.getElementById("task-list");
  const taskItem = taskList.children[index];
  const p = taskItem.querySelector("p");
  const oldText = tasks[index].text;

  // input for inline edit
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;
  input.classList.add("edit-input");

  // action buttons
  const icons = taskItem.querySelector(".icons");
  const saveBtn = document.createElement("button");
  saveBtn.innerText = "✔️";
  saveBtn.classList.add("save-btn");

  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "❌";
  cancelBtn.classList.add("cancel-btn");

  p.replaceWith(input);
  icons.appendChild(saveBtn);
  icons.appendChild(cancelBtn);
  input.focus();

  const save = () => {
    const newText = input.value.trim();
    if (newText) tasks[index].text = newText;
    updateTaskslist();
  };
  const cancel = () => updateTaskslist();

  saveBtn.addEventListener("click", save);
  cancelBtn.addEventListener("click", cancel);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  });
}

/* ---------- Events & Init ---------- */
document.getElementById("newTask").addEventListener("click", (e) => {
  e.preventDefault();          // prevent form submit/reload
  addTask();
});

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  updateTaskslist();           // render and update progress/stats
});
