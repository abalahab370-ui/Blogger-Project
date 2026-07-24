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
 * Main Initializer called by profile.html (<script>initProfileHub();</script>)
 */
async function initProfileHub() {
    const token = await refreshSession();
    if (!token) return;

    updateHeaderUI();
    setupEventListeners();
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
 * Updates Header User Info & Profile Title
 */
function updateHeaderUI() {
    const greeting = document.getElementById('userGreeting');
    const badge = document.getElementById('userRoleBadge');
    const profileHeaderName = document.getElementById('profileHeaderName');

    if (greeting) greeting.innerText = currentUser.username;
    if (profileHeaderName) profileHeaderName.innerText = `${currentUser.username}'s Articles`;

    if (badge) {
        const isAdmin = parseInt(currentUser.roles) === 2020;

        badge.innerText = isAdmin ? 'Administrator' : 'Contributor';
        badge.className = `text-[10px] uppercase font-mono tracking-wider ${isAdmin ? 'text-purple-600 font-bold' : 'text-gray-400'}`;
    }
}

/**
 * Attach Search and Logout event listeners
 */
function setupEventListeners() {

    const searchBar = document.getElementById('searchBar');
    const logoutBtn = document.getElementById('logoutBtn');

    // Live Search Input for Personal Posts
    searchBar?.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            fetchAndRenderPosts(e.target.value.trim());
        }, 300);
    });

    logoutBtn?.addEventListener('click', handleLogout);
}

/**
 * Fetches user's own posts from GET /api/post?author=username
 */
async function fetchAndRenderPosts(searchQuery = '') {
    const feedContainer = document.getElementById('dynamicFeed');
    feedContainer.innerHTML = `<div class="text-center py-6 text-xs text-gray-400">Loading your articles...</div>`;

    try {
        // Query param passes author along with search
        let endpoint = `${POST_URL}?author=${encodeURIComponent(currentUser.username)}`;
        if (searchQuery) {
            endpoint += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!res.ok) throw new Error('Could not fetch articles');

        const posts = await res.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            feedContainer.innerHTML = `
                <div class="bg-white p-6 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
                    ${searchQuery ? `No articles matching "${escapeHTML(searchQuery)}"` : 'You have not published any articles yet.'}
                </div>`;
            return;
        }

        // Render user's personal posts with Delete buttons enabled
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

                        <!-- Owner Delete Button -->
                        <button onclick="handleDeletePost('${post._id}')" 
                                class="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer transition px-2 py-0.5 rounded hover:bg-red-50 border border-gray-200 hover:border-red-200">
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-gray-900 leading-snug">${escapeHTML(post.title)}</h3>
                    <p class="text-xs text-gray-500 mt-0.5">By <span class="font-medium text-gray-700">@${escapeHTML(post.author || currentUser.username)}</span></p>
                </div>

                <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">${escapeHTML(post.content)}</p>
            </article>
        `).join('');

    } catch (err) {
        console.error('Profile Feed error:', err);
        feedContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs text-center">
                Failed to load your articles.
            </div>`;
    }
}

/**
 * User Post Deletion Request
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

        // Re-fetch personal posts
        fetchAndRenderPosts();

    } catch (err) {
        alert(`Error deleting post: ${err.message}`);
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