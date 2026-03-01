const API_BASE_URL = 'http://localhost:3000/api';
const DEMO_POSTS = [
    {
        id: 'demo-1',
        title: 'The Future of AI in Campus Life',
        category: 'Tech',
        content: 'Artificial Intelligence is changing how we study and collaborate. From automated scheduling to smart research tools...',
        authorName: 'Tech Admin',
        createdAt: new Date().toISOString(),
        tags: 'AI, Technology, Future',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
    },
    {
        id: 'demo-2',
        title: 'Annual Sports Meet 2026',
        category: 'Sports',
        content: 'Get ready for the most anticipated event of the year! Register now for Athletics, Football, and Cricket...',
        authorName: 'Sports Club',
        createdAt: new Date().toISOString(),
        tags: 'Sports, Fitness, Campus',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b'
    },
    // Add similar objects for 'Arts', 'Debate', and 'General'
];

document.addEventListener('DOMContentLoaded', () => {
    initBlog();
    initCreatePost();
    initViewModal();
});

let allPosts = [];
let currentPostId = null;

async function initBlog() {
    const feedContainer = document.getElementById('blog-feed');
    const filters = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-posts');

    if (!feedContainer) return;

    try {
    const res = await fetch(`${API_BASE_URL}/blog`);
    if (res.ok) {
        const data = await res.json();
        // If API is empty, use Demo Posts; otherwise use API data
        allPosts = data.length > 0 ? data : DEMO_POSTS;
    } else {
        allPosts = DEMO_POSTS; // Use fallback on server error
    }
} catch (error) {
    console.warn("Backend unreachable. Loading demo posts.");
    allPosts = DEMO_POSTS; // Fallback for connection errors
}
renderPosts(allPosts);

    // Filters
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            filterPosts(category, searchInput ? searchInput.value : '');
        });
    });

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');
            filterPosts(activeCategory, e.target.value);
        });
    }
}

function filterPosts(category, searchTerm) {
    let filtered = allPosts;

    if (category !== 'All') {
        filtered = filtered.filter(post => post.category === category);
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(term) ||
            post.content.toLowerCase().includes(term) ||
            (post.tags && post.tags.toLowerCase().includes(term))
        );
    }

    renderPosts(filtered);
}

function renderPosts(posts) {
    const feedContainer = document.getElementById('blog-feed');
    if (!posts.length) {
        feedContainer.innerHTML = '<p class="no-posts">No posts found.</p>';
        return;
    }

    feedContainer.innerHTML = posts.map(post => `
        <div class="blog-post-card" onclick="openPostModal(${post.id})">
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image" loading="lazy">` : ''}
            <div class="post-content">
                <div class="post-meta">
                    <span>${post.authorName || 'Anonymous'}</span>
                    <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.content.substring(0, 100)}...</p>
                <div class="post-tags">
                    ${post.tags ? post.tags.split(',').map(tag => `<span>#${tag.trim()}</span>`).join('') : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function initCreatePost() {
    const modal = document.getElementById('create-post-modal');
    const fab = document.getElementById('fab-create-post');
    const closeBtn = modal ? modal.querySelector('.close-modal') : null;
    const form = document.getElementById('create-post-form');

    if (fab && modal) {
        fab.addEventListener('click', () => {
            const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
            if (!token) {
                alert('Please login to create a post.');
                window.location.href = 'registration.html#student-login';
                return;
            }
            modal.classList.remove('hidden');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // Close on click outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';

            const postData = {
                title: document.getElementById('post-title').value,
                category: document.getElementById('post-category').value,
                content: document.getElementById('post-content').value,
                tags: document.getElementById('post-tags').value,
                imageUrl: document.getElementById('post-image').value
            };

            const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');

            try {
                const res = await fetch(`${API_BASE_URL}/blog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(postData)
                });

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        alert('Your session has expired. Please login again.');
                        handleLogout();
                        return;
                    }
                    const errData = await res.json();
                    throw new Error(errData.message || 'Failed to create post');
                }

                // Refresh feed
                modal.classList.add('hidden');
                form.reset();
                initBlog(); // Reload posts

            } catch (error) {
                if (error.message === 'Invalid token' || error.message.includes('jwt expired')) {
                    alert('Your session has expired. Please login again.');
                    handleLogout();
                    return;
                }
                alert('Error creating post: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Post';
            }
        });
    }
}

function handleLogout() {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('adminToken');
    window.location.href = 'registration.html#student-login';
}

async function likePost(id, btn) {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
    if (!token) {
        alert('Please login to like posts.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/blog/${id}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            btn.innerHTML = `<i class="fas fa-heart" style="color:var(--accent-color)"></i> ${data.likesCount}`;
            btn.classList.add('liked');
        }
    } catch (error) {
        console.error('Error liking post', error);
    }
}

// View Post Modal Logic
async function openPostModal(id) {
    const modal = document.getElementById('view-post-modal');
    const contentDiv = document.getElementById('view-post-content');
    const commentsList = document.getElementById('comments-list');

    if (!modal) return;

    modal.classList.remove('hidden');
    currentPostId = id;
    contentDiv.innerHTML = '<p>Loading...</p>';
    commentsList.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE_URL}/blog/${id}`);
        if (!res.ok) throw new Error('Failed to load post');
        const post = await res.json();

        contentDiv.innerHTML = `
            <div class="view-post-header">
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin-bottom:1rem;">` : ''}
                <div class="post-meta" style="margin-bottom:0.5rem; justify-content:flex-start; gap:1rem;">
                    <span style="color:var(--accent-color); font-weight:bold;">${post.authorName || 'Anonymous'}</span>
                    <span>${new Date(post.createdAt).toLocaleString()}</span>
                    <span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px;">${post.category}</span>
                </div>
                <h2 style="font-size:2rem; margin-bottom:1rem; color:white;">${post.title}</h2>
            </div>
            <div class="view-post-body" style="font-size:1.1rem; line-height:1.8; color:rgba(255,255,255,0.9); white-space: pre-wrap;">
                ${post.content}
            </div>
            <div class="post-tags" style="margin-top:1.5rem;">
                 ${post.tags ? post.tags.split(',').map(tag => `<span>#${tag.trim()}</span>`).join('') : ''}
            </div>
        `;

        // Render Comments - Removed for now
        // if (post.Comments && post.Comments.length > 0) { ... }

    } catch (error) {
        contentDiv.innerHTML = `<p class="error-text">Error loading post: ${error.message}</p>`;
    }
}

function initViewModal() {
    const modal = document.getElementById('view-post-modal');
    const closeBtn = modal ? modal.querySelector('.view-close') : null;
    const form = document.getElementById('add-comment-form');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentPostId) return;

            const content = document.getElementById('comment-input').value;
            const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');

            if (!token) {
                alert('Please login to comment.');
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/blog/${currentPostId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content })
                });

                if (res.ok) {
                    document.getElementById('comment-input').value = '';
                    // Reload modal content to show new comment
                    openPostModal(currentPostId);
                } else {
                    alert('Failed to post comment');
                }
            } catch (error) {
                console.error(error);
            }
        });
    }
}

// Global functions
window.likePost = likePost;
window.openPostModal = openPostModal;
