/**
 * Advanced Animation Controller for Vantage Flex
 * Adds dynamic animations to elements
 */

const AnimationController = {
    init() {
        this.initScrollReveal();
        this.initHoverEffects();
        this.initCursorTrail();
        this.initRandomAnimations();
        this.initParallax();
        this.initConfetti();
    },

    // Scroll reveal - elements animate in when scrolling
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .card, .stat-card, .motivation-card');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add stagger delay
                    setTimeout(() => {
                        entry.target.classList.add('animate-fade-in-up');
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(el);
        });
    },

    // Enhanced hover effects
    initHoverEffects() {
        // Cards lift on hover
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('card-hover-lift');
        });

        // Buttons get press effect
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('btn-press');
            
            // Add click burst
            btn.addEventListener('click', (e) => {
                this.createParticleBurst(e.clientX, e.clientY);
            });
        });

        // Nav links get subtle glow
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.textShadow = '0 0 10px var(--primary-orange)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.textShadow = 'none';
            });
        });
    },

    // Cursor trail effect
    initCursorTrail() {
        let throttle = false;
        
        document.addEventListener('mousemove', (e) => {
            if (throttle) return;
            throttle = true;
            
            setTimeout(() => {
                const trail = document.createElement('div');
                trail.className = 'cursor-trail';
                trail.style.left = e.clientX + 'px';
                trail.style.top = e.clientY + 'px';
                document.body.appendChild(trail);
                
                setTimeout(() => trail.remove(), 500);
                throttle = false;
            }, 50);
        });
    },

    // Random ambient animations
    initRandomAnimations() {
        // Randomly animate badges
        setInterval(() => {
            const badges = document.querySelectorAll('.badge');
            const randomBadge = badges[Math.floor(Math.random() * badges.length)];
            if (randomBadge) {
                randomBadge.classList.add('animate-breathe');
                setTimeout(() => randomBadge.classList.remove('animate-breathe'), 3000);
            }
        }, 5000);

        // Random fire particles on hero
        const hero = document.querySelector('.heading-hero');
        if (hero) {
            setInterval(() => {
                this.createFireParticle(hero);
            }, 2000);
        }
    },

    // Create fire particle
    createFireParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'fire-particle';
        particle.style.left = Math.random() * container.offsetWidth + 'px';
        particle.style.top = container.offsetHeight + 'px';
        container.style.position = 'relative';
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    },

    // Particle burst on click
    createParticleBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: var(--primary-orange);
                border-radius: 50%;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                z-index: 10000;
            `;
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            document.body.appendChild(particle);
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    },

    // Parallax scrolling
    initParallax() {
        const parallaxElements = document.querySelectorAll('.animated-bg, .grid-overlay');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            parallaxElements.forEach((el, index) => {
                const speed = 0.5 + (index * 0.1);
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    },

    // Confetti on success
    initConfetti() {
        window.fireConfetti = (x, y) => {
            const colors = ['#ff6b35', '#e63946', '#ffd700', '#ff006e', '#22c55e'];
            
            for (let i = 0; i < 30; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    left: ${x || window.innerWidth / 2}px;
                    top: ${y || window.innerHeight / 2}px;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    pointer-events: none;
                    z-index: 10000;
                `;
                
                const angle = (Math.random() * Math.PI * 2);
                const velocity = 200 + Math.random() * 200;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity - 200;
                const rotation = Math.random() * 720;
                
                document.body.appendChild(confetti);
                
                confetti.animate([
                    { 
                        transform: `translate(0, 0) rotate(0deg)`, 
                        opacity: 1 
                    },
                    { 
                        transform: `translate(${vx}px, ${vy + 400}px) rotate(${rotation}deg)`, 
                        opacity: 0 
                    }
                ], {
                    duration: 1500 + Math.random() * 1000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => confetti.remove();
            }
        };
    },

    // Wave text animation helper
    waveText(element) {
        const text = element.textContent;
        element.innerHTML = '';
        element.classList.add('wave-text');
        
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${i * 0.1}s`;
            element.appendChild(span);
        });
    },

    // Glitch effect on text
    glitchText(element) {
        element.classList.add('animate-glitch');
        setTimeout(() => element.classList.remove('animate-glitch'), 400);
    },

    // Neon flicker effect
    neonFlicker(element) {
        element.classList.add('animate-neon-flicker');
        setTimeout(() => element.classList.remove('animate-neon-flicker'), 2000);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AnimationController.init();
});

// Export for global access
window.AnimationController = AnimationController;
