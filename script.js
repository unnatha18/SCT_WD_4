
const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDate = document.getElementById("task-date");
const taskTime = document.getElementById("task-time");
const addButton = document.getElementById("add-btn");
const cancelButton = document.getElementById("cancel-btn");

const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");

let tasks = [];
let currentFilter = "all";
let editingId = null;

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("skillcraft-todo-tasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

function saveTasks() {
    try {
        localStorage.setItem(
            "skillcraft-todo-tasks",
            JSON.stringify(tasks)
        );
    } catch (error) {
        alert("Your tasks could not be saved in this browser.");
    }
}

function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

function renderTasks() {
    taskList.innerHTML = "";

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    totalCount.textContent = `Total: ${tasks.length}`;

    pendingCount.textContent =
        `Pending: ${tasks.filter(task => !task.completed).length}`;

    completedCount.textContent =
        `Completed: ${tasks.filter(task => task.completed).length}`;

    emptyMessage.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent = "No tasks in this category.";
    }

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.title} as completed`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        content.appendChild(title);

        if (task.date || task.time) {
            const due = document.createElement("div");
            due.className = "task-due";

            const parts = [];

            if (task.date) parts.push(task.date);
            if (task.time) parts.push(task.time);

            due.textContent = "Due: " + parts.join(" at ");
            content.appendChild(due);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            taskInput.value = task.title;
            taskDate.value = task.date || "";
            taskTime.value = task.time || "";

            editingId = task.id;
            addButton.textContent = "Save Changes";
            cancelButton.hidden = false;

            taskInput.focus();
            form.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            if (editingId === task.id) {
                resetForm();
            }

            tasks = tasks.filter(item => item.id !== task.id);

            saveTasks();
            renderTasks();
        });

        actions.append(editButton, deleteButton);
        item.append(checkbox, content, actions);
        taskList.appendChild(item);
    });
}

function resetForm() {
    form.reset();
    editingId = null;
    addButton.textContent = "+ Add Task";
    cancelButton.hidden = true;
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        taskInput.focus();
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(item => item.id === editingId);

        if (task) {
            task.title = title;
            task.date = taskDate.value;
            task.time = taskTime.value;
        }
    } else {
        tasks.unshift({
            id: createId(),
            title: title,
            date: taskDate.value,
            time: taskTime.value,
            completed: false
        });
    }

    saveTasks();
    resetForm();
    renderTasks();
});

cancelButton.addEventListener("click", resetForm);

// All, Pending, and Completed filters
document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(filterButton => {
            filterButton.classList.toggle(
                "active",
                filterButton === button
            );
        });

        renderTasks();
    });
});

// Display saved tasks when the page opens
renderTasks();
