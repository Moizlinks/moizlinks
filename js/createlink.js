/*
  Beautiful, modern link creation page using localStorage.
  Includes username and theme support.
*/

function getLocalLinks() {
  return JSON.parse(localStorage.getItem('moizlinks_links') || '[]');
}
function saveLocalLinks(links) {
  localStorage.setItem('moizlinks_links', JSON.stringify(links));
}
function getUsername() {
  return localStorage.getItem('moizlinks_username') || 'User';
}
function getTheme() {
  return localStorage.getItem('moizlinks_theme') || 'dark';
}
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// DOM Elements
const taskLinkTab = document.getElementById('task-link-tab');
const passwordLinkTab = document.getElementById('password-link-tab');
const taskLinkForm = document.getElementById('task-link-form');
const passwordLinkForm = document.getElementById('password-link-form');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksContainer = document.getElementById('tasks-container');
const logoutBtn = document.getElementById('logout-btn');
const pageHeader = document.getElementById('page-header');
const mainCard = document.getElementById('main-card');

let currentUser = { uid: "localuser" }; // For local mode, fake a user

// Apply theme
if (getTheme() === 'light') {
    document.body.style.backgroundColor = '#f3f4f6';
    if (mainCard) mainCard.classList.add('bg-white', 'text-gray-900');
} else {
    document.body.style.backgroundColor = '#111827';
    if (mainCard) mainCard.classList.remove('bg-white');
}

// Show username in header
if (pageHeader) {
    pageHeader.innerHTML = `<span class="text-2xl font-bold">Create a New Link</span>
        <span class="ml-4 text-indigo-400 font-semibold">Welcome, ${getUsername()}!</span>`;
}

// Logout (just redirect)
logoutBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Tab switching logic
taskLinkTab.addEventListener('click', () => {
    taskLinkForm.classList.remove('hidden');
    passwordLinkForm.classList.add('hidden');
    taskLinkTab.classList.add('bg-indigo-600', 'text-white');
    taskLinkTab.classList.remove('bg-white', 'text-gray-700');
    passwordLinkTab.classList.add('bg-white', 'text-gray-700');
    passwordLinkTab.classList.remove('bg-indigo-600', 'text-white');
});

passwordLinkTab.addEventListener('click', () => {
    passwordLinkForm.classList.remove('hidden');
    taskLinkForm.classList.add('hidden');
    passwordLinkTab.classList.add('bg-indigo-600', 'text-white');
    passwordLinkTab.classList.remove('bg-white', 'text-gray-700');
    taskLinkTab.classList.add('bg-white', 'text-gray-700');
    taskLinkTab.classList.remove('bg-indigo-600', 'text-white');
});

// Handle Task Link Creation
taskLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskLinkForm['task-title'].value;
    const redirectUrl = taskLinkForm['redirect-url'].value;
    const tasks = [];
    
    const taskElements = tasksContainer.querySelectorAll('.flex.items-center');
    taskElements.forEach(taskEl => {
        const taskName = taskEl.querySelector('p').textContent;
        const targetUrl = taskEl.querySelector('input').value;
        tasks.push({ name: taskName, targetUrl });
    });

    if (tasks.length === 0) {
        alert('Please add at least one task.');
        return;
    }

    // Save to localStorage
    const links = getLocalLinks();
    links.push({
        id: generateId(),
        ownerId: currentUser.uid,
        type: 'task',
        title,
        redirectUrl,
        tasks,
        stats: { clicks: 0, completions: 0 },
        createdAt: Date.now(),
        publicId: generateId()
    });
    saveLocalLinks(links);

    alert('Link created successfully!');
    window.location.href = 'dashboard.html';
});

