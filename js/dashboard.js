/*
  Dashboard now uses localStorage for all link data and stats.
*/

function getLocalLinks() {
  return JSON.parse(localStorage.getItem('moizlinks_links') || '[]');
}
function saveLocalLinks(links) {
  localStorage.setItem('moizlinks_links', JSON.stringify(links));
}

// DOM Elements
const splashScreen = document.getElementById('splash-screen');
const dashboardContent = document.getElementById('dashboard-content');
const logoutBtn = document.getElementById('logout-btn');
const linksGrid = document.getElementById('links-grid');
const createLinkBtn = document.getElementById('create-link-btn');

// Splash screen logic
setTimeout(() => {
    splashScreen.classList.add('hidden');
    dashboardContent.classList.remove('hidden');
}, 2000);

if (createLinkBtn) {
    createLinkBtn.addEventListener('click', () => {
        window.location.href = 'createlink.html';
    });
}

// Logout (just redirect)
logoutBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Simulate a user for local mode
const currentUser = { uid: "localuser" };

// On load, fetch and render links
renderDashboard();

function renderDashboard() {
    const links = getLocalLinks().filter(link => link.ownerId === currentUser.uid);

    // Calculate stats
    let totalLinks = links.length;
    let totalClicks = links.reduce((sum, l) => sum + (l.stats?.clicks || 0), 0);
    let totalCompletions = links.reduce((sum, l) => sum + (l.stats?.completions || 0), 0);
    let completionRate = totalClicks > 0 ? ((totalCompletions / totalClicks) * 100).toFixed(1) + '%' : '0%';

    // Update stats overview
    const statsCards = document.querySelectorAll('.bg-gray-800.p-6.rounded-lg.shadow-lg');
    if (statsCards.length === 4) {
        statsCards[0].querySelector('p').textContent = totalLinks;
        statsCards[1].querySelector('p').textContent = totalClicks.toLocaleString();
        statsCards[2].querySelector('p').textContent = totalCompletions.toLocaleString();
        statsCards[3].querySelector('p').textContent = completionRate;
    }

    // Render link cards
    linksGrid.innerHTML = '';
    if (links.length === 0) {
        linksGrid.innerHTML = '<p class="text-center col-span-full text-gray-400">No links created yet. Get started by creating one!</p>';
        return;
    }

    links.forEach(link => {
        const shortLink = `${window.location.origin}/link.html?id=${link.publicId}`;
        const card = `
            <div class="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col hover:shadow-indigo-500/30 transition-shadow duration-300">
                <div class="flex-grow">
                    <h3 class="text-lg font-bold text-white mb-2">${link.title}</h3>
                    <p class="text-sm text-gray-400 mb-4">
                        <span class="capitalize font-semibold ${link.type === 'task' ? 'text-indigo-400' : 'text-purple-400'}">${link.type} Link</span>
                    </p>
                    <div class="relative mb-4">
                        <input type="text" readonly value="${shortLink}" class="w-full p-2 pr-10 border-none rounded-md bg-gray-700 text-gray-300">
                        <button class="copy-btn absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white" title="Copy Link">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-center mb-4">
                        <div>
                            <p class="text-2xl font-bold text-white">${link.stats?.clicks || 0}</p>
                            <p class="text-sm text-gray-400">Clicks</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-white">${link.stats?.completions || 0}</p>
                            <p class="text-sm text-gray-400">Completions</p>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end items-center border-t border-gray-700 pt-4 mt-4 space-x-4">
                    <button class="open-link-btn text-blue-400 hover:text-blue-600" data-link="${shortLink}" title="Open in new tab"><i class="fas fa-external-link-alt"></i></button>
                    <button class="delete-link-btn text-red-400 hover:text-red-600" data-id="${link.publicId}" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        linksGrid.innerHTML += card;
    });

    // Add event listeners for copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.currentTarget.previousElementSibling;
            input.select();
            document.execCommand('copy');
            const icon = e.currentTarget.querySelector('i');
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check');
            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-copy');
            }, 2000);
        });
    });

    // Add event listeners for open-link buttons
    document.querySelectorAll('.open-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = btn.getAttribute('data-link');
            window.open(url, '_blank');
        });
    });

    // Add event listeners for delete-link buttons
    document.querySelectorAll('.delete-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            let links = getLocalLinks();
            links = links.filter(l => l.publicId !== id);
            saveLocalLinks(links);
            renderDashboard();
        });
    });
}

// Listen for storage changes (sync across tabs)
window.addEventListener('storage', (e) => {
    if (e.key === 'moizlinks_links') {
        renderDashboard();
    }
});
