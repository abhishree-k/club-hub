/**
 * Discussions Forum – DSCE Clubs
 * Full-featured forum with localStorage persistence.
 */

const FORUM_STORAGE_KEY = 'dsce_forum_topics';
const REPORTS_STORAGE_KEY = 'dsce_forum_reports';

// Seed data for a fresh forum
const SEED_TOPICS = [
    {
        id: 1,
        title: 'Welcome to the DSCE Community Forum! 🎉',
        content: 'Hey everyone! Welcome to the new Community Discussions board. This is a space for all DSCE students to share ideas, ask questions, discuss events, and connect with fellow club members.\n\nFeel free to start new topics, reply to existing ones, and upvote content you find helpful.\n\nLet\'s build a strong, supportive community together! 🚀',
        category: 'General',
        tags: 'welcome,community,introduction',
        author: 'Admin',
        authorAvatar: '🌟',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: 24,
        upvotedBy: [],
        views: 156,
        pinned: true,
        replies: [
            {
                id: 101,
                content: 'This is amazing! So excited to have a forum for our community.',
                author: 'Priya',
                authorAvatar: '👩‍💻',
                createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                upvotes: 8,
                upvotedBy: [],
                parentReplyId: null
            },
            {
                id: 102,
                content: 'Great initiative! Looking forward to connecting with fellow club members here.',
                author: 'Rohan',
                authorAvatar: '🎸',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                upvotes: 5,
                upvotedBy: [],
                parentReplyId: null
            },
            {
                id: 103,
                content: 'Welcome everyone! The Tech Society is ready to share and learn!',
                author: 'ABM',
                authorAvatar: '💻',
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                upvotes: 12,
                upvotedBy: [],
                parentReplyId: null
            }
        ]
    },
    {
        id: 2,
        title: 'Upcoming Hackathon – Team Formation Thread',
        content: 'The Spring Hackathon is coming up in April! If you\'re looking for teammates or want to share project ideas, this is the place.\n\n**Looking for:**\n- Frontend developers (React/Vue)\n- Backend developers (Node/Python)\n- UI/UX Designers\n- Anyone passionate about creating cool stuff!\n\nDrop a comment with your skills and interests!',
        category: 'Tech',
        tags: 'hackathon,teamup,coding,spring2026',
        author: 'ABM',
        authorAvatar: '💻',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: 18,
        upvotedBy: [],
        views: 89,
        pinned: false,
        replies: [
            {
                id: 201,
                content: 'I\'m a full-stack dev with experience in React and Node.js. Looking for a team! 🙋‍♂️',
                author: 'Karthik',
                authorAvatar: '⚡',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                upvotes: 4,
                upvotedBy: [],
                parentReplyId: null
            },
            {
                id: 202,
                content: 'UI/UX designer here! I\'d love to collaborate. Send me a DM!',
                author: 'Ananya',
                authorAvatar: '🎨',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                upvotes: 6,
                upvotedBy: [],
                parentReplyId: null
            },
            {
                id: 203,
                content: '@Karthik Let\'s team up! I know Python and ML. We could build something with AI.',
                author: 'Deepa',
                authorAvatar: '🤖',
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                upvotes: 3,
                upvotedBy: [],
                parentReplyId: 201
            }
        ]
    },
    {
        id: 3,
        title: 'Best resources for learning UI/UX design?',
        content: 'Hey everyone! I\'m interested in getting started with UI/UX design. Can anyone recommend good courses, books, or tools?\n\nI\'ve heard about Figma – is it worth learning? Any tips for beginners would be super helpful! 🙏',
        category: 'Arts',
        tags: 'design,uiux,learning,resources',
        author: 'Jamie',
        authorAvatar: '🎨',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: 14,
        upvotedBy: [],
        views: 67,
        pinned: false,
        replies: [
            {
                id: 301,
                content: 'Figma is absolutely worth learning! Start with their official tutorials. Also check out "Refactoring UI" – it\'s a great book for developers getting into design.',
                author: 'Ananya',
                authorAvatar: '🎨',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                upvotes: 9,
                upvotedBy: [],
                parentReplyId: null
            },
            {
                id: 302,
                content: 'Google\'s Material Design guidelines are also a goldmine. Plus, recreating existing designs is great practice!',
                author: 'Priya',
                authorAvatar: '👩‍💻',
                createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
                upvotes: 7,
                upvotedBy: [],
                parentReplyId: null
            }
        ]
    },
    {
        id: 4,
        title: 'Inter-college debate prep – Topic suggestions needed',
        content: 'The intercollege debate competition is approaching and we need to prepare. What topics do you think would be relevant and challenging?\n\nSome ideas so far:\n- AI in education: boon or bane?\n- Social media\'s impact on mental health\n- Should college education be more practical?\n\nShare your suggestions below! 🗣️',
        category: 'Debate',
        tags: 'debate,intercollege,preparation,topics',
        author: 'Taylor',
        authorAvatar: '🎤',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        upvotes: 11,
        upvotedBy: [],
        views: 45,
        pinned: false,
        replies: [
            {
                id: 401,
                content: 'How about "Is remote work the future of employment?" Very relevant post-pandemic!',
                author: 'Rohan',
                authorAvatar: '🎸',
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                upvotes: 3,
                upvotedBy: [],
                parentReplyId: null
            }
        ]
    },
    {
        id: 5,
        title: 'Sports day volunteers needed! 🏆',
        content: 'Hey sports enthusiasts!\n\nWe need volunteers for the upcoming sports day. Tasks include:\n- Score keeping\n- Equipment setup\n- Photography\n- First aid support\n- Refreshments management\n\nVolunteers will receive certificates and free merch! Comment if you\'re interested.',
        category: 'Sports',
        tags: 'sports,volunteer,sportsday,help',
        author: 'Coach Raj',
        authorAvatar: '⚽',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        upvotes: 9,
        upvotedBy: [],
        views: 38,
        pinned: false,
        replies: []
    },
    {
        id: 6,
        title: 'Music jam session this Friday! 🎶',
        content: 'Planning an informal jam session this Friday at 5 PM in the Music Room.\n\nAll instruments and skill levels welcome! Whether you play guitar, keyboard, drums, or just want to sing along – come join us!\n\nBring your own instruments if possible. We have a basic setup available too.',
        category: 'Music',
        tags: 'music,jam,friday,instruments',
        author: 'Melody',
        authorAvatar: '🎵',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        upvotes: 16,
        upvotedBy: [],
        views: 52,
        pinned: false,
        replies: [
            {
                id: 601,
                content: 'Count me in! I\'ll bring my acoustic guitar 🎸',
                author: 'Rohan',
                authorAvatar: '🎸',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                upvotes: 2,
                upvotedBy: [],
                parentReplyId: null
            }
        ]
    }
];

