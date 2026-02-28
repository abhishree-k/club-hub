const API_BASE = 'http://localhost:3000/api/notifications';

let notificationSocket = null;
let unreadCount = 0;

function connectNotifications(userId) {
    try {
        notificationSocket = new WebSocket(`ws://localhost:3000/ws/notifications/${userId}`);

        notificationSocket.onopen = () => {
            console.log('Notification WebSocket connected');
        };

        notificationSocket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            displayNewNotification(notification);
            updateUnreadCount();
        };

        notificationSocket.onclose = () => {
            console.log('Notification WebSocket closed, reconnecting...');
            setTimeout(() => connectNotifications(userId), 3000);
        };

        notificationSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    } catch (error) {
        console.error('Failed to connect to notification WebSocket:', error);
    }
}

function getNotificationIcon(type) {
    const icons = {
        event: 'fas fa-calendar-alt',
        membership: 'fas fa-users',
        discussion: 'fas fa-comments',
        admin: 'fas fa-shield-alt',
        rsvp: 'fas fa-ticket-alt'
    };
    return icons[type] || 'fas fa-bell';
}

function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${!notification.isRead ? 'unread' : ''}`;
    div.dataset.id = notification.id;

    div.innerHTML = `
        <div class="notification-icon ${notification.type}">
            <i class="${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-meta">
                <span>${formatNotificationTime(notification.createdAt)}</span>
                <div class="notification-actions">
                    ${!notification.isRead ? '<button class="mark-read" onclick="markAsRead(' + notification.id + ')">Mark read</button>' : ''}
                    <button onclick="deleteNotification(' + notification.id + ')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;

    return div;
}

async function loadNotifications(userId, unreadOnly = false) {
    try {
        const response = await fetch(`${API_BASE}/user/${userId}${unreadOnly ? '?unread=true' : ''}`);
        const notifications = await response.json();

        const container = document.getElementById('notifications-list');
        const centerBody = document.getElementById('notification-center-body');

        if (container) {
            container.innerHTML = '';
            if (notifications.length === 0) {
                container.innerHTML = '<div class="no-data">No notifications</div>';
            } else {
                notifications.forEach(notification => {
                    container.appendChild(createNotificationElement(notification));
                });
            }
        }

        if (centerBody) {
            centerBody.innerHTML = '';
            if (notifications.length === 0) {
                centerBody.innerHTML = '<div class="no-data">No notifications</div>';
            } else {
                notifications.slice(0, 10).forEach(notification => {
                    centerBody.appendChild(createNotificationElement(notification));
                });
            }
        }

        await updateUnreadCount(userId);
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

async function updateUnreadCount(userId) {
    try {
        const response = await fetch(`${API_BASE}/user/${userId}/unread-count`);
        const data = await response.json();
        unreadCount = data.count;

        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.style.display = 'flex';
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Failed to update unread count:', error);
    }
}

function displayNewNotification(notification) {
    const container = document.getElementById('notifications-list');
    const centerBody = document.getElementById('notification-center-body');

    const element = createNotificationElement(notification);

    if (container) {
        container.insertBefore(element, container.firstChild);
    }

    if (centerBody) {
        centerBody.insertBefore(element, centerBody.firstChild);
    }

    showBrowserNotification(notification.title, notification.message);
}

function showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/assets/icon-192.png'
        });
    }
}

async function markAsRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/${notificationId}/read`, {
            method: 'PATCH'
        });

        if (response.ok) {
            const element = document.querySelector(`[data-id="${notificationId}"]`);
            if (element) {
                element.classList.remove('unread');
                const markReadBtn = element.querySelector('.mark-read');
                if (markReadBtn) markReadBtn.remove();
            }
            await updateUnreadCount();
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

async function markAllAsRead(userId) {
    try {
        const response = await fetch(`${API_BASE}/user/${userId}/read-all`, {
            method: 'PATCH'
        });

        if (response.ok) {
            document.querySelectorAll('.notification-item.unread').forEach(element => {
                element.classList.remove('unread');
                const markReadBtn = element.querySelector('.mark-read');
                if (markReadBtn) markReadBtn.remove();
            });
            await updateUnreadCount(userId);
        }
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
    }
}

async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/${notificationId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const element = document.querySelector(`[data-id="${notificationId}"]`);
            if (element) {
                element.remove();
            }
            await updateUnreadCount();
        }
    } catch (error) {
        console.error('Failed to delete notification:', error);
    }
}

function toggleNotificationCenter() {
    const center = document.getElementById('notification-center');
    center.classList.toggle('active');
}

function setupNotificationCenter(userId) {
    const bell = document.getElementById('notification-bell');
    const markAllReadBtn = document.getElementById('mark-all-read');

    if (bell) {
        bell.addEventListener('click', toggleNotificationCenter);
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => markAllAsRead(userId));
    }

    document.addEventListener('click', (e) => {
        const center = document.getElementById('notification-center');
        const toggle = document.querySelector('.notification-center-toggle');
        if (center && !center.contains(e.target) && !toggle.contains(e.target)) {
            center.classList.remove('active');
        }
    });

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    connectNotifications(userId);
    loadNotifications(userId);
}

function createNotification(data) {
    return fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

window.createNotification = createNotification;
window.loadNotifications = loadNotifications;
window.markAsRead = markAsRead;
window.deleteNotification = deleteNotification;
window.setupNotificationCenter = setupNotificationCenter;
