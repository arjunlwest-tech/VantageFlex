/**
 * Draftly-inspired 3D Effects Engine
 * Auto-initializes cinematic animations on DOMContentLoaded
 */

const DraftlyEffects = {
  // Configuration
  config: {
    observerThreshold: 0.12,
    staggerDelay: 90,
    tiltMaxAngle: 8,
    magneticMaxOffset: 8,
    magneticRadius: 60,
    parallaxRate: 0.25,
    mobileBreakpoint: 768
  },

  // State
  observer: null,
  rafId: null,
  isMobile: false,

  /**
   * Initialize all effects
   */
  init() {
    try {
      console.log('🎬 Draftly Effects initializing...');
      
      this.isMobile = window.innerWidth < this.config.mobileBreakpoint;
      
      this.initEntranceAnimations();
      this.init3DCardTilt();
      this.initMagneticButtons();
      this.initParallaxScroll();
      this.initImageReveal();
      this.initGlowPulse();
      
      console.log('✨ Draftly Effects ready');
    } catch (err) {
      console.error('Draftly Effects error:', err);
    }
  },

  /**
   * Step 1: Entrance Animations with IntersectionObserver
   */
  initEntranceAnimations() {
    try {
      // Query all target elements using attribute-contains selectors
      const selectors = [
        'section',
        'h1', 'h2', 'h3', 'p',
        'img:not([class*="icon"])',
        '[class*="card"]',
        '[class*="feature"]',
        '[class*="pricing"]',
        '[class*="testimonial"]',
        '[class*="hero"] > *'
      ];
      
      const elements = document.querySelectorAll(selectors.join(', '));
      
      // Add entrance class to all elements
      elements.forEach((el, index) => {
        el.classList.add('draftly-entrance');
        
        // Calculate stagger delay based on parent
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.children).filter(child => 
          child.classList.contains('draftly-entrance')
        ) : [];
        const siblingIndex = siblings.indexOf(el);
        
        el.style.transitionDelay = `${siblingIndex * this.config.staggerDelay}ms`;
      });

      // Create IntersectionObserver
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Small delay for stagger effect
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, parseInt(entry.target.style.transitionDelay) || 0);
            
            // Unobserve after animation
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: this.config.observerThreshold,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe all elements
      elements.forEach(el => this.observer.observe(el));
      
    } catch (err) {
      console.error('Entrance animations error:', err);
    }
  },

  /**
   * Step 2: 3D Card Tilt Effect
   */
  init3DCardTilt() {
    try {
      const selectors = [
        '[class*="card"]',
        '[class*="feature"]',
        '[class*="pricing"]',
        '[class*="box"]',
        '[class*="panel"]'
      ];
      
      const cards = document.querySelectorAll(selectors.join(', '));
      
      cards.forEach(card => {
        card.classList.add('draftly-card');
        
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Calculate center offset
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Map to tilt angle (±8 degrees)
          const rotateX = ((y - centerY) / centerY) * -this.config.tiltMaxAngle;
          const rotateY = ((x - centerX) / centerX) * this.config.tiltMaxAngle;
          
          // Apply transform
          card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          
          // Update light streak position (as percentages)
          const mx = ((x / rect.width) * 100).toFixed(1);
          const my = ((y / rect.height) * 100).toFixed(1);
          card.style.setProperty('--mx', `${mx}%`);
          card.style.setProperty('--my', `${my}%`);
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
          card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          
          // Reset transition after animation completes
          setTimeout(() => {
            card.style.transition = '';
          }, 500);
        });
      });
      
    } catch (err) {
      console.error('3D card tilt error:', err);
    }
  },

  /**
   * Step 3: Magnetic Buttons Effect
   */
  initMagneticButtons() {
    try {
      const selectors = [
        'button',
        'a[class*="btn"]',
        'a[class*="cta"]',
        '[class*="button"]',
        '.btn-primary',
        '.btn-secondary',
        '.nav-cta'
      ];
      
      const buttons = document.querySelectorAll(selectors.join(', '));
      
      buttons.forEach(btn => {
        btn.classList.add('draftly-magnetic');
        
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          
          // Check if mouse is within magnetic radius
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distanceX = e.clientX - centerX;
          const distanceY = e.clientY - centerY;
          const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
          
          if (distance < this.config.magneticRadius) {
            // Calculate magnetic pull (max 8px)
            const pull = 1 - (distance / this.config.magneticRadius);
            const offsetX = (distanceX / this.config.magneticRadius) * this.config.magneticMaxOffset * pull;
            const offsetY = (distanceY / this.config.magneticRadius) * this.config.magneticMaxOffset * pull;
            
            requestAnimationFrame(() => {
              btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
          }
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0, 0)';
        });
      });
      
    } catch (err) {
      console.error('Magnetic buttons error:', err);
    }
  },

  /**
   * Step 4: Scroll Parallax Effect
   */
  initParallaxScroll() {
    try {
      // Skip on mobile
      if (this.isMobile) return;
      
      const selectors = [
        '[class*="hero"] img',
        '[class*="mockup"]',
        '[class*="preview"]',
        '[class*="screenshot"]',
        '.floating-card',
        '.hero-visual'
      ];
      
      const elements = document.querySelectorAll(selectors.join(', '));
      
      elements.forEach(el => {
        el.classList.add('draftly-parallax');
      });
      
      let lastScrollY = 0;
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
          requestAnimationFrame(() => {
            elements.forEach(el => {
              const rate = this.config.parallaxRate;
              const offset = lastScrollY * rate;
              el.style.transform = `translateY(${offset}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
    } catch (err) {
      console.error('Parallax scroll error:', err);
    }
  },

  /**
   * Step 5: Image Blur Reveal
   */
  initImageReveal() {
    try {
      const images = document.querySelectorAll('img:not([class*="icon"]):not([class*="logo"])');
      
      images.forEach(img => {
        img.classList.add('draftly-img-reveal');
      });
      
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, 100);
            imgObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });
      
      images.forEach(img => imgObserver.observe(img));
      
    } catch (err) {
      console.error('Image reveal error:', err);
    }
  },

  /**
   * Step 6: Glow Pulse on CTAs
   */
  initGlowPulse() {
    try {
      const selectors = [
        'button[class*="primary"]',
        'a[class*="primary"]',
        '[class*="cta"]',
        '.btn-primary',
        '.nav-cta'
      ];
      
      const ctas = document.querySelectorAll(selectors.join(', '));
      
      ctas.forEach(cta => {
        // Get computed color and use for glow
        const computedStyle = window.getComputedStyle(cta);
        const bgColor = computedStyle.backgroundColor;
        
        // Extract RGB values
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = rgbMatch[1];
          const g = rgbMatch[2];
          const b = rgbMatch[3];
          
          // Set currentColor for the glow animation via custom property
          cta.style.color = `rgb(${r}, ${g}, ${b})`;
          cta.classList.add('draftly-glow');
          
          // Override the glow animation with actual computed color
          const style = document.createElement('style');
          style.textContent = `
            .draftly-glow {
              animation: draftly-pulse-glow-cta 2s ease-in-out infinite alternate;
            }
            @keyframes draftly-pulse-glow-cta {
              0% {
                box-shadow: 0 0 20px rgba(${r}, ${g}, ${b}, 0.3),
                            0 0 40px rgba(${r}, ${g}, ${b}, 0.2),
                            0 0 60px rgba(${r}, ${g}, ${b}, 0.1);
              }
              100% {
                box-shadow: 0 0 40px rgba(${r}, ${g}, ${b}, 0.5),
                            0 0 80px rgba(${r}, ${g}, ${b}, 0.3),
                            0 0 120px rgba(${r}, ${g}, ${b}, 0.2);
              }
            }
          `;
          document.head.appendChild(style);
        }
      });
      
    } catch (err) {
      console.error('Glow pulse error:', err);
    }
  },

  /**
   * Cleanup method
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
};

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DraftlyEffects.init());
} else {
  DraftlyEffects.init();
}

// Export for global access
window.DraftlyEffects = DraftlyEffects;