// Profanity filter (basic)
const BLOCKED_WORDS = ['spam', 'scam', 'xxx', 'abuse'];

function containsProfanity(text) {
    const lower = text.toLowerCase();
    return BLOCKED_WORDS.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lower);
    });
}

function escapeHtmlForum(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMarkdownBasic(text) {
    let safe = escapeHtmlForum(text);
    // Bold
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    safe = safe.replace(/\n/g, '<br>');
    // @mentions
    safe = safe.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    return safe;
}

function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return then.toLocaleDateString();
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function getCurrentUser() {
    const student = localStorage.getItem('studentUser');
    if (student) {
        try {
            const parsed = JSON.parse(student);
            return { name: parsed.name || 'Student', avatar: '👤' };
        } catch { /* ignore */ }
    }
    return null;
}

function getRandomAvatar() {
    const avatars = ['🧑‍💻', '👩‍🎓', '🧑‍🎨', '🧑‍🔬', '👨‍💼', '👩‍💻', '🦸', '🧙', '🎭', '🌈'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

// ============ DATA LAYER ============

function loadTopics() {
    try {
        const data = localStorage.getItem(FORUM_STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch { /* ignore */ }
    // Seed
    saveTopics(SEED_TOPICS);
    return SEED_TOPICS;
}

function saveTopics(topics) {
    localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(topics));
}

function loadReports() {
    try {
        const data = localStorage.getItem(REPORTS_STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch { /* ignore */ }
    return [];
}

function saveReports(reports) {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

// ============ APP STATE ============

let allTopics = [];
let currentFilter = 'All';
let currentSort = 'newest';
let currentSearchTerm = '';
let currentTopicId = null;
let replyToId = null;

// ============ INIT ============

document.addEventListener('DOMContentLoaded', () => {
    allTopics = loadTopics();
    initForumControls();
    initCreateTopicModal();
    initViewTopicModal();
    initReportModal();
    renderTopics();
    updateStats();
    renderSidebar();
});

// ============ CONTROLS ============

function initForumControls() {
    // Category filters
    const filters = document.querySelectorAll('#forum-category-filters .filter-btn');
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-category');
            renderTopics();
        });
    });

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderTopics();
        });
    }

    // Search
    const searchInput = document.getElementById('forum-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.trim();
            renderTopics();
        });
    }

    // FAB
    const fab = document.getElementById('fab-create-topic');
    if (fab) {
        fab.addEventListener('click', () => openCreateModal());
    }

    // Empty state button
    const emptyBtn = document.getElementById('empty-start-btn');
    if (emptyBtn) {
        emptyBtn.addEventListener('click', () => openCreateModal());
    }
}

