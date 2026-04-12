/**
 * Sound Effects System for Vantage Flex
 * Provides audio feedback for user interactions
 */

const SoundSystem = {
    sounds: {},
    enabled: true,
    volume: 0.3,

    // Initialize sound system
    init() {
        this.loadSounds();
        this.createToggleUI();
        console.log('🔊 Sound system initialized');
    },

    // Load all sound effects
    loadSounds() {
        // Using Web Audio API to generate sounds dynamically
        // This avoids external file dependencies
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    },

    // Generate button click sound
    playClick() {
        if (!this.enabled) return;
        this.playTone(800, 0.05, 'sine', 0.1);
    },

    // Generate success sound
    playSuccess() {
        if (!this.enabled) return;
        // Play ascending tones
        this.playTone(523.25, 0.1, 'sine', 0.15); // C5
        setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.15), 100); // E5
        setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.2), 200); // G5
    },

    // Generate error sound
    playError() {
        if (!this.enabled) return;
        this.playTone(200, 0.2, 'sawtooth', 0.2);
    },

    // Generate workout complete sound
    playWorkoutComplete() {
        if (!this.enabled) return;
        // Victory fanfare
        const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 783.99, 659.25, 783.99, 880.00, 987.77];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 150);
        });
    },

    // Generate quest complete sound
    playQuestComplete() {
        if (!this.enabled) return;
        // Achievement sound
        this.playTone(880, 0.1, 'sine', 0.15);
        setTimeout(() => this.playTone(1100, 0.2, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(880, 0.3, 'sine', 0.25), 300);
    },

    // Generate XP gain sound
    playXPGain() {
        if (!this.enabled) return;
        this.playTone(1000, 0.05, 'sine', 0.1);
        setTimeout(() => this.playTone(1200, 0.08, 'sine', 0.15), 50);
    },

    // Generate timer tick sound
    playTimerTick() {
        if (!this.enabled) return;
        this.playTone(600, 0.02, 'square', 0.05);
    },

    // Generate level up sound
    playLevelUp() {
        if (!this.enabled) return;
        // Epic level up fanfare
        const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.25), i * 200);
        });
    },

    // Generate hover sound (subtle)
    playHover() {
        if (!this.enabled) return;
        this.playTone(400, 0.02, 'sine', 0.03);
    },

    // Play a single tone
    playTone(frequency, duration, type = 'sine', vol = 0.1) {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.value = vol * this.volume;

            oscillator.start();
            
            // Fade out
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio play failed:', e);
        }
    },

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        this.updateToggleUI();
        return this.enabled;
    },

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    },

    // Create sound toggle UI
    createToggleUI() {
        // Check if toggle already exists
        if (document.getElementById('sound-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'sound-toggle';
        toggle.className = 'sound-toggle-btn';
        toggle.innerHTML = '🔊';
        toggle.title = 'Toggle Sound Effects';
        toggle.onclick = () => this.toggle();

        // Add to nav or body
        const nav = document.querySelector('.nav-container');
        if (nav) {
            nav.appendChild(toggle);
        } else {
            document.body.appendChild(toggle);
        }

        this.updateToggleUI();
    },

    // Update toggle button appearance
    updateToggleUI() {
        const toggle = document.getElementById('sound-toggle');
        if (toggle) {
            toggle.innerHTML = this.enabled ? '🔊' : '🔇';
            toggle.classList.toggle('muted', !this.enabled);
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SoundSystem.init();
});

// Export for global access
window.SoundSystem = SoundSystem;
