/**
 * Workout Timer System for Vantage Flex
 * Provides timer functionality for workout sessions
 */

const WorkoutTimer = {
    seconds: 0,
    isRunning: false,
    interval: null,
    
    // Initialize timer
    init() {
        this.createTimerUI();
        this.setupEventListeners();
        console.log('⏱️ Workout timer initialized');
    },
    
    // Create timer UI
    createTimerUI() {
        // Check if timer already exists
        if (document.getElementById('workout-timer-widget')) return;
        
        const timerHTML = `
            <div id="workout-timer-widget" class="card mb-8 animate-fade-in">
                <div class="card-header">
                    <h2 class="card-title">
                        <span>⏱️</span> Workout Timer
                    </h2>
                    <span class="badge badge-primary">Track Session</span>
                </div>
                <div class="workout-timer">
                    <div class="timer-display" id="timer-display">00:00:00</div>
                    <div class="timer-label">Session Time</div>
                    <div class="timer-controls">
                        <button class="timer-btn" id="timer-start" title="Start">
                            <span>▶️</span>
                        </button>
                        <button class="timer-btn" id="timer-pause" title="Pause">
                            <span>⏸️</span>
                        </button>
                        <button class="timer-btn" id="timer-reset" title="Reset">
                            <span>🔄</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to dashboard if on dashboard page
        const dashboardContainer = document.querySelector('.page-content .container');
        if (dashboardContainer) {
            const motivationCard = dashboardContainer.querySelector('.card:has(.motivation-card)');
            if (motivationCard) {
                motivationCard.insertAdjacentHTML('beforebegin', timerHTML);
            }
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.timer-btn');
            if (!target) return;
            
            const id = target.id;
            
            if (id === 'timer-start') this.start();
            else if (id === 'timer-pause') this.pause();
            else if (id === 'timer-reset') this.reset();
        });
    },
    
    // Start timer
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const startBtn = document.getElementById('timer-start');
        if (startBtn) startBtn.classList.add('active');
        
        if (window.SoundSystem) SoundSystem.playClick();
        
        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
            
            // Play tick sound every minute
            if (this.seconds % 60 === 0 && window.SoundSystem) {
                SoundSystem.playTimerTick();
            }
        }, 1000);
    },
    
    // Pause timer
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
        
        const startBtn = document.getElementById('timer-start');
        if (startBtn) startBtn.classList.remove('active');
        
        if (window.SoundSystem) SoundSystem.playClick();
    },
    
    // Reset timer
    reset() {
        this.pause();
        this.seconds = 0;
        this.updateDisplay();
        
        if (window.SoundSystem) SoundSystem.playClick();
    },
    
    // Update display
    updateDisplay() {
        const display = document.getElementById('timer-display');
        if (display) {
            display.textContent = this.formatTime(this.seconds);
        }
    },
    
    // Format seconds to HH:MM:SS
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    },
    
    // Pad single digits
    pad(num) {
        return num.toString().padStart(2, '0');
    },
    
    // Get current time in seconds
    getTime() {
        return this.seconds;
    },
    
    // Check if running
    isActive() {
        return this.isRunning;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on dashboard page
    if (document.querySelector('.page-content .container')) {
        WorkoutTimer.init();
    }
});

// Export for global access
window.WorkoutTimer = WorkoutTimer;
