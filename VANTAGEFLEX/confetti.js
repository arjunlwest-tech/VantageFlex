/**
 * Confetti Celebration System for Vantage Flex
 * Visual reward effects for achievements and milestones
 */

const ConfettiSystem = {
    colors: ['#ff6b35', '#ffd700', '#ff006e', '#00d4ff', '#7c3aed', '#10b981'],
    particles: [],
    isActive: false,
    
    // Initialize
    init() {
        this.createCanvas();
        console.log('🎉 Confetti system initialized');
    },
    
    // Create canvas element
    createCanvas() {
        if (document.getElementById('confetti-canvas')) return;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
        `;
        document.body.appendChild(canvas);
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    },
    
    // Resize canvas
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    // Create a single confetti particle
    createParticle(x, y, type = 'confetti') {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const particle = {
            x: x || Math.random() * this.canvas.width,
            y: y || -20,
            color: color,
            size: Math.random() * 8 + 4,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            opacity: 1,
            type: type
        };
        
        if (type === 'firework') {
            particle.speedX = Math.random() * 10 - 5;
            particle.speedY = Math.random() * 10 - 5;
            particle.gravity = 0.2;
            particle.drag = 0.96;
        }
        
        return particle;
    },
    
    // Burst from center
    burst(amount = 100) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < amount; i++) {
            this.particles.push(this.createParticle(centerX, centerY, 'firework'));
        }
        
        this.start();
    },
    
    // Rain from top
    rain(amount = 50) {
        for (let i = 0; i < amount; i++) {
            this.particles.push(this.createParticle(null, -Math.random() * 100));
        }
        
        this.start();
    },
    
    // Side burst (for button clicks)
    sideBurst(x, y, amount = 30) {
        for (let i = 0; i < amount; i++) {
            const particle = this.createParticle(x, y, 'firework');
            particle.speedX = (Math.random() * 8 - 4);
            particle.speedY = (Math.random() * -8 - 2);
            this.particles.push(particle);
        }
        
        this.start();
    },
    
    // Celebration for achievements
    celebrate(achievement = 'default') {
        switch(achievement) {
            case 'quest':
                this.burst(150);
                break;
            case 'level':
                this.rain(80);
                setTimeout(() => this.burst(100), 500);
                break;
            case 'workout':
                this.rain(40);
                break;
            case 'streak':
                this.burst(200);
                break;
            default:
                this.burst(100);
        }
    },
    
    // Start animation loop
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
    },
    
    // Animation loop
    animate() {
        if (!this.isActive) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            // Update position
            if (particle.type === 'firework') {
                particle.speedX *= particle.drag;
                particle.speedY *= particle.drag;
                particle.speedY += particle.gravity;
            }
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += particle.rotationSpeed;
            particle.opacity -= 0.005;
            
            // Draw particle
            if (particle.opacity > 0) {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate((particle.rotation * Math.PI) / 180);
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.fillStyle = particle.color;
                
                if (particle.type === 'firework') {
                    this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                } else {
                    // Draw confetti shape (rounded rectangle)
                    this.ctx.beginPath();
                    this.ctx.roundRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6, 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
                
                // Keep particle if still visible and on screen
                return particle.opacity > 0 && particle.y < this.canvas.height + 50;
            }
            
            return false;
        });
        
        // Stop if no particles left
        if (this.particles.length === 0) {
            this.isActive = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        requestAnimationFrame(() => this.animate());
    },
    
    // Clear all particles
    clear() {
        this.particles = [];
        this.isActive = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    ConfettiSystem.init();
});

// Export
window.ConfettiSystem = ConfettiSystem;
