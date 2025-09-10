/*
  Settings page logic for username, theme, clear links, and logout.
*/

// Username
const usernameInput = document.getElementById('username-input');
const saveUsernameBtn = document.getElementById('save-username-btn');
const usernameSuccess = document.getElementById('username-success');

// Theme
const themeDarkBtn = document.getElementById('theme-dark-btn');
const themeLightBtn = document.getElementById('theme-light-btn');

// Clear All Links
const clearLinksBtn = document.getElementById('clear-links-btn');
const clearSuccess = document.getElementById('clear-success');

// Logout
const logoutBtn = document.getElementById('logout-btn');

// Username logic
function getUsername() {
    return localStorage.getItem('moizlinks_username') || 'User';
}
function setUsername(name) {
    localStorage.setItem('moizlinks_username', name);
}
usernameInput.value = getUsername();
saveUsernameBtn.addEventListener('click', () => {
    setUsername(usernameInput.value.trim() || 'User');
    usernameSuccess.classList.remove('hidden');
    setTimeout(() => usernameSuccess.classList.add('hidden'), 2000);
});

// Theme logic
function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.body.style.backgroundColor = '#f3f4f6';
        localStorage.setItem('moizlinks_theme', 'light');
    } else {
        document.documentElement.classList.remove('light');
        document.body.style.backgroundColor = '#111827';
        localStorage.setItem('moizlinks_theme', 'dark');
    }
    // Force reload to apply theme everywhere
    setTimeout(() => window.location.reload(), 200);
}
themeDarkBtn.addEventListener('click', () => setTheme('dark'));
themeLightBtn.addEventListener('click', () => setTheme('light'));

// On load, apply theme
if (localStorage.getItem('moizlinks_theme') === 'light') {
    document.documentElement.classList.add('light');
    document.body.style.backgroundColor = '#f3f4f6';
} else {
    document.documentElement.classList.remove('light');
    document.body.style.backgroundColor = '#111827';
}

// Clear all links
clearLinksBtn.addEventListener('click', () => {
    localStorage.removeItem('moizlinks_links');
    clearSuccess.classList.remove('hidden');
    setTimeout(() => clearSuccess.classList.add('hidden'), 2000);
});

// Logout
logoutBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});
