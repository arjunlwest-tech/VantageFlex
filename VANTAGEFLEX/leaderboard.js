/**
 * Leaderboard Page Logic
 */

function initLeaderboardPage() {
    loadUserStats();
    loadLeaderboard();
    initUsernameEdit();
    initFilterButtons();
}

function loadUserStats() {
    const stats = VantageFlex.UserState.getStats();
    const xp = stats.xp || 0;
    const levelData = VantageFlex.XP_SYSTEM.getLevel(xp);
    const rank = VantageFlex.XP_SYSTEM.getRank(levelData.level);
    const userRank = VantageFlex.Leaderboard.getUserRank();
    
    // Update display
    document.getElementById('user-level').textContent = `Level ${levelData.level}`;
    document.getElementById('user-rank-title').textContent = rank.name;
    document.getElementById('user-rank-title').style.color = rank.color;
    document.getElementById('user-rank').textContent = `#${userRank}`;
    document.getElementById('user-total-xp').textContent = xp.toLocaleString();
    document.getElementById('user-streak').textContent = (stats.streak || 0).toString();
    document.getElementById('user-quests').textContent = (stats.questsCompleted || 0).toString();
    document.getElementById('user-workouts').textContent = (stats.workoutsCompleted || 0).toString();
    
    // Set username
    if (stats.username) {
        document.getElementById('username-input').value = stats.username;
    }
    
    // Set avatar based on rank
    const avatars = {
        'Legend': '👑',
        'Elite': '🔥',
        'Pro': '💎',
        'Advanced': '⚡',
        'Intermediate': '🌟',
        'Beginner': '⭐'
    };
    document.getElementById('user-avatar').textContent = avatars[rank.name] || '🫵';
}

function loadLeaderboard() {
    const leaderboard = VantageFlex.Leaderboard.getGlobalLeaderboard();
    const container = document.getElementById('leaderboard-rows');
    
    container.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const isUser = entry.isUser;
        const rank = index + 1;
        const levelData = VantageFlex.XP_SYSTEM.getLevel(entry.xp);
        const rankTitle = VantageFlex.XP_SYSTEM.getRank(levelData.level);
        
        const row = document.createElement('div');
        row.className = `flex items-center py-4 px-4 border-b border-white/5 ${isUser ? 'bg-orange-500/10' : ''}`;
        
        // Rank styling
        let rankDisplay = rank;
        let rankStyle = '';
        if (rank === 1) {
            rankDisplay = '🥇';
            rankStyle = 'font-size: 24px;';
        } else if (rank === 2) {
            rankDisplay = '🥈';
            rankStyle = 'font-size: 24px;';
        } else if (rank === 3) {
            rankDisplay = '🥉';
            rankStyle = 'font-size: 24px;';
        }
        
        row.innerHTML = `
            <div style="width: 60px; font-weight: 900; ${rankStyle}">${rankDisplay}</div>
            <div style="flex: 1; display: flex; align-items: center; gap: var(--space-md);">
                <div style="font-size: 32px;">${entry.avatar}</div>
                <div>
                    <div class="font-bold ${isUser ? 'text-orange-500' : ''}">${entry.name} ${isUser ? '(You)' : ''}</div>
                    <div class="text-xs" style="color: ${rankTitle.color};">${rankTitle.name}</div>
                </div>
            </div>
            <div style="width: 100px; text-align: center;">
                <span class="badge badge-gold">${levelData.level}</span>
            </div>
            <div style="width: 100px; text-align: center;">
                <span style="color: ${entry.streak > 0 ? '#ff6b35' : 'var(--text-muted)'};">
                    ${entry.streak > 0 ? '🔥 ' + entry.streak : '-'}
                </span>
            </div>
            <div style="width: 120px; text-align: right; font-weight: 700; ${isUser ? 'color: var(--primary-gold);' : ''}">
                ${entry.xp.toLocaleString()}
            </div>
        `;
        
        container.appendChild(row);
    });
}

function initUsernameEdit() {
    const input = document.getElementById('username-input');
    const saveBtn = document.getElementById('save-username-btn');
    
    saveBtn.addEventListener('click', () => {
        const newName = input.value.trim();
        if (newName) {
            VantageFlex.Leaderboard.updateUsername(newName);
            VantageFlex.showToast('Username saved!', 'success');
            loadLeaderboard(); // Refresh to show new name
        }
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
}

function initFilterButtons() {
    const buttons = document.querySelectorAll('[data-filter]');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            if (filter === 'monthly') {
                // For demo, just shuffle and show different data
                VantageFlex.LEADERBOARD_DATA.sort(() => Math.random() - 0.5);
            }
            
            loadLeaderboard();
        });
    });
}

document.addEventListener('DOMContentLoaded', initLeaderboardPage);
