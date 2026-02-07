/**
 * Portfolio Animations Module
 * Handles scroll-based animations, parallax, and interactive effects
 */

// Initialize animations on DOM load
document.addEventListener('DOMContentLoaded', initAnimations);

function initAnimations() {
    initParallax();
    initTiltEffect();
    initMagneticButtons();
    initParticles();
    initScrollProgress();
    initTextReveal();
}

// Parallax Effect
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            const speed = el.dataset.parallax || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// 3D Tilt Effect for Cards (event delegation for dynamic elements)
function initTiltEffect() {
    // Static elements
    document.querySelectorAll('.service-card').forEach(el => attachTilt(el));
    
    // Delegated tilt for dynamically rendered work-cards
    const worksGrid = document.getElementById('worksGrid');
    if (worksGrid) {
        worksGrid.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.work-card');
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = (y - rect.height / 2) / 25;
            const rotateY = (rect.width / 2 - x) / 25;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
        worksGrid.addEventListener('mouseleave', (e) => {
            const cards = worksGrid.querySelectorAll('.work-card');
            cards.forEach(c => c.style.transform = '');
        }, true);
        // Reset individual card on mouse leave
        worksGrid.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.work-card');
            if (card && !card.contains(e.relatedTarget)) {
                card.style.transform = '';
            }
        });
    }
}

function attachTilt(el) {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 25;
        const rotateY = (rect.width / 2 - x) / 25;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
    });
}

// Magnetic Buttons Effect
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.btn-primary, .btn-telegram');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// Particle Animation in Hero
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;
    const particles = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-dot';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            pointer-events: none;
        `;
        
        particles.push({
            element: particle,
            x: Math.random() * 100,
            y: Math.random() * 100,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 4 + 2
        });
        
        particlesContainer.appendChild(particle);
    }

    // Animate particles
    function animateParticles() {
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around edges
            if (p.x < 0) p.x = 100;
            if (p.x > 100) p.x = 0;
            if (p.y < 0) p.y = 100;
            if (p.y > 100) p.y = 0;
            
            p.element.style.left = p.x + '%';
            p.element.style.top = p.y + '%';
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();

    // Mouse interaction
    particlesContainer.addEventListener('mousemove', (e) => {
        const rect = particlesContainer.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
        
        particles.forEach(p => {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 20) {
                p.x -= dx * 0.1;
                p.y -= dy * 0.1;
            }
        });
    });
}

// Scroll Progress Indicator
function initScrollProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        z-index: 9999;
        width: 0%;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Text Reveal Animation
function initTextReveal() {
    const textElements = document.querySelectorAll('.hero-title .title-line');
    
    textElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
}

// Intersection Observer for Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Animate children with delay
            const children = entry.target.querySelectorAll('[data-delay]');
            children.forEach(child => {
                const delay = child.dataset.delay || 0;
                setTimeout(() => {
                    child.classList.add('animate-in');
                }, delay);
            });
        }
    });
}, observerOptions);

// Observe static elements (work-cards are animated by works.js)
document.querySelectorAll('.section-header, .service-card, .about-grid').forEach(el => {
    animationObserver.observe(el);
});

// Smooth Scroll Enhancement
function smoothScrollTo(target, duration = 1000) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Lazy Loading Images
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Export functions
window.smoothScrollTo = smoothScrollTo;
