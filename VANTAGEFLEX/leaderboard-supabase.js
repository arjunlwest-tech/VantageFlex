/**
 * Global Leaderboard System with Supabase
 * Real-time rankings and achievements
 */

const LeaderboardSystem = {
    leaderboardData: [],
    currentUserRank: null,
    realtimeSubscription: null,

    async init() {
        this.setupUI();
        await this.loadLeaderboard();
        this.setupRealtimeUpdates();
        
        // Listen for auth
        window.addEventListener('auth:ready', () => {
            this.highlightCurrentUser();
        });
    },

    setupUI() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        container.innerHTML = `
            <div class="leaderboard-header">
                <div class="time-filter">
                    <button class="filter-btn active" data-period="all">All Time</button>
                    <button class="filter-btn" data-period="month">This Month</button>
                    <button class="filter-btn" data-period="week">This Week</button>
                </div>
            </div>
            <div class="leaderboard-podium" id="podium"></div>
            <div class="leaderboard-list" id="leaderboard-list"></div>
            <div class="leaderboard-loading" id="loading-indicator">
                <div class="spinner-dots"><div></div><div></div><div></div></div>
            </div>
        `;

        // Setup filter buttons
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadLeaderboard(e.target.dataset.period);
            });
        });
    },

    async loadLeaderboard(period = 'all') {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) loadingEl.style.display = 'flex';

        let query = window.supabaseClient
            .from('leaderboard')
            .select('*')
            .order('total_xp', { ascending: false })
            .limit(100);

        // Apply time filters
        if (period === 'week') {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('updated_at', weekAgo);
        } else if (period === 'month') {
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('updated_at', monthAgo);
        }

        const { data, error } = await query;

        if (loadingEl) loadingEl.style.display = 'none';

        if (error) {
            console.error('Leaderboard error:', error);
            this.renderEmptyState();
            return;
        }

        this.leaderboardData = data || [];
        this.renderLeaderboard();
    },

    renderLeaderboard() {
        this.renderPodium();
        this.renderList();
    },

    renderPodium() {
        const podium = document.getElementById('podium');
        if (!podium || this.leaderboardData.length < 3) return;

        const top3 = this.leaderboardData.slice(0, 3);
        
        podium.innerHTML = `
            <div class="podium-container">
                <div class="podium-item second">
                    <div class="podium-avatar">
                        <img src="${top3[1]?.avatar_url || this.getDefaultAvatar(top3[1]?.username)}" alt="${top3[1]?.username}">
                        <div class="rank-badge">2</div>
                    </div>
                    <div class="podium-info">
                        <span class="podium-name">${top3[1]?.username || 'TBD'}</span>
                        <span class="podium-xp">${this.formatXP(top3[1]?.total_xp || 0)} XP</span>
                    </div>
                    <div class="podium-bar" style="height: 140px;"></div>
                </div>
                
                <div class="podium-item first">
                    <div class="podium-avatar">
                        <img src="${top3[0]?.avatar_url || this.getDefaultAvatar(top3[0]?.username)}" alt="${top3[0]?.username}">
                        <div class="crown">👑</div>
                        <div class="rank-badge gold">1</div>
                    </div>
                    <div class="podium-info">
                        <span class="podium-name">${top3[0]?.username || 'TBD'}</span>
                        <span class="podium-xp">${this.formatXP(top3[0]?.total_xp || 0)} XP</span>
                    </div>
                    <div class="podium-bar gold" style="height: 200px;"></div>
                </div>
                
                <div class="podium-item third">
                    <div class="podium-avatar">
                        <img src="${top3[2]?.avatar_url || this.getDefaultAvatar(top3[2]?.username)}" alt="${top3[2]?.username}">
                        <div class="rank-badge">3</div>
                    </div>
                    <div class="podium-info">
                        <span class="podium-name">${top3[2]?.username || 'TBD'}</span>
                        <span class="podium-xp">${this.formatXP(top3[2]?.total_xp || 0)} XP</span>
                    </div>
                    <div class="podium-bar" style="height: 100px;"></div>
                </div>
            </div>
        `;
    },

    renderList() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        const currentUser = window.AuthManager?.getCurrentUser();
        const currentUserId = currentUser?.id;

        // Show ranks 4-50
        const listData = this.leaderboardData.slice(3, 50);
        
        list.innerHTML = listData.map((entry, index) => {
            const rank = index + 4;
            const isCurrentUser = entry.user_id === currentUserId;
            
            return `
                <div class="leaderboard-row ${isCurrentUser ? 'current-user' : ''} ${rank <= 10 ? 'top-ten' : ''}">
                    <div class="rank">${rank}</div>
                    <div class="user-info">
                        <img class="avatar" src="${entry.avatar_url || this.getDefaultAvatar(entry.username)}" alt="${entry.username}">
                        <span class="username">${entry.username}</span>
                        ${isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
                    </div>
                    <div class="xp-bar-container">
                        <div class="xp-bar" style="width: ${Math.min((entry.total_xp / this.leaderboardData[0]?.total_xp) * 100, 100)}%"></div>
                    </div>
                    <div class="xp">${this.formatXP(entry.total_xp)}</div>
                    <div class="level">Lvl ${this.calculateLevel(entry.total_xp)}</div>
                </div>
            `;
        }).join('');

        // If user not in top 50, show their position
        if (currentUserId && !this.leaderboardData.find(e => e.user_id === currentUserId)) {
            this.showUserPosition(currentUserId);
        }
    },

    async showUserPosition(userId) {
        // Get user's rank
        const { data: userEntry } = await window.supabaseClient
            .from('leaderboard')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!userEntry) return;

        // Count users with more XP
        const { count } = await window.supabaseClient
            .from('leaderboard')
            .select('*', { count: 'exact' })
            .gt('total_xp', userEntry.total_xp);

        const rank = (count || 0) + 1;

        const list = document.getElementById('leaderboard-list');
        if (list) {
            list.innerHTML += `
                <div class="leaderboard-divider">...</div>
                <div class="leaderboard-row current-user">
                    <div class="rank">${rank}</div>
                    <div class="user-info">
                        <img class="avatar" src="${userEntry.avatar_url || this.getDefaultAvatar(userEntry.username)}" alt="${userEntry.username}">
                        <span class="username">${userEntry.username}</span>
                        <span class="you-badge">YOU</span>
                    </div>
                    <div class="xp-bar-container">
                        <div class="xp-bar" style="width: ${Math.min((userEntry.total_xp / this.leaderboardData[0]?.total_xp) * 100, 100)}%"></div>
                    </div>
                    <div class="xp">${this.formatXP(userEntry.total_xp)}</div>
                    <div class="level">Lvl ${this.calculateLevel(userEntry.total_xp)}</div>
                </div>
            `;
        }
    },

    getDefaultAvatar(username) {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'guest'}&backgroundColor=b6e3f4`;
    },

    formatXP(xp) {
        if (xp >= 1000000) return (xp / 1000000).toFixed(1) + 'M';
        if (xp >= 1000) return (xp / 1000).toFixed(1) + 'K';
        return xp.toString();
    },

    calculateLevel(xp) {
        return Math.floor(xp / 1000) + 1;
    },

    setupRealtimeUpdates() {
        // Subscribe to leaderboard changes
        this.realtimeSubscription = window.supabaseClient
            .channel('leaderboard_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'leaderboard' },
                (payload) => {
                    console.log('Leaderboard update:', payload);
                    this.loadLeaderboard();
                }
            )
            .subscribe();
    },

    highlightCurrentUser() {
        const currentUser = window.AuthManager?.getCurrentUser();
        if (!currentUser) return;

        document.querySelectorAll('.leaderboard-row').forEach(row => {
            if (row.querySelector('.you-badge')) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('highlight');
                setTimeout(() => row.classList.remove('highlight'), 2000);
            }
        });
    },

    renderEmptyState() {
        const container = document.getElementById('leaderboard-container');
        if (container) {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <div class="empty-icon">🏆</div>
                    <h3>No Rankings Yet</h3>
                    <p>Be the first to complete quests and earn XP!</p>
                    <a href="quests.html" class="btn btn-primary">Start Earning XP</a>
                </div>
            `;
        }
    },

    destroy() {
        if (this.realtimeSubscription) {
            this.realtimeSubscription.unsubscribe();
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('leaderboard-container')) {
        // Wait for Supabase to be ready
        const initLeaderboard = () => {
            if (window.supabaseClient) {
                LeaderboardSystem.init();
            } else {
                setTimeout(initLeaderboard, 100);
            }
        };
        initLeaderboard();
    }
});

window.LeaderboardSystem = LeaderboardSystem;