// Handle Password Link Creation
passwordLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = passwordLinkForm['password-title'].value;
    const redirectUrl = passwordLinkForm['password-redirect-url'].value;
    const password = passwordLinkForm['password'].value;
    const hint = passwordLinkForm['password-hint'].value;

    // Save to localStorage
    const links = getLocalLinks();
    links.push({
        id: generateId(),
        ownerId: currentUser.uid,
        type: 'password',
        title,
        redirectUrl,
        password, // Not secure, but for local mode only
        hint,
        stats: { clicks: 0, completions: 0 },
        createdAt: Date.now(),
        publicId: generateId()
    });
    saveLocalLinks(links);

    alert('Link created successfully!');
    window.location.href = 'dashboard.html';
});

const addTaskModal = document.getElementById('add-task-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const builtInTasksContainer = document.getElementById('built-in-tasks');
const addCustomTaskBtn = document.getElementById('add-custom-task-btn');

const builtInTasks = [
    { name: 'Visit Page', icon: 'fa-solid fa-link' },
    { name: 'Follow on Twitter', icon: 'fa-brands fa-twitter' },
    { name: 'Join Telegram', icon: 'fa-brands fa-telegram' },
    { name: 'Follow on Instagram', icon: 'fa-brands fa-instagram' },
    { name: 'Like on Facebook', icon: 'fa-brands fa-facebook' },
    { name: 'Join Discord', icon: 'fa-brands fa-discord' },
    { name: 'Subscribe on YouTube', icon: 'fa-brands fa-youtube' },
    // Add more tasks here
];

function renderBuiltInTasks() {
    builtInTasksContainer.innerHTML = builtInTasks.map(task => `
        <div class="built-in-task-item text-center p-2 border rounded-md cursor-pointer hover:bg-gray-100" data-name="${task.name}" data-icon='${task.icon}'>
            <i class="${task.icon} fa-2x mx-auto mb-2"></i>
            <p class="text-sm">${task.name}</p>
        </div>
    `).join('');

    document.querySelectorAll('.built-in-task-item').forEach(item => {
        item.addEventListener('click', () => {
            const name = item.dataset.name;
            const icon = item.dataset.icon;
            addTaskToForm(name, icon);
            closeModal();
        });
    });
}

function addTaskToForm(name, icon, isCustom = false) {
    const taskElement = document.createElement('div');
    taskElement.className = 'flex items-center space-x-4 bg-gray-700 rounded-lg p-3 mb-2 shadow hover:shadow-indigo-500/30 transition-shadow duration-300';
    
    let iconHtml;
    if (isCustom && icon) {
        iconHtml = `<img class="h-8 w-8" src="${icon}" alt="${name}">`;
    } else {
        iconHtml = `<i class="${icon || 'fa-solid fa-link'} fa-2x"></i>`;
    }

    taskElement.innerHTML = `
        <div class="flex-shrink-0 w-8 text-center">
            ${iconHtml}
        </div>
        <div class="flex-1">
            <p class="font-medium">${name}</p>
            <input type="url" placeholder="Enter Target URL" required class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-800 text-white">
        </div>
        <button type="button" class="remove-task-btn text-red-500 hover:text-red-700 ml-2"><i class="fas fa-trash"></i></button>
    `;
    tasksContainer.appendChild(taskElement);

    taskElement.querySelector('.remove-task-btn').addEventListener('click', () => {
        taskElement.remove();
    });
}

function openModal() {
    addTaskModal.classList.remove('hidden');
    renderBuiltInTasks();
}

function closeModal() {
    addTaskModal.classList.add('hidden');
}

addTaskBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

addCustomTaskBtn.addEventListener('click', () => {
    const name = document.getElementById('custom-task-name').value;
    const url = document.getElementById('custom-task-url').value;
    const icon = document.getElementById('custom-task-icon').value;

    if (!name || !url) {
        alert('Please provide a name and URL for the custom task.');
        return;
    }

    addTaskToForm(name, icon, true);
    closeModal();
});

// Add remove functionality to the default task
const defaultTask = document.getElementById('default-task');
if (defaultTask) {
    defaultTask.querySelector('.remove-task-btn').addEventListener('click', () => {
        defaultTask.remove();
    });
}
