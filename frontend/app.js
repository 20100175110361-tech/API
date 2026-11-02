const API_URL = 'http://localhost:3000/tasks';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const toastContainer = document.getElementById('toast-container');

// Stats Elements
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const progressText = document.getElementById('progress-text');
const progressDetails = document.getElementById('progress-details');
const progressCircle = document.getElementById('progress-circle');

// Search and Filter Elements
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

// Global State
let allTasks = [];
let currentFilter = 'all';
let searchQuery = '';

// Set Current Date in Header
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.backgroundColor = isError ? '#ef4444' : '#1e293b';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Fetch Tasks
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        
        allTasks = await response.json();
        updateDashboard(allTasks);
        applyFiltersAndRender();
    } catch (error) {
        showToast('Could not connect to the backend.', true);
    }
}

// Update Stats and Circular Progress
function updateDashboard(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
    
    // Calculate Percentage
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressText.textContent = `${percentage}%`;
    progressDetails.textContent = `${completed} of ${total} tasks completed`;

    // Update Circular Progress SVG
    // The circumference of the circle is 2 * pi * r (2 * 3.14159 * 36 = ~226)
    const circumference = 226;
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// Apply Search & Filter logic
function applyFiltersAndRender() {
    let filteredTasks = allTasks;

    // 1. Apply Filter
    if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(t => !t.completed);
    }

    // 2. Apply Search
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    renderTasks(filteredTasks);
}

// Render Tasks to HTML
function renderTasks(tasks) {
    taskList.innerHTML = ''; 

    if (tasks.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        // --- Left Side: Checkbox & Text ---
        const taskLeft = document.createElement('div');
        taskLeft.className = 'task-left';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id, !task.completed));

        const textGroup = document.createElement('div');
        textGroup.className = 'task-text-group';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        // Adding a fake date to match UI (Since your DB only returns created_at usually)
        const date = document.createElement('span');
        date.className = 'task-date';
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'});
        date.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${today}`;

        textGroup.appendChild(title);
        textGroup.appendChild(date);
        taskLeft.appendChild(checkbox);
        taskLeft.appendChild(textGroup);
        
        taskLeft.addEventListener('click', (e) => {
            if (e.target !== checkbox) toggleTask(task.id, !task.completed);
        });

        // --- Right Side: Badge & Actions ---
        const taskRight = document.createElement('div');
        taskRight.className = 'task-right';

        const badge = document.createElement('span');
        badge.className = 'status-badge';
        badge.textContent = task.completed ? 'Completed' : 'Pending';

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        // Edit Button (Just UI for now)
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        
        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        taskRight.appendChild(badge);
        taskRight.appendChild(actions);

        // Assemble
        li.appendChild(taskLeft);
        li.appendChild(taskRight);
        taskList.appendChild(li);
    });
}

// Add Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        });

        if (response.status === 201) {
            taskInput.value = '';
            await fetchTasks(); 
            showToast('Task added successfully!');
        } else {
            showToast('Failed to add task', true);
        }
    } catch (error) {
        showToast('Network error.', true);
    }
});

// Toggle Task
async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: completed })
        });

        if (response.ok) {
            await fetchTasks(); 
        }
    } catch (error) {
        showToast('Failed to update task.', true);
    }
}
