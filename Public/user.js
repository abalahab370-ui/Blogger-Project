// Configuration Endpoints
const AUTH_URL = '/api';
const POST_URL = '/api/post';

const ROLES = {
    USER: 2001,
    ADMIN: 2020
};

// Application State
let accessToken = null;
let currentUser = null;
let searchDebounceTimer = null;

/**
 * Decodes Base64URL JWT payload in memory
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (err) {
        return null;
    }
}

/**
 * Main Initializer called by index.html (<script>initUserHub();</script>)
 */
async function initUserHub() {
    // 1. Silent Refresh on page load to retrieve in-memory Access Token
    const token = await refreshSession();
    if (!token) return; // If token retrieval fails, refreshSession redirects to login.html

    // 2. Hydrate Header UI with username and role badge
    updateHeaderUI();

    // 3. Attach DOM Event Listeners
    setupEventListeners();

    // 4. Initial Fetch of Posts Feed
    fetchAndRenderPosts();
}

/**
 * Obtains a fresh access token using the HttpOnly refresh token cookie
 */
async function refreshSession() {
    try {
        const res = await fetch(`${AUTH_URL}/refresh`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Session invalid or expired');

        const data = await res.json();
        accessToken = data.accessToken;

        // Decode token to retrieve user details
        const payload = parseJwt(accessToken);
        currentUser = {
            username: payload?.userInfo?.username || 'User',
            roles: payload?.userInfo?.roles || payload?.userInfo?.role || ROLES.USER
        };

        return accessToken;
    } catch (err) {
        console.warn('Session check error:', err.message);
        window.location.href = '/login.html';
        return null;
    }
}

/**
 * Updates Header User Info
 */
function updateHeaderUI() {
    const greeting = document.getElementById('userGreeting');
    const badge = document.getElementById('userRoleBadge');

    if (greeting) greeting.innerText = currentUser.username;
    if (badge) {
        const isAdmin = parseInt(currentUser.roles) === 2020 ;

        badge.innerText = isAdmin ? 'Administrator' : 'Contributor';
        badge.className = `text-[10px] uppercase font-mono tracking-wider ${isAdmin ? 'text-purple-600 font-bold' : 'text-gray-400'}`;
    }
}

/**
 * Attach Submit, Search, and Logout event listeners
 */
function setupEventListeners() {

    const publishForm = document.getElementById('publishForm');
    const searchBar = document.getElementById('searchBar');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Send Post Request
    publishForm?.addEventListener('submit', handleCreatePost);

    // 2. Live Search Input (300ms debounce)
    searchBar?.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            fetchAndRenderPosts(e.target.value.trim());
        }, 300);
    });

    // 3. Logout Button
    logoutBtn?.addEventListener('click', handleLogout);
}

/**
 * Sends POST request to /api/post with clean structure:
 * { title, category, content }
 */
async function handleCreatePost(e) {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');
    const contentInput = document.getElementById('content');
    const submitBtn = document.getElementById('submitPostBtn');

    const cleanPayload = {
        title: titleInput.value.trim(),
        category: categoryInput.value.trim(),
        content: contentInput.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.innerText = 'Publishing...';

    try {
        const res = await fetch(POST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(cleanPayload)
        });


        if (!res.ok) {
            throw new Error('Failed to create post');
        }

        
        // Clear Form Inputs
        titleInput.value = '';
        categoryInput.value = '';
        contentInput.value = '';

        // Reload feed to show new post under search bar
        fetchAndRenderPosts();

    } catch (err) {
        alert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Commit to Feed';
    }
}

/**
 * Fetches posts from GET /api/post (or /api/post?search=...) 
 * and renders them under the search bar.
 */
async function fetchAndRenderPosts(searchQuery = '') {
    const feedContainer = document.getElementById('dynamicFeed');
    feedContainer.innerHTML = `<div class="text-center py-6 text-xs text-gray-400">Loading articles...</div>`;

    try {
        const endpoint = searchQuery 
            ? `${POST_URL}?search=${encodeURIComponent(searchQuery)}` 
            : POST_URL;

        const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!res.ok) throw new Error('Could not fetch posts');

        const posts = await res.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            feedContainer.innerHTML = `
                <div class="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
                    ${searchQuery ? `No posts matching "${escapeHTML(searchQuery)}"` : 'No articles available yet.'}
                </div>`;
            return;
        }

        // 1. Check admin status once before rendering
        const isAdmin = parseInt(currentUser.roles) === 2020 ;
        const adminLoggedIn = isAdmin;

        // 2. Render posts directly into #dynamicFeed
        feedContainer.innerHTML = posts.map(post => `
            <article class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3 hover:border-gray-300 transition relative">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        ${escapeHTML(post.category || 'General')}
                    </span>

                    <div class="flex items-center gap-3">
                        <span class="text-[11px] text-gray-400">
                            ${post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
                        </span>

                        <!-- Conditionally injected Delete button for Admins only -->
                        ${adminLoggedIn ? `
                            <button onclick="handleDeletePost('${post._id}')" 
                                    class="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer transition px-2 py-0.5 rounded hover:bg-red-50 border border-transparent hover:border-red-200">
                                🗑️ Delete
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-gray-900 leading-snug">${escapeHTML(post.title)}</h3>
                    <p class="text-xs text-gray-500 mt-0.5">By <span class="font-medium text-gray-700">@${escapeHTML(post.author || 'Anonymous')}</span></p>
                </div>

                <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">${escapeHTML(post.content)}</p>
            </article>
        `).join('');

    } catch (err) {
        console.error('Feed error:', err);
        feedContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs text-center">
                Failed to load articles.
            </div>`;
    }
}

/**
 * Admin Delete Request
 */
async function handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
        const res = await fetch(`${POST_URL}?postId=${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete post');
        }

        // Re-fetch posts to immediately reflect deletion in UI
        fetchAndRenderPosts();

    } catch (err) {
        alert(`catching an error : ${err.message}`);
    }
}

/**
 * Logout Handler
 */
async function handleLogout() {
    try {
        await fetch(`${AUTH_URL}/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
        console.error('Logout failed:', err);
    } finally {
        accessToken = null;
        currentUser = null;
        window.location.href = '/login.html';
    }
}

/**
 * Escape HTML helper to prevent XSS
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}