console.log("JS LOADED");
console.log("MENU:", document.getElementById("settingsMenu"));
let use24Hour = true;

// journal opening and content loading
document.addEventListener("DOMContentLoaded", () => {
    applySettings();
    const closeBtn = document.getElementById("closeBtn");
    const menuBtn = document.getElementById("menuBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cover = document.getElementById("journalCover");
    const coverScreen = document.getElementById("coverScreen");
    const journalScreen = document.getElementById("journalScreen");

    const menu = document.getElementById("settingsMenu");
    console.log("MENU:", menu);

    cover.addEventListener("click", () => {
        coverScreen.classList.add("hidden");
        journalScreen.classList.remove("hidden");

        document.getElementById("frontContent").innerHTML = pages.todo;
        renderTodayTasks();
        bindTodayEvents();
    });

    if (closeBtn) {
        closeBtn.onclick = () => {
            journalScreen.classList.add("hidden");
            coverScreen.classList.remove("hidden");
        };
    }

    if (saveBtn) {
        saveBtn.onclick = () => {
            saveTasks();
            saveTodayTasks();
            alert("Day Saved!");
            applySettings();
        };
    }

    if (menuBtn && menu) {
        menuBtn.onclick = () => {
            menu.classList.toggle("show");
        };
    } else {
        console.error("Menu button or menu not found");
    }

    const textSizeSelect = document.getElementById("textSize");
    const timeFormatSelect = document.getElementById("timeFormat");

    textSizeSelect.onchange = (e) => {
        localStorage.setItem("textSize", e.target.value);
        applySettings();
    };

    timeFormatSelect.onchange = (e) => {
        localStorage.setItem("timeFormat", e.target.value);
        applySettings();
    };

    // calendar function
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September","October", "November", "December"];

    const displayWeekDay = document.getElementById("day");
    const displayDayNum = document.getElementById("number");
    const displayMonth = document.getElementById("month");

    const day = new Date();
    let todayName = day.getDay();
    let todayNumber = day.getDate();
    let todayMonth = day.getMonth();

    displayWeekDay.innerHTML = weekday[todayName];
    displayDayNum.innerHTML = todayNumber;
    displayMonth.innerHTML = month[todayMonth];

// clock function
setInterval(showTime, 1000);
function showTime() {
    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();

    if (!use24Hour) {
        hour = hour % 12 || 12;
    }

    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;

    let currentTime = hour + ":" + min;
    document.getElementById("clock").innerHTML = currentTime;
}

showTime();
}); 

// settings choices and change
function applySettings() {
    const textSize = localStorage.getItem("textSize") || "12px";
    const timeFormat = localStorage.getItem("timeFormat") || "24";
    const language = localStorage.getItem("language") || "en";
    document.body.style.fontSize = textSize;
    use24Hour = timeFormat === "24";
    console.log("Language:", language);
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let todayTasks = JSON.parse(localStorage.getItem("todayTasks")) || [];


// page content
const pages = {
    todo:`
    <h2>Today's tasks:</h2>
    <input id="todayInput" placeholder="Add tasks...">
    <button id="addTodayBtn">Add</button>
    <ul id="todayList"></ul>`,
    due:`
    <h2>Assignments</h2>
    <input id="taskInput" placeholder="Assignment">
    <input type="date" id="taskDate">
    <button id="addTaskBtn">Add</button>
    <button onclick="clearCompleted()">Clear Completed</button>
    <button onclick="sortByDate()">Sort</button>
    <ul id="taskList"></ul>`,
    ideas:`
    <h2>Ideas</h2>
    <textarea placeholder="Write ideas..."></textarea>`
};

// page flip animation and tab sections
function switchTab(tab, element) {
    const page = document.getElementById("flipPage");
    const front = document.getElementById("frontContent");
    const back = document.getElementById("backContent");
    back.innerHTML = pages[tab];
    page.classList.add("flipping");

    setTimeout(() => {
        front.innerHTML = pages[tab];
        if (tab === "todo") {
            renderTodayTasks();
            bindTodayEvents();
        }

        if (tab === "due") {
            renderTasks();
            bindTaskEvents();
        }

        if (tab === "ideas") {

        }
        page.classList.remove("flipping");
    }, 600);

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    element.classList.add("active");
}

// task binding
function bindTodayEvents() {
    const btn = document.getElementById("addTodayBtn");
    if (btn) btn.onclick = addTodayTask;
}

function bindTaskEvents() {
    const btn = document.getElementById("addTaskBtn");
    if (btn) btn.onclick = addTask;
}

// tasks input, changes and saving
function addTask() {
    const text = document.getElementById("taskInput").value;
    const date = document.getElementById("taskDate").value;
    if (!text) return;
    tasks.push({ text, date, completed: false });
    saveTasks();
    renderTasks();
}

function addTodayTask() {
    const input = document.getElementById("todayInput");
    if (!input || !input.value.trim()) return;

    todayTasks.push({
        text: input.value.trim(), completed: false
    });

    input.value = "";
    saveTodayTasks();
    renderTodayTasks();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveTodayTasks() {
    localStorage.setItem("todayTasks", JSON.stringify(todayTasks));
}

// assignment task rendering
function renderTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;
    list.innerHTML = "";
    tasks.forEach((task, i) => {
        const li = document.createElement("li");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = task.completed;

        cb.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateProgress();
        };

        const text = document.createElement("span");
        text.textContent = `${task.text} (${task.date || "no date"})`;
        if (task.completed) {
            text.style.textDecoration = "line-through";
            text.style.opacity = "0.6";
        }

        const editBtn = document.createElement("button");
        editBtn.textContent = "✎";
        editBtn.onclick = () => {
            const newText = prompt("Edit task:", task.text);
            if (newText !== null) {
                task.text = newText;
                saveTasks();
                renderTasks();
            }
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent ="🗑";
        deleteBtn.onclick = () => {
            tasks.splice(i, 1);
            saveTasks();
            renderTasks();
            updateProgress();
        };

        const wrapper = document.createElement("div");
        wrapper.className = "task-row";
        wrapper.appendChild(cb);
        wrapper.appendChild(text);

        li.appendChild(wrapper);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        list.appendChild(li);
    });

    updateProgress();
}

// daily task rendering 
function renderTodayTasks() {
    const list = document.getElementById("todayList");
    if (!list) return;
    list.innerHTML = "";
    todayTasks.forEach((task, i) => {
        const li = document.createElement("li");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = task.completed;

        cb.onclick = () => {
            task.completed = !task.completed;
            saveTodayTasks();
            renderTodayTasks();
        };

        const text = document.createElement("span");
        text.textContent = task.text;

        if (task.completed) {
            text.style.textDecoration = "line-through";
        }

        const del = document.createElement("button");
        del.textContent = "🗑";
        del.onclick = () => {
            todayTasks.splice(i, 1);
            saveTodayTasks();
            renderTodayTasks();
        };

        const wrapper = document.createElement("div");
        wrapper.className = "task-row";
        wrapper.appendChild(cb);
        wrapper.appendChild(text);

        li.appendChild(wrapper);
        li.appendChild(del);
        list.appendChild(li);
    });
}

// clear task function
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateProgress();
}

// sort task function
function sortByDate() {
    tasks.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    saveTasks();
    renderTasks();
}

// due date function
function renderDue() {
    const list = document.getElementById("dueList");
    if (!list) return;
    list.innerHTML = "";
    const today = new Date();
    tasks.forEach(task => {
        if (!task.date) return;
        const diff = (new Date(task.date) - today)/ (1000*60*60*24);
        if (diff <= 3) {
            const li = document.createElement("li");
            li.textContent = task.text;
            list.appendChild(li);
        }
    });
}

// progress bar update
function updateProgress() {
    const bar = document.getElementById("progress");
    const text = document.getElementById("progressText");
    if (!bar || !text) return;
    const done = tasks.filter(t => t.completed).length;
    const percent = tasks.length ? (done / tasks.length) * 100 : 0;
    bar.style.width = percent + "%";
    text.textContent = Math.round(percent) + "% completed";
}

window.switchTab = switchTab;