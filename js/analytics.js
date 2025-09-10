/*
  Analytics now uses localStorage for all link data and stats.
*/

function getLocalLinks() {
  return JSON.parse(localStorage.getItem('moizlinks_links') || '[]');
}

const logoutBtn = document.getElementById('logout-btn');
if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

let clicksCompletionsChart, linkPerformanceChart;

// Chart.js Global Config
Chart.defaults.color = '#a0aec0';
Chart.defaults.borderColor = '#4a5568';

function fetchDataAndRenderCharts(days = 7) {
    const links = getLocalLinks().filter(link => link.ownerId === "localuser");

    // Filter by date
    const now = Date.now();
    const filteredLinks = links.filter(link => {
        return now - link.createdAt <= days * 24 * 60 * 60 * 1000;
    });

    // --- Clicks vs Completions Chart (Line Chart) ---
    const clicksData = [];
    const completionsData = [];
    const labels = [];
    filteredLinks.forEach(link => {
        labels.push(link.title);
        clicksData.push(link.stats?.clicks || 0);
        completionsData.push(link.stats?.completions || 0);
    });

    const clicksCtx = document.getElementById('clicksCompletionsChart').getContext('2d');
    if (clicksCompletionsChart) clicksCompletionsChart.destroy();
    clicksCompletionsChart = new Chart(clicksCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Clicks',
                data: clicksData,
                borderColor: 'rgba(79, 70, 229, 1)',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                fill: true,
            }, {
                label: 'Completions',
                data: completionsData,
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                fill: true,
            }]
        }
    });

    // --- Link Performance Chart (Doughnut Chart) ---
    const linkPerformanceCtx = document.getElementById('linkPerformanceChart').getContext('2d');
    if (linkPerformanceChart) linkPerformanceChart.destroy();
    linkPerformanceChart = new Chart(linkPerformanceCtx, {
        type: 'doughnut',
        data: {
            labels: filteredLinks.map(l => l.title),
            datasets: [{
                label: 'Completions by Link',
                data: filteredLinks.map(l => l.stats?.completions || 0),
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
            }]
        }
    });
}

// Initial render
fetchDataAndRenderCharts();

// Date filter
document.getElementById('date-filter').addEventListener('change', (e) => {
    fetchDataAndRenderCharts(parseInt(e.target.value));
});

// Listen for storage changes (sync across tabs)
window.addEventListener('storage', (e) => {
    if (e.key === 'moizlinks_links') {
        fetchDataAndRenderCharts(parseInt(document.getElementById('date-filter').value));
    }
});
