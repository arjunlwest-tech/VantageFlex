// small interactions for alex.dev

document.addEventListener('DOMContentLoaded', () => {
    // smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // random status message on click
    const statusEl = document.querySelector('.status');
    const statuses = [
        'probably debugging something rn',
        'should be studying but coding instead',
        'surviving on caffeine and vibes',
        'lost in stack overflow again',
        'typing code that might break later'
    ];
    
    if (statusEl) {
        statusEl.addEventListener('click', () => {
            const current = statusEl.textContent.trim();
            let next = statuses[Math.floor(Math.random() * statuses.length)];
            while (next === current) {
                next = statuses[Math.floor(Math.random() * statuses.length)];
            }
            statusEl.innerHTML = '<span class="status-dot"></span>' + next;
        });
        statusEl.style.cursor = 'pointer';
    }

    // console easter egg
    console.log('hey, thanks for checking out my site!');
    console.log('if you find any bugs... no you didn\'t');
});
