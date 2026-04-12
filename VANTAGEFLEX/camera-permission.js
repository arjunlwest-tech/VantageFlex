/**
 * Camera Permission Manager for Vantage Flex
 * Handles camera permission requests with user-friendly prompts
 */

const CameraPermission = {
    status: 'prompt', // 'prompt', 'granted', 'denied', 'unknown'
    
    // Initialize permission check
    async init() {
        this.status = await this.checkPermission();
        console.log('📷 Camera permission status:', this.status);
    },
    
    // Check current permission state
    async checkPermission() {
        try {
            // Check if permissions API is supported
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'camera' });
                return result.state; // 'granted', 'denied', or 'prompt'
            }
            return 'unknown';
        } catch (e) {
            console.log('Permission check error:', e);
            return 'unknown';
        }
    },
    
    // Request camera permission with user-friendly prompt
    async requestPermission() {
        // Show custom permission modal
        const granted = await this.showPermissionModal();
        
        if (!granted) {
            return false;
        }
        
        try {
            // Actually request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' },
                audio: false 
            });
            
            // Immediately stop the stream - we just wanted permission
            stream.getTracks().forEach(track => track.stop());
            
            this.status = 'granted';
            return true;
        } catch (err) {
            console.error('Camera permission denied:', err);
            this.status = 'denied';
            this.showPermissionDeniedModal();
            return false;
        }
    },
    
    // Show custom permission request modal
    showPermissionModal() {
        return new Promise((resolve) => {
            // Remove existing modal
            const existing = document.getElementById('camera-permission-modal');
            if (existing) existing.remove();
            
            const modal = document.createElement('div');
            modal.id = 'camera-permission-modal';
            modal.className = 'permission-modal active';
            modal.innerHTML = `
                <div class="permission-modal-overlay"></div>
                <div class="permission-modal-content">
                    <div class="permission-icon">📷</div>
                    <h2 class="permission-title">Camera Access Required</h2>
                    <p class="permission-description">
                        To verify your quest completion using AI pose detection, 
                        we need access to your camera. Your video is processed locally 
                        and is never stored or sent to any server.
                    </p>
                    <div class="permission-benefits">
                        <div class="permission-benefit">
                            <span class="benefit-icon">🔒</span>
                            <span>Private & Secure</span>
                        </div>
                        <div class="permission-benefit">
                            <span class="benefit-icon">⚡</span>
                            <span>Real-time AI Detection</span>
                        </div>
                        <div class="permission-benefit">
                            <span class="benefit-icon">🎯</span>
                            <span>Accurate Rep Counting</span>
                        </div>
                    </div>
                    <div class="permission-buttons">
                        <button class="btn btn-secondary" id="permission-deny">
                            Not Now
                        </button>
                        <button class="btn btn-primary" id="permission-grant">
                            <span>📷</span> Allow Camera Access
                        </button>
                    </div>
                    <p class="permission-note">
                        You can change this anytime in your browser settings
                    </p>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Handle buttons
            modal.querySelector('#permission-grant').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            modal.querySelector('#permission-deny').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            modal.querySelector('.permission-modal-overlay').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            // Play sound if enabled
            if (window.SoundSystem) SoundSystem.playClick();
        });
    },
    
    // Show permission denied modal with help
    showPermissionDeniedModal() {
        const existing = document.getElementById('camera-denied-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'camera-denied-modal';
        modal.className = 'permission-modal active';
        modal.innerHTML = `
            <div class="permission-modal-overlay"></div>
            <div class="permission-modal-content">
                <div class="permission-icon" style="color: #ff6b35;">⚠️</div>
                <h2 class="permission-title">Camera Access Blocked</h2>
                <p class="permission-description">
                    Camera access was denied. To complete camera-verified quests, 
                    please enable camera access in your browser settings.
                </p>
                <div class="permission-help">
                    <h3>How to enable:</h3>
                    <ol>
                        <li>Click the 🔒 icon in your browser's address bar</li>
                        <li>Find "Camera" or "Permissions"</li>
                        <li>Change to "Allow"</li>
                        <li>Refresh the page</li>
                    </ol>
                </div>
                <div class="permission-buttons">
                    <button class="btn btn-secondary" onclick="this.closest('.permission-modal').remove()">
                        Close
                    </button>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <span>🔄</span> Refresh Page
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (window.SoundSystem) SoundSystem.playError();
    },
    
    // Verify permission before starting quest
    async verifyBeforeQuest() {
        // Check current status
        const status = await this.checkPermission();
        
        if (status === 'granted') {
            return true;
        }
        
        if (status === 'denied') {
            this.showPermissionDeniedModal();
            return false;
        }
        
        // Status is 'prompt' or 'unknown' - request permission
        return await this.requestPermission();
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    CameraPermission.init();
});

// Export for global access
window.CameraPermission = CameraPermission;
