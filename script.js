const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const darkModeToggle = document.getElementById("darkModeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks based on filter and search query
function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  filteredTasks.forEach((task, index) => {
    if (!task.text.toLowerCase().includes(searchTerm)) return;

    const li = document.createElement("li");
    li.textContent = task.text;
    li.classList.add(task.priority);
    if (task.completed) {
      li.classList.add("completed");
    }

    // Editable task on double click
    li.addEventListener("dblclick", () => {
      if (task.completed) return;  // don't edit completed task
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      input.className = "edit-input";
      li.innerHTML = "";
      li.appendChild(input);
      input.focus();

      input.addEventListener("blur", () => {
        if (input.value.trim() !== "") {
          tasks[index].text = input.value.trim();
          saveTasks();
          renderTasks();
        } else {
          alert("Task cannot be empty.");
          renderTasks();
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.blur();
        } else if (e.key === "Escape") {
          renderTasks();
        }
      });
    });

    // Toggle completion on click (except editing input)
    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("removeBtn")) return;
      if (li.querySelector("input.edit-input")) return;
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.className = "removeBtn";

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(removeBtn);
    taskList.appendChild(li);
  });
}

// Add new task
function addTask() {
  const taskText = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (taskText !== "") {
    tasks.push({ text: taskText, completed: false, priority });
    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
  } else {
    alert("Please enter a task.");
  }
}

// Filter buttons behavior
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Search input behavior
searchInput.addEventListener("input", renderTasks);

// Clear completed tasks
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

// Clear all tasks
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.textContent = "Light Mode";
  } else {
    darkModeToggle.textContent = "Dark Mode";
  }
});

// Drag and drop reordering
let dragSrcIndex = null;

taskList.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "LI") {
    dragSrcIndex = Array.from(taskList.children).indexOf(e.target);
    e.dataTransfer.effectAllowed = "move";
  }
});

taskList.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
});

taskList.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.target.tagName === "LI") {
    const dragDstIndex = Array.from(taskList.children).indexOf(e.target);
    if (dragSrcIndex !== dragDstIndex) {
      const dragItem = tasks.splice(dragSrcIndex, 1)[0];
      tasks.splice(dragDstIndex, 0, dragItem);
      saveTasks();
      renderTasks();
    }
  }
});

// Add task on button click or Enter
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// Initial render
renderTasks();
