// The base URL of your Express Backend
const API_URL = 'http://localhost:3000/tasks';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// 1. Function to fetch tasks from the server (GET)
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error(error);
        alert('Could not connect to the backend. Is your server running?');
    }
}

// 2. Function to render tasks to the HTML
function renderTasks(tasks) {
    taskList.innerHTML = ''; // Clear current list

    if (tasks.length === 0) {
        taskList.innerHTML = '<li>No tasks found. Add one above!</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        // The Checkbox and Title
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        // When checkbox is clicked, trigger PATCH request
        checkbox.addEventListener('change', () => toggleTask(task.id, !task.completed));

        const span = document.createElement('span');
        span.textContent = task.title;

        taskContent.appendChild(checkbox);
        taskContent.appendChild(span);

        // The Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        // When delete is clicked, trigger DELETE request
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Assemble the list item
        li.appendChild(taskContent);
        li.appendChild(deleteBtn);
        
        taskList.appendChild(li);
    });
}

// 3. Function to add a new task (POST)
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const title = taskInput.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title })
        });

        if (response.status === 201) {
            taskInput.value = ''; // Clear input
            fetchTasks(); // Reload list
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error(error);
    }
});

// 4. Function to toggle completion status (PATCH)
async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: completed })
        });

        if (response.ok) {
            fetchTasks(); // Reload list to show changes
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// 5. Function to delete a task (DELETE)
async function deleteTask(id) {
    // Ask for confirmation before deleting
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            fetchTasks(); // Reload list
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Initialize: Fetch tasks when the page loads
document.addEventListener('DOMContentLoaded', fetchTasks);