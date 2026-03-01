const API_BASE_URL = 'http://localhost:3000/api';

// 1. Guaranteed Demo Data
const DEMO_POSTS = [
    {
        id: 'demo-1',
        title: "The Future of AI in Campus Life",
        category: "Tech",
        content: "Artificial Intelligence is changing how we study and collaborate. From automated scheduling to smart research tools, AI is becoming an essential part of the modern student experience at DSCE.",
        authorName: "Tech Admin",
        createdAt: new Date().toISOString(),
        tags: "AI, Technology, Future",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e"
    },
    {
        id: 'demo-2',
        title: "Annual Sports Meet 2026",
        category: "Sports",
        content: "Get ready for the most anticipated event of the year! Register now for Athletics, Football, and Cricket. Let's show our campus spirit and compete for the championship trophy.",
        authorName: "Sports Club",
        createdAt: new Date().toISOString(),
        tags: "Sports, Fitness, Campus",
        imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
    },
    {
        id: 'demo-3',
        title: "Artistic Expression: Weekly Gallery",
        category: "Arts",
        content: "Our campus artists have outdone themselves this week. From digital paintings to traditional sculptures, come visit the student gallery in the Arts Center this Friday.",
        authorName: "Arts Society",
        createdAt: new Date().toISOString(),
        tags: "Art, Creativity, Gallery",
        imageUrl: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 'demo-4',
        title: "Mastering the Art of Persuasion",
        category: "Debate",
        content: "Debate isn't just about arguing; it's about logical reasoning and empathy. Learn how to structure your arguments effectively to win over any audience in our upcoming public speaking seminar.",
        authorName: "Debate Club",
        createdAt: new Date().toISOString(),
        tags: "Debate, Speech, Logic",
        imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2"
    },
    {
        id: 'demo-5',
        title: "Campus Life: Balancing Academics",
        category: "General",
        content: "Student life can be overwhelming. Finding the right balance between your studies and your passions is the key to a successful college experience.",
        authorName: "Student Council",
        createdAt: new Date().toISOString(),
        tags: "College, Lifestyle, Tips",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644"
    }
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
    if (!feedContainer) return;

    // Use AbortController to set a 3-second "Fast Fail" timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
        const res = await fetch(`${API_BASE_URL}/blog`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            allPosts = data.length > 0 ? data : DEMO_POSTS;
        } else {
            allPosts = DEMO_POSTS;
        }
    } catch (error) {
        console.warn("Detection: Server is offline. Loading demo posts automatically.");
        allPosts = DEMO_POSTS;
    }

    renderPosts(allPosts);
    setupFilters();
}

function setupFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-posts');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterPosts(btn.getAttribute('data-category'), searchInput ? searchInput.value : '');
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');
            filterPosts(activeCategory, e.target.value);
        });
    }
}

function filterPosts(category, searchTerm) {
    let filtered = allPosts;
    if (category !== 'All') filtered = filtered.filter(p => p.category === category);
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term)
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
        <div class="blog-post-card" onclick="openPostModal('${post.id}')">
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image">` : ''}
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

async function openPostModal(id) {
    const modal = document.getElementById('view-post-modal');
    const contentDiv = document.getElementById('view-post-content');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    const demoPost = DEMO_POSTS.find(p => p.id === id);
    if (demoPost) {
        renderModalContent(demoPost);
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/blog/${id}`);
        if (!res.ok) throw new Error();
        const post = await res.json();
        renderModalContent(post);
    } catch (e) {
        contentDiv.innerHTML = '<p>Post not found.</p>';
    }
}

function renderModalContent(post) {
    document.getElementById('view-post-content').innerHTML = `
        <div class="view-post-header">
            ${post.imageUrl ? `<img src="${post.imageUrl}" style="width:100%; border-radius:12px; margin-bottom:1rem;">` : ''}
            <h2>${post.title}</h2>
            <p style="color:var(--accent-color)">${post.authorName} | ${post.category}</p>
        </div>
        <div style="white-space: pre-wrap; margin-top:1rem;">${post.content}</div>
    `;
}

function initCreatePost() {
    const modal = document.getElementById('create-post-modal');
    const fab = document.getElementById('fab-create-post');
    if (fab) fab.addEventListener('click', () => {
        if (!localStorage.getItem('studentToken') && !localStorage.getItem('adminToken')) {
            alert('Please login.'); window.location.href = 'registration.html#student-login'; return;
        }
        modal.classList.remove('hidden');
    });
    const close = modal ? modal.querySelector('.close-modal') : null;
    if (close) close.addEventListener('click', () => modal.classList.add('hidden'));
}

function initViewModal() {
    const modal = document.getElementById('view-post-modal');
    const close = modal ? modal.querySelector('.view-close') : null;
    if (close) close.addEventListener('click', () => modal.classList.add('hidden'));
}

window.openPostModal = openPostModal;
