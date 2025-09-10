/*
  This version loads links from localStorage and renders the correct link page.
  It also updates stats in localStorage.
*/

function getLocalLinks() {
  return JSON.parse(localStorage.getItem('moizlinks_links') || '[]');
}
function saveLocalLinks(links) {
  localStorage.setItem('moizlinks_links', JSON.stringify(links));
}

const linkContainer = document.getElementById('link-container');

// Get link ID from URL
const urlParams = new URLSearchParams(window.location.search);
const publicId = urlParams.get('id');

if (!publicId) {
    linkContainer.innerHTML = '<h2 class="text-2xl font-bold text-red-600">Invalid Link</h2>';
} else {
    loadLink(publicId);
}

function updateStats(link, type) {
    // type: "clicks" or "completions"
    const links = getLocalLinks();
    const idx = links.findIndex(l => l.publicId === link.publicId);
    if (idx !== -1) {
        links[idx].stats = links[idx].stats || { clicks: 0, completions: 0 };
        links[idx].stats[type] = (links[idx].stats[type] || 0) + 1;
        saveLocalLinks(links);
    }
}

function loadLink(publicId) {
    const links = getLocalLinks();
    const link = links.find(l => l.publicId === publicId);

    if (!link) {
        linkContainer.innerHTML = '<h2 class="text-2xl font-bold text-red-600">Link not found</h2>';
        return;
    }

    // Update click stats
    updateStats(link, "clicks");

    if (link.type === 'task') {
        renderTaskLink(link);
    } else if (link.type === 'password') {
        renderPasswordLink(link);
    }
}

function renderTaskLink(link) {
    let tasksCompleted = [];
    linkContainer.innerHTML = `
        <h2 class="text-2xl font-bold text-center mb-4">${link.title}</h2>
        <p class="text-center text-gray-400 mb-6">Complete the tasks below to unlock the link.</p>
        <div id="task-list" class="space-y-4">
            ${link.tasks.map((task, index) => `
                <div class="task-item p-4 border rounded-md flex items-center justify-between">
                    <span>${task.name}</span>
                    <button data-url="${task.targetUrl}" data-index="${index}" class="task-btn bg-blue-500 text-white px-4 py-2 rounded-md">Start</button>
                </div>
            `).join('')}
        </div>
        <div class="mt-6">
            <div class="bg-gray-200 rounded-full h-4">
                <div id="progress-bar" class="bg-green-500 h-4 rounded-full" style="width: 0%;"></div>
            </div>
            <p id="progress-text" class="text-center mt-2 text-sm text-gray-400">0 / ${link.tasks.length} tasks completed</p>
        </div>
        <button id="unlock-btn" class="mt-6 w-full bg-indigo-600 text-white py-2 rounded-md opacity-50 cursor-not-allowed" disabled>
            Unlock Link
        </button>
    `;

    const taskBtns = document.querySelectorAll('.task-btn');
    taskBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            const index = parseInt(btn.dataset.index);

            window.open(url, '_blank');

            btn.textContent = 'Waiting...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Completed';
                btn.classList.remove('bg-blue-500');
                btn.classList.add('bg-green-500');
                tasksCompleted.push(index);
                updateProgress(tasksCompleted.length, link.tasks.length, link.redirectUrl, link);
            }, 10000);
        });
    });
}

function updateProgress(completedCount, totalTasks, redirectUrl, link) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const unlockBtn = document.getElementById('unlock-btn');

    const percentage = (completedCount / totalTasks) * 100;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${completedCount} / ${totalTasks} tasks completed`;

    if (completedCount === totalTasks) {
        unlockBtn.disabled = false;
        unlockBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        unlockBtn.addEventListener('click', () => {
            updateStats(link, "completions");
            window.location.href = link.redirectUrl;
        });
    }
}

function renderPasswordLink(link) {
    linkContainer.innerHTML = `
        <h2 class="text-2xl font-bold text-center mb-4">${link.title}</h2>
        ${link.hint ? `<p class="text-center text-gray-400 mb-6">Hint: ${link.hint}</p>` : ''}
        <form id="password-verify-form">
            <input type="password" id="password-input" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter password" required>
            <button type="submit" class="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md">
                Unlock
            </button>
        </form>
        <div id="password-error" class="text-red-500 text-center mt-2 hidden"></div>
    `;

    const passwordForm = document.getElementById('password-verify-form');
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password-input').value;
        const errorDiv = document.getElementById('password-error');
        if (password === link.password) {
            updateStats(link, "completions");
            window.location.href = link.redirectUrl;
        } else {
            errorDiv.textContent = "Incorrect password.";
            errorDiv.classList.remove('hidden');
        }
    });
}
