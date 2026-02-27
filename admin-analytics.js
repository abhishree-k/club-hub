const API_BASE = 'http://localhost:3000/api/analytics';

async function loadAnalytics() {
  try {
    await Promise.all([
      loadOverviewStats(),
      loadEventParticipation(),
      loadActiveClubs(),
      loadMonthlyEngagement(),
      loadFeedbackAnalytics(),
      loadMemberGrowth()
    ]);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}

async function loadOverviewStats() {
  try {
    const response = await fetch(`${API_BASE}/overview`);
    const data = await response.json();

    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
      statCards[0].querySelector('.stat-info h3').textContent = data.totalMembers;
      statCards[1].querySelector('.stat-info h3').textContent = data.upcomingEvents;
      statCards[2].querySelector('.stat-info h3').textContent = data.newRegistrations;
      statCards[3].querySelector('.stat-info h3').textContent = data.certificatesIssued;
    }
  } catch (error) {
    console.error('Failed to load overview stats:', error);
  }
}

async function loadEventParticipation() {
  try {
    const response = await fetch(`${API_BASE}/event-participation`);
    const data = await response.json();

    const ctx = document.getElementById('eventParticipationChart');
    if (ctx) {
      const existingChart = Chart.getChart(ctx);
      if (existingChart) existingChart.destroy();

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.name.substring(0, 20)),
          datasets: [{
            label: 'Registrations',
            data: data.map(item => item.registrations),
            backgroundColor: 'rgba(253, 121, 168, 0.8)',
            borderColor: 'rgba(253, 121, 168, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: 'white' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            },
            x: {
              ticks: { color: 'white' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to load event participation:', error);
  }
}

async function loadActiveClubs() {
  try {
    const response = await fetch(`${API_BASE}/active-clubs`);
    const data = await response.json();

    const ctx = document.getElementById('activeClubsChart');
    if (ctx) {
      const existingChart = Chart.getChart(ctx);
      if (existingChart) existingChart.destroy();

      const clubNames = data.map(item => item.club.charAt(0).toUpperCase() + item.club.slice(1));
      const memberCounts = data.map(item => parseInt(item.dataValues.memberCount));

      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: clubNames,
          datasets: [{
            data: memberCounts,
            backgroundColor: [
              'rgba(108, 92, 231, 0.8)',
              'rgba(253, 121, 168, 0.8)',
              'rgba(0, 184, 148, 0.8)',
              'rgba(255, 234, 167, 0.8)',
              'rgba(0, 206, 201, 0.8)'
            ],
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: 'white', padding: 20 }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to load active clubs:', error);
  }
}

async function loadMonthlyEngagement() {
  try {
    const response = await fetch(`${API_BASE}/monthly-engagement`);
    const data = await response.json();

    const ctx = document.getElementById('monthlyEngagementChart');
    if (ctx) {
      const existingChart = Chart.getChart(ctx);
      if (existingChart) existingChart.destroy();

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.months,
          datasets: [
            {
              label: 'Registrations',
              data: data.registrations,
              borderColor: 'rgba(108, 92, 231, 1)',
              backgroundColor: 'rgba(108, 92, 231, 0.2)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Events',
              data: data.events,
              borderColor: 'rgba(0, 184, 148, 1)',
              backgroundColor: 'rgba(0, 184, 148, 0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: 'white' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            },
            x: {
              ticks: { color: 'white' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to load monthly engagement:', error);
  }
}

async function loadFeedbackAnalytics() {
  try {
    const response = await fetch(`${API_BASE}/feedback`);
    const data = await response.json();

    console.log('Feedback Analytics:', data);
  } catch (error) {
    console.error('Failed to load feedback analytics:', error);
  }
}

async function loadMemberGrowth() {
  try {
    const response = await fetch(`${API_BASE}/member-growth`);
    const data = await response.json();

    console.log('Member Growth:', data);
  } catch (error) {
    console.error('Failed to load member growth:', error);
  }
}

async function exportData(type) {
  try {
    const response = await fetch(`${API_BASE}/export/${type}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    alert('Failed to export data. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.admin-dashboard')) {
    loadAnalytics();

    setInterval(() => {
      loadAnalytics();
    }, 300000);

    const exportButtons = document.querySelectorAll('.action-btn');
    exportButtons.forEach(btn => {
      if (btn.textContent.includes('Export')) {
        btn.addEventListener('click', () => {
          const type = prompt('Enter data type to export (members, events, feedbacks, clubs):', 'members');
          if (type && ['members', 'events', 'feedbacks', 'clubs'].includes(type)) {
            exportData(type);
          }
        });
      }
    });
  }
});

window.loadAnalytics = loadAnalytics;