// ============ TOPIC RENDERING ============

function getFilteredAndSortedTopics() {
    let topics = [...allTopics];

    // Filter
    if (currentFilter !== 'All') {
        topics = topics.filter(t => t.category === currentFilter);
    }

    // Search
    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        topics = topics.filter(t =>
            t.title.toLowerCase().includes(term) ||
            t.content.toLowerCase().includes(term) ||
            t.author.toLowerCase().includes(term) ||
            (t.tags && t.tags.toLowerCase().includes(term))
        );
    }

    // Separate pinned
    const pinned = topics.filter(t => t.pinned);
    const unpinned = topics.filter(t => !t.pinned);

    // Sort unpinned
    switch (currentSort) {
        case 'oldest':
            unpinned.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'popular':
            unpinned.sort((a, b) => b.upvotes - a.upvotes);
            break;
        case 'most-replies':
            unpinned.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
            break;
        default: // newest
            unpinned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return [...pinned, ...unpinned];
}

function renderTopics() {
    const container = document.getElementById('forum-topics-list');
    const emptyState = document.getElementById('forum-empty-state');
    if (!container) return;

    const topics = getFilteredAndSortedTopics();

    if (topics.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = topics.map(topic => {
        const repliesCount = topic.replies ? topic.replies.length : 0;
        const lastActivity = topic.replies && topic.replies.length > 0
            ? topic.replies[topic.replies.length - 1].createdAt
            : topic.createdAt;

        const categoryColors = {
            'General': '#a29bfe',
            'Tech': '#6c5ce7',
            'Arts': '#fd79a8',
            'Sports': '#00b894',
            'Debate': '#fdcb6e',
            'Music': '#e17055',
            'Dance': '#ff9ff3',
            'Events': '#00cec9'
        };

        const catColor = categoryColors[topic.category] || '#a29bfe';

        return `
      <div class="forum-topic-card ${topic.pinned ? 'pinned' : ''}" data-topic-id="${topic.id}" onclick="openTopicView(${topic.id})">
        ${topic.pinned ? '<div class="pinned-badge"><i class="fas fa-thumbtack"></i> Pinned</div>' : ''}
        <div class="topic-card-main">
          <div class="topic-avatar">${escapeHtmlForum(topic.authorAvatar || '👤')}</div>
          <div class="topic-info">
            <div class="topic-card-header">
              <h3 class="topic-card-title">${escapeHtmlForum(topic.title)}</h3>
              <span class="topic-category-badge" style="background: ${catColor}20; color: ${catColor}; border: 1px solid ${catColor}40;">
                ${escapeHtmlForum(topic.category)}
              </span>
            </div>
            <p class="topic-card-excerpt">${escapeHtmlForum(topic.content.substring(0, 120))}${topic.content.length > 120 ? '...' : ''}</p>
            <div class="topic-card-meta">
              <span class="meta-author"><i class="fas fa-user"></i> ${escapeHtmlForum(topic.author)}</span>
              <span class="meta-time"><i class="far fa-clock"></i> ${timeAgo(topic.createdAt)}</span>
              <span class="meta-replies"><i class="fas fa-comments"></i> ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}</span>
              <span class="meta-upvotes"><i class="fas fa-arrow-up"></i> ${topic.upvotes}</span>
              <span class="meta-views"><i class="fas fa-eye"></i> ${topic.views || 0}</span>
            </div>
            ${topic.tags ? `
              <div class="topic-card-tags">
                ${topic.tags.split(',').map(tag => `<span class="topic-tag">#${escapeHtmlForum(tag.trim())}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    }).join('');
}

// ============ CREATE TOPIC MODAL ============

function openCreateModal() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to start a discussion.', 'warning');
        setTimeout(() => {
            window.location.href = 'registration.html#student-login';
        }, 1500);
        return;
    }
    const modal = document.getElementById('create-topic-modal');
    if (modal) modal.classList.remove('hidden');
}

function initCreateTopicModal() {
    const modal = document.getElementById('create-topic-modal');
    const closeBtn = document.getElementById('close-create-modal');
    const form = document.getElementById('create-topic-form');
    const titleInput = document.getElementById('topic-title');
    const contentInput = document.getElementById('topic-content');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // Character counts
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            const span = document.getElementById('title-char-count');
            if (span) span.textContent = titleInput.value.length;
        });
    }

    if (contentInput) {
        contentInput.addEventListener('input', () => {
            const span = document.getElementById('content-char-count');
            if (span) span.textContent = contentInput.value.length;
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            const category = document.getElementById('topic-category').value;
            const tags = document.getElementById('topic-tags').value.trim();

            // Validation
            if (!title || !content) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            if (containsProfanity(title) || containsProfanity(content)) {
                showToast('Your post contains inappropriate content. Please revise.', 'error');
                return;
            }

            const user = getCurrentUser();
            if (!user) {
                showToast('Please login to post.', 'warning');
                return;
            }

            const newTopic = {
                id: generateId(),
                title,
                content,
                category,
                tags,
                author: user.name,
                authorAvatar: user.avatar || getRandomAvatar(),
                createdAt: new Date().toISOString(),
                upvotes: 0,
                upvotedBy: [],
                views: 0,
                pinned: false,
                replies: []
            };

            allTopics.unshift(newTopic);
            saveTopics(allTopics);
            renderTopics();
            updateStats();
            renderSidebar();

            form.reset();
            if (document.getElementById('title-char-count')) document.getElementById('title-char-count').textContent = '0';
            if (document.getElementById('content-char-count')) document.getElementById('content-char-count').textContent = '0';
            modal.classList.add('hidden');
            showToast('Your discussion has been published! 🎉', 'success');
        });
    }
}

// ============ VIEW TOPIC / THREAD ============

function openTopicView(topicId) {
    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) return;

    currentTopicId = topicId;
    replyToId = null;

    // Increment views
    topic.views = (topic.views || 0) + 1;
    saveTopics(allTopics);

    const modal = document.getElementById('view-topic-modal');
    const contentDiv = document.getElementById('view-topic-content');
    if (!modal || !contentDiv) return;

    modal.classList.remove('hidden');

    const categoryColors = {
        'General': '#a29bfe',
        'Tech': '#6c5ce7',
        'Arts': '#fd79a8',
        'Sports': '#00b894',
        'Debate': '#fdcb6e',
        'Music': '#e17055',
        'Dance': '#ff9ff3',
        'Events': '#00cec9'
    };

    const catColor = categoryColors[topic.category] || '#a29bfe';
    const user = getCurrentUser();
    const hasUpvoted = user && topic.upvotedBy && topic.upvotedBy.includes(user.name);

    contentDiv.innerHTML = `
    <div class="thread-topic-header">
      <div class="thread-topic-top">
        <span class="topic-category-badge" style="background: ${catColor}20; color: ${catColor}; border: 1px solid ${catColor}40;">
          ${escapeHtmlForum(topic.category)}
        </span>
        ${topic.pinned ? '<span class="pinned-badge-inline"><i class="fas fa-thumbtack"></i> Pinned</span>' : ''}
      </div>
      <h2 class="thread-title">${escapeHtmlForum(topic.title)}</h2>
      <div class="thread-meta">
        <span class="thread-avatar">${escapeHtmlForum(topic.authorAvatar || '👤')}</span>
        <span class="thread-author">${escapeHtmlForum(topic.author)}</span>
        <span class="thread-time">${timeAgo(topic.createdAt)}</span>
        <span class="thread-views"><i class="fas fa-eye"></i> ${topic.views} views</span>
      </div>
    </div>
    <div class="thread-topic-body">
      ${formatMarkdownBasic(topic.content)}
    </div>
    ${topic.tags ? `
      <div class="thread-tags">
        ${topic.tags.split(',').map(tag => `<span class="topic-tag">#${escapeHtmlForum(tag.trim())}</span>`).join('')}
      </div>
    ` : ''}
    <div class="thread-actions">
      <button class="thread-action-btn ${hasUpvoted ? 'upvoted' : ''}" onclick="upvoteTopic(${topic.id}, event)" id="upvote-topic-btn">
        <i class="fas fa-arrow-up"></i>
        <span id="topic-upvote-count">${topic.upvotes}</span>
        Upvote
      </button>
      <button class="thread-action-btn" onclick="openReportModal('topic', ${topic.id}, event)">
        <i class="fas fa-flag"></i> Report
      </button>
      <button class="thread-action-btn" onclick="shareTopic(${topic.id}, event)">
        <i class="fas fa-share-alt"></i> Share
      </button>
    </div>
  `;

    renderReplies(topic);

    // Clear reply-to state
    const replyToIndicator = document.getElementById('reply-to-indicator');
    if (replyToIndicator) replyToIndicator.classList.add('hidden');

    // Update replies heading
    const repliesHeading = document.getElementById('replies-count-heading');
    if (repliesHeading) {
        const count = topic.replies ? topic.replies.length : 0;
        repliesHeading.textContent = `${count} ${count === 1 ? 'Reply' : 'Replies'}`;
    }
}

function renderReplies(topic) {
    const container = document.getElementById('replies-list');
    if (!container) return;

    if (!topic.replies || topic.replies.length === 0) {
        container.innerHTML = '<p class="no-replies-text">No replies yet. Be the first to respond!</p>';
        return;
    }

    // Render top-level replies, then nested
    const topLevel = topic.replies.filter(r => !r.parentReplyId);
    const nested = topic.replies.filter(r => r.parentReplyId);

    container.innerHTML = topLevel.map(reply => {
        const childReplies = nested.filter(n => n.parentReplyId === reply.id);
        const user = getCurrentUser();
        const hasUpvoted = user && reply.upvotedBy && reply.upvotedBy.includes(user.name);

        return `
      <div class="reply-card" data-reply-id="${reply.id}">
        <div class="reply-main">
          <div class="reply-avatar">${escapeHtmlForum(reply.authorAvatar || '👤')}</div>
          <div class="reply-body">
            <div class="reply-header">
              <span class="reply-author">${escapeHtmlForum(reply.author)}</span>
              <span class="reply-time">${timeAgo(reply.createdAt)}</span>
            </div>
            <div class="reply-content">${formatMarkdownBasic(reply.content)}</div>
            <div class="reply-actions">
              <button class="reply-action-btn ${hasUpvoted ? 'upvoted' : ''}" onclick="upvoteReply(${topic.id}, ${reply.id}, event)">
                <i class="fas fa-arrow-up"></i> ${reply.upvotes}
              </button>
              <button class="reply-action-btn" onclick="setReplyTo(${reply.id}, '${escapeHtmlForum(reply.author)}')">
                <i class="fas fa-reply"></i> Reply
              </button>
              <button class="reply-action-btn" onclick="openReportModal('reply', ${reply.id}, event)">
                <i class="fas fa-flag"></i>
              </button>
            </div>
          </div>
        </div>
        ${childReplies.length > 0 ? `
          <div class="nested-replies">
            ${childReplies.map(child => {
            const childUpvoted = user && child.upvotedBy && child.upvotedBy.includes(user.name);
            return `
                <div class="reply-card nested" data-reply-id="${child.id}">
                  <div class="reply-main">
                    <div class="reply-avatar">${escapeHtmlForum(child.authorAvatar || '👤')}</div>
                    <div class="reply-body">
                      <div class="reply-header">
                        <span class="reply-author">${escapeHtmlForum(child.author)}</span>
                        <span class="reply-time">${timeAgo(child.createdAt)}</span>
                      </div>
                      <div class="reply-content">${formatMarkdownBasic(child.content)}</div>
                      <div class="reply-actions">
                        <button class="reply-action-btn ${childUpvoted ? 'upvoted' : ''}" onclick="upvoteReply(${topic.id}, ${child.id}, event)">
                          <i class="fas fa-arrow-up"></i> ${child.upvotes}
                        </button>
                        <button class="reply-action-btn" onclick="openReportModal('reply', ${child.id}, event)">
                          <i class="fas fa-flag"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
        }).join('')}
          </div>
        ` : ''}
      </div>
    `;
    }).join('');
}

function initViewTopicModal() {
    const modal = document.getElementById('view-topic-modal');
    const closeBtn = document.getElementById('close-view-modal');
    const form = document.getElementById('reply-form');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            currentTopicId = null;
            replyToId = null;
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                currentTopicId = null;
                replyToId = null;
            }
        });
    }

    // Cancel reply-to
    const cancelReplyTo = document.getElementById('cancel-reply-to');
    if (cancelReplyTo) {
        cancelReplyTo.addEventListener('click', () => {
            replyToId = null;
            const indicator = document.getElementById('reply-to-indicator');
            if (indicator) indicator.classList.add('hidden');
        });
    }

    // Submit reply
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = getCurrentUser();
            if (!user) {
                showToast('Please login to reply.', 'warning');
                return;
            }

            const content = document.getElementById('reply-content').value.trim();
            if (!content) {
                showToast('Reply cannot be empty.', 'error');
                return;
            }

            if (containsProfanity(content)) {
                showToast('Your reply contains inappropriate content. Please revise.', 'error');
                return;
            }

            const topic = allTopics.find(t => t.id === currentTopicId);
            if (!topic) return;

            const newReply = {
                id: generateId(),
                content,
                author: user.name,
                authorAvatar: user.avatar || getRandomAvatar(),
                createdAt: new Date().toISOString(),
                upvotes: 0,
                upvotedBy: [],
                parentReplyId: replyToId || null
            };

            if (!topic.replies) topic.replies = [];
            topic.replies.push(newReply);
            saveTopics(allTopics);

            document.getElementById('reply-content').value = '';
            replyToId = null;
            const indicator = document.getElementById('reply-to-indicator');
            if (indicator) indicator.classList.add('hidden');

            openTopicView(currentTopicId);
            renderTopics();
            updateStats();
            renderSidebar();
            showToast('Reply posted! 💬', 'success');
        });
    }
}

// ============ ACTIONS ============

function upvoteTopic(topicId, event) {
    if (event) event.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to upvote.', 'warning');
        return;
    }

    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) return;

    if (!topic.upvotedBy) topic.upvotedBy = [];

    if (topic.upvotedBy.includes(user.name)) {
        // Remove upvote
        topic.upvotedBy = topic.upvotedBy.filter(u => u !== user.name);
        topic.upvotes = Math.max(0, topic.upvotes - 1);
    } else {
        topic.upvotedBy.push(user.name);
        topic.upvotes += 1;
    }

    saveTopics(allTopics);

    // Update UI
    const btn = document.getElementById('upvote-topic-btn');
    const countSpan = document.getElementById('topic-upvote-count');
    if (btn) btn.classList.toggle('upvoted', topic.upvotedBy.includes(user.name));
    if (countSpan) countSpan.textContent = topic.upvotes;

    renderTopics();
    renderSidebar();
}

function upvoteReply(topicId, replyId, event) {
    if (event) event.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to upvote.', 'warning');
        return;
    }

    const topic = allTopics.find(t => t.id === topicId);
    if (!topic || !topic.replies) return;

    const reply = topic.replies.find(r => r.id === replyId);
    if (!reply) return;

    if (!reply.upvotedBy) reply.upvotedBy = [];

    if (reply.upvotedBy.includes(user.name)) {
        reply.upvotedBy = reply.upvotedBy.filter(u => u !== user.name);
        reply.upvotes = Math.max(0, reply.upvotes - 1);
    } else {
        reply.upvotedBy.push(user.name);
        reply.upvotes += 1;
    }

    saveTopics(allTopics);
    openTopicView(currentTopicId);
}

function setReplyTo(replyId, authorName) {
    replyToId = replyId;
    const indicator = document.getElementById('reply-to-indicator');
    const nameSpan = document.getElementById('reply-to-name');
    if (indicator) indicator.classList.remove('hidden');
    if (nameSpan) nameSpan.textContent = authorName;

    // Focus textarea
    const textarea = document.getElementById('reply-content');
    if (textarea) textarea.focus();
}

function shareTopic(topicId, event) {
    if (event) event.stopPropagation();
    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) return;

    const shareText = `Check out this discussion: "${topic.title}" on DSCE Clubs!`;

    if (navigator.share) {
        navigator.share({ title: topic.title, text: shareText, url: window.location.href });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Discussion link copied to clipboard! 📋', 'success');
        }).catch(() => {
            showToast('Could not copy link.', 'error');
        });
    }
}

// ============ REPORT ============

let reportTarget = { type: null, id: null };

function openReportModal(type, id, event) {
    if (event) event.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to report content.', 'warning');
        return;
    }

    reportTarget = { type, id };
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('hidden');
}

function initReportModal() {
    const modal = document.getElementById('report-modal');
    const closeBtn = document.getElementById('close-report-modal');
    const form = document.getElementById('report-form');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const reason = document.getElementById('report-reason').value;
            const details = document.getElementById('report-details').value;

            if (!reason) {
                showToast('Please select a reason.', 'error');
                return;
            }

            const user = getCurrentUser();
            const report = {
                id: generateId(),
                type: reportTarget.type,
                targetId: reportTarget.id,
                reason,
                details,
                reporter: user ? user.name : 'Anonymous',
                createdAt: new Date().toISOString(),
                status: 'pending'
            };

            const reports = loadReports();
            reports.push(report);
            saveReports(reports);

            form.reset();
            modal.classList.add('hidden');
            showToast('Report submitted. Thank you for helping keep our community safe! 🛡️', 'success');
        });
    }
}

// ============ STATS ============

function updateStats() {
    const totalTopics = allTopics.length;
    const totalReplies = allTopics.reduce((sum, t) => sum + (t.replies ? t.replies.length : 0), 0);

    // Unique participants
    const participants = new Set();
    allTopics.forEach(t => {
        participants.add(t.author);
        if (t.replies) t.replies.forEach(r => participants.add(r.author));
    });

    // Active today (topics/replies from last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let activeToday = allTopics.filter(t => new Date(t.createdAt) > oneDayAgo).length;
    allTopics.forEach(t => {
        if (t.replies) {
            activeToday += t.replies.filter(r => new Date(r.createdAt) > oneDayAgo).length;
        }
    });

    animateCounter('stat-topics', totalTopics);
    animateCounter('stat-replies', totalReplies);
    animateCounter('stat-participants', participants.size);
    animateCounter('stat-active', activeToday);
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const current = parseInt(el.textContent) || 0;
    const diff = target - current;
    const steps = 20;
    const stepValue = diff / steps;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        if (step >= steps) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.round(current + stepValue * step);
        }
    }, 30);
}

// ============ SIDEBAR ============

function renderSidebar() {
    renderTrendingTopics();
    renderTopContributors();
}

function renderTrendingTopics() {
    const container = document.getElementById('trending-topics');
    if (!container) return;

    const trending = [...allTopics]
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 5);

    if (trending.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">No trending topics yet.</p>';
        return;
    }

    container.innerHTML = trending.map((topic, i) => `
    <div class="trending-item" onclick="openTopicView(${topic.id})">
      <span class="trending-rank">${i + 1}</span>
      <div class="trending-info">
        <span class="trending-title">${escapeHtmlForum(topic.title.substring(0, 40))}${topic.title.length > 40 ? '...' : ''}</span>
        <span class="trending-stats"><i class="fas fa-arrow-up"></i> ${topic.upvotes} · <i class="fas fa-comments"></i> ${topic.replies ? topic.replies.length : 0}</span>
      </div>
    </div>
  `).join('');
}

function renderTopContributors() {
    const container = document.getElementById('top-contributors');
    if (!container) return;

    // Count contributions
    const contributions = {};
    allTopics.forEach(t => {
        const key = t.author;
        if (!contributions[key]) contributions[key] = { name: key, avatar: t.authorAvatar || '👤', posts: 0, replies: 0 };
        contributions[key].posts += 1;
        if (t.replies) {
            t.replies.forEach(r => {
                const rKey = r.author;
                if (!contributions[rKey]) contributions[rKey] = { name: rKey, avatar: r.authorAvatar || '👤', posts: 0, replies: 0 };
                contributions[rKey].replies += 1;
            });
        }
    });

    const sorted = Object.values(contributions)
        .sort((a, b) => (b.posts + b.replies) - (a.posts + a.replies))
        .slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">No contributors yet.</p>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    container.innerHTML = sorted.map((c, i) => `
    <div class="contributor-item">
      <span class="contributor-medal">${medals[i] || ''}</span>
      <span class="contributor-avatar">${escapeHtmlForum(c.avatar)}</span>
      <div class="contributor-info">
        <span class="contributor-name">${escapeHtmlForum(c.name)}</span>
        <span class="contributor-stats">${c.posts} topics · ${c.replies} replies</span>
      </div>
    </div>
  `).join('');
}

// ============ TOAST ============

function showToast(message, type = 'success') {
    const toast = document.getElementById('forum-toast');
    const msgSpan = document.getElementById('toast-message');
    if (!toast || !msgSpan) return;

    const icon = toast.querySelector('i');
    switch (type) {
        case 'error':
            if (icon) icon.className = 'fas fa-exclamation-circle';
            toast.className = 'forum-toast toast-error';
            break;
        case 'warning':
            if (icon) icon.className = 'fas fa-exclamation-triangle';
            toast.className = 'forum-toast toast-warning';
            break;
        default:
            if (icon) icon.className = 'fas fa-check-circle';
            toast.className = 'forum-toast toast-success';
    }

    msgSpan.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3500);
}

// ============ GLOBAL EXPORTS ============
window.openTopicView = openTopicView;
window.upvoteTopic = upvoteTopic;
window.upvoteReply = upvoteReply;
window.setReplyTo = setReplyTo;
window.shareTopic = shareTopic;
window.openReportModal = openReportModal;
