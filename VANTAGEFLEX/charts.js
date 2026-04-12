/**
 * Progress Charts System for Vantage Flex
 * Visualizes workout data with charts and graphs
 */

const ProgressCharts = {
    // Initialize charts
    init() {
        this.createChartsUI();
        this.renderWeeklyProgress();
        this.renderGoalProgress();
        console.log('📊 Progress charts initialized');
    },
    
    // Create charts UI
    createChartsUI() {
        // Check if charts already exist
        if (document.getElementById('progress-charts')) return;
        
        const chartsHTML = `
            <div id="progress-charts" class="grid-2 mb-8" style="align-items: start;">
                <div class="card animate-fade-in stagger-1">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span>📈</span> Weekly Activity
                        </h2>
                        <span class="badge badge-info">7 Days</span>
                    </div>
                    <div class="weekly-progress" id="weekly-bars">
                        <div class="weekly-bar" style="height: 40%;" data-day="Mon"></div>
                        <div class="weekly-bar" style="height: 60%;" data-day="Tue"></div>
                        <div class="weekly-bar" style="height: 80%;" data-day="Wed"></div>
                        <div class="weekly-bar" style="height: 30%;" data-day="Thu"></div>
                        <div class="weekly-bar" style="height: 90%;" data-day="Fri"></div>
                        <div class="weekly-bar" style="height: 70%;" data-day="Sat"></div>
                        <div class="weekly-bar today" style="height: 50%;" data-day="Sun"></div>
                    </div>
                    <div class="weekly-labels">
                        <span class="weekly-label">Mon</span>
                        <span class="weekly-label">Tue</span>
                        <span class="weekly-label">Wed</span>
                        <span class="weekly-label">Thu</span>
                        <span class="weekly-label">Fri</span>
                        <span class="weekly-label">Sat</span>
                        <span class="weekly-label">Sun</span>
                    </div>
                </div>
                
                <div class="card animate-fade-in stagger-2">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span>🎯</span> Goal Progress
                        </h2>
                        <span class="badge badge-primary">Monthly</span>
                    </div>
                    <div style="display: flex; justify-content: center; padding: var(--space-lg);">
                        <div class="progress-ring-container">
                            <svg class="progress-ring" width="140" height="140">
                                <circle class="progress-ring-bg" cx="70" cy="70" r="60" stroke-width="10"></circle>
                                <circle class="progress-ring-fill" cx="70" cy="70" r="60" stroke-width="10" 
                                    stroke-dasharray="377" stroke-dashoffset="94" id="goal-ring"></circle>
                            </svg>
                            <div class="progress-ring-text">
                                <div class="progress-ring-value" id="goal-percent">75%</div>
                                <div class="progress-ring-label">Complete</div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: var(--space-md);">
                        <div class="text-small text-muted">12 of 16 workouts completed</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to dashboard
        const container = document.querySelector('.page-content .container');
        if (container) {
            const statCards = container.querySelector('.grid-3');
            if (statCards) {
                statCards.insertAdjacentHTML('afterend', chartsHTML);
            }
        }
    },
    
    // Render weekly progress bars based on actual data
    renderWeeklyProgress() {
        const bars = document.querySelectorAll('.weekly-bar');
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Get workout data from localStorage
        const savedWorkouts = VantageFlex?.Storage?.get('savedWorkouts', []) || [];
        
        // Group workouts by day
        const workoutsByDay = {};
        dayNames.forEach(day => workoutsByDay[day] = 0);
        
        savedWorkouts.forEach(workout => {
            if (workout.date) {
                const date = new Date(workout.date);
                const dayName = dayNames[date.getDay()];
                workoutsByDay[dayName]++;
            }
        });
        
        // Update bars
        bars.forEach((bar, index) => {
            const dayName = dayNames[(index + 1) % 7]; // Start from Monday
            const count = workoutsByDay[dayName] || 0;
            const height = Math.min(100, Math.max(10, count * 20 + 10));
            
            bar.style.height = `${height}%`;
            bar.setAttribute('title', `${dayName}: ${count} workouts`);
            
            // Highlight today
            const currentDayName = dayNames[today];
            if (dayName === currentDayName) {
                bar.classList.add('today');
            }
        });
    },
    
    // Update goal progress
    renderGoalProgress() {
        const savedWorkouts = VantageFlex?.Storage?.get('savedWorkouts', []) || [];
        const thisMonth = new Date().getMonth();
        
        // Count workouts this month
        const monthlyWorkouts = savedWorkouts.filter(w => {
            if (!w.date) return false;
            const date = new Date(w.date);
            return date.getMonth() === thisMonth;
        }).length;
        
        const goal = 16; // Monthly goal
        const percent = Math.min(100, Math.round((monthlyWorkouts / goal) * 100));
        
        // Update progress ring
        const ring = document.getElementById('goal-ring');
        const percentEl = document.getElementById('goal-percent');
        
        if (ring) {
            const circumference = 2 * Math.PI * 60;
            const offset = circumference - (percent / 100) * circumference;
            ring.style.strokeDashoffset = offset;
        }
        
        if (percentEl) {
            percentEl.textContent = `${percent}%`;
        }
        
        // Update text
        const textEl = document.querySelector('.progress-ring-container + div .text-small');
        if (textEl) {
            textEl.textContent = `${monthlyWorkouts} of ${goal} workouts this month`;
        }
    },
    
    // Animate charts on load
    animate() {
        const bars = document.querySelectorAll('.weekly-bar');
        bars.forEach((bar, i) => {
            const finalHeight = bar.style.height;
            bar.style.height = '0%';
            setTimeout(() => {
                bar.style.height = finalHeight;
            }, i * 100);
        });
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard page
    if (document.querySelector('.page-content .container')) {
        // Wait a bit for other elements to load
        setTimeout(() => {
            ProgressCharts.init();
            setTimeout(() => ProgressCharts.animate(), 500);
        }, 100);
    }
});

// Export for global access
window.ProgressCharts = ProgressCharts;
