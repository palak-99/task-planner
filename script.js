const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const toggleThemeBtn = document.getElementById("toggle-theme");

const timerSound = new Audio("https://www.soundjay.com/button/beep-07.wav"); // ✅ You can replace with another sound URL

document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromLocalStorage();
  applySavedTheme();
});

// Add Task
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText !== "") {
    addTask(taskText);
    taskInput.value = "";
  }
});

// Theme Toggle
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

function addTask(text, completed = false) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  if (completed) li.classList.add("completed");

  li.innerHTML = `
    <div class="task-item-top">
      <input type="checkbox" class="task-checkbox" ${completed ? "checked" : ""}>
      <span class="task-text">${text}</span>
      <button class="delete-btn">🗑️</button>
    </div>
    <div class="timer-wrapper">
      <input type="number" class="hours" min="0" max="23" value="0"> :
      <input type="number" class="minutes" min="0" max="59" value="0">
      <button class="start-timer">▶️</button>
      <button class="pause-timer" style="display: none;">⏸️</button>
      <span class="time-left"></span>
    </div>
  `;

  taskList.appendChild(li);

  const deleteBtn = li.querySelector(".delete-btn");
  const checkbox = li.querySelector(".task-checkbox");
  const startBtn = li.querySelector(".start-timer");
  const pauseBtn = li.querySelector(".pause-timer");
  const timeLeftDisplay = li.querySelector(".time-left");

  let timerInterval = null;
  let remainingTime = 0;
  let paused = false;

  // Delete Task
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasksToLocalStorage();
  });

  // Mark Complete
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed");
    saveTasksToLocalStorage();
  });

  // Start Timer
  startBtn.addEventListener("click", () => {
    if (timerInterval) return;

    const hours = parseInt(li.querySelector(".hours").value) || 0;
    const minutes = parseInt(li.querySelector(".minutes").value) || 0;
    remainingTime = (hours * 60 + minutes) * 60;

    if (remainingTime <= 0) return;

    startBtn.style.display = "none";
    pauseBtn.style.display = "inline";

    timerInterval = setInterval(() => {
      if (!paused) {
        remainingTime--;
        const h = Math.floor(remainingTime / 3600);
        const m = Math.floor((remainingTime % 3600) / 60);
        const s = remainingTime % 60;
        timeLeftDisplay.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        if (remainingTime <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timeLeftDisplay.textContent = "Time's up!";
          timerSound.play();
          startBtn.style.display = "inline";
          pauseBtn.style.display = "none";
        }
      }
    }, 1000);
  });

  // Pause/Resume Timer
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "▶️" : "⏸️";
  });

  saveTasksToLocalStorage();
}

function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll(".task-item").forEach(item => {
    tasks.push({
      text: item.querySelector(".task-text").textContent,
      completed: item.classList.contains("completed")
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => {
    addTask(task.text, task.completed);
  });
}
