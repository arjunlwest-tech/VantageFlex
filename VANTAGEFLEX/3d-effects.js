/**
 * Vantage Flex - Global 3D Effects
 * Applies 3D transformations to all pages
 */

(function() {
    'use strict';

    // Mouse tracking variables
    let mouseX = 0, mouseY = 0;
    let targetRotateX = 0, targetRotateY = 0;
    let currentRotateX = 0, currentRotateY = 0;

    // Initialize 3D effects
    function init3DEffects() {
        // Add mouse move listener for 3D tilt
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        
        // Start animation loop
        requestAnimationFrame(animate3D);
        
        // Add 3D classes to existing elements
        enhanceElements();
        
        console.log('🎲 3D effects initialized');
    }

    function handleMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        targetRotateY = mouseX * 5;
        targetRotateX = -mouseY * 5;
    }

    function animate3D() {
        // Smooth interpolation
        currentRotateX += (targetRotateX - currentRotateX) * 0.1;
        currentRotateY += (targetRotateY - currentRotateY) * 0.1;
        
        // Apply to 3D elements
        document.querySelectorAll('.card-3d, .hero-content-3d, .feature-card').forEach(el => {
            if (!el.matches(':hover')) {
                el.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
            }
        });
        
        requestAnimationFrame(animate3D);
    }

    function enhanceElements() {
        // Add 3D classes to cards
        document.querySelectorAll('.card, .feature-card, .workout-card, .exercise-card').forEach(el => {
            el.classList.add('card-3d');
        });
        
        // Add 3D to buttons
        document.querySelectorAll('.btn, .btn-primary, .btn-secondary, button:not(.nav-cta)').forEach(el => {
            if (!el.classList.contains('btn-3d')) {
                el.classList.add('btn-3d');
            }
        });
        
        // Add 3D to navigation
        document.querySelectorAll('.nav, nav').forEach(el => {
            el.classList.add('nav-3d');
        });
        
        // Add 3D to links
        document.querySelectorAll('.nav-links a, .nav-link').forEach(el => {
            el.classList.add('nav-link-3d');
        });
        
        // Add 3D to headings
        document.querySelectorAll('h1, h2, .logo').forEach(el => {
            if (!el.closest('.card-3d')) {
                el.classList.add('text-3d');
            }
        });
        
        // Add 3D to sections
        document.querySelectorAll('section, .section').forEach(el => {
            el.classList.add('section-3d');
        });
        
        // Add 3D to images
        document.querySelectorAll('img, .image-container').forEach(el => {
            el.classList.add('img-frame-3d');
        });
        
        // Add 3D to stats
        document.querySelectorAll('.stat, .stats-item').forEach(el => {
            el.classList.add('stat-3d');
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DEffects);
    } else {
        init3DEffects();
    }
})();
