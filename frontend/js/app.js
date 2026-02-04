/**
 * Portfolio Website - Main Application
 * Handles core functionality, navigation, and UI interactions
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : '/api';

const TELEGRAM_BOT_URL = 'https://t.me/your_portfolio_bot';

// DOM Elements
const elements = {
    preloader: document.getElementById('preloader'),
    header: document.querySelector('.header'),
    menuToggle: document.getElementById('menuToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    cursor: document.querySelector('.cursor'),
    cursorFollower: document.querySelector('.cursor-follower'),
    contactForm: document.getElementById('contactForm'),
    adminModal: document.getElementById('adminModal'),
    adminClose: document.getElementById('adminClose'),
    addWorkForm: document.getElementById('addWorkForm'),
    telegramBtns: document.querySelectorAll('#telegramBtn, #ctaTelegramBtn, .telegram-link')
};

// State
let isAdmin = false;
let adminToken = localStorage.getItem('adminToken');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    hidePreloader();
    initNavigation();
    initCustomCursor();
    initScrollEffects();
    initContactForm();
    initAdminPanel();
    initTelegramLinks();
    initStatsCounter();
    initSkillBars();
    checkAdminStatus();
}

// Preloader
function hidePreloader() {
    setTimeout(() => {
        elements.preloader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 800);
}

// Navigation
function initNavigation() {
    // Header scroll effect
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            elements.header.classList.add('scrolled');
        } else {
            elements.header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.menuToggle.classList.toggle('active');
        elements.mobileMenu.classList.toggle('active');
        document.body.style.overflow = elements.mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            elements.menuToggle.classList.remove('active');
            elements.mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Custom Cursor
function initCustomCursor() {
    if (!elements.cursor || !elements.cursorFollower) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Cursor follows mouse directly
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        elements.cursor.style.left = cursorX + 'px';
        elements.cursor.style.top = cursorY + 'px';

        // Follower has more delay
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        elements.cursorFollower.style.left = followerX + 'px';
        elements.cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .work-card, input, textarea, select');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            elements.cursor.classList.add('hover');
            elements.cursorFollower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            elements.cursor.classList.remove('hover');
            elements.cursorFollower.classList.remove('hover');
        });
    });
}

// Scroll Effects
function initScrollEffects() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children');
    
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCount = (el) => {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCount = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target + '+';
            }
        };

        updateCount();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

// Skill Bars Animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.dataset.progress;
                entry.target.style.width = progress + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(el => observer.observe(el));
}

// Contact Form
function initContactForm() {
    if (!elements.contactForm) return;

    elements.contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(elements.contactForm);
        const data = Object.fromEntries(formData.entries());
        
        const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showNotification('Сообщение отправлено! Я свяжусь с вами в ближайшее время.', 'success');
                elements.contactForm.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            showNotification('Ошибка отправки. Попробуйте написать в Telegram.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Admin Panel
function initAdminPanel() {
    // Secret key combination to open admin (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (isAdmin) {
                elements.adminModal.classList.add('active');
            } else {
                promptAdminLogin();
            }
        }
    });

    // Close admin modal
    if (elements.adminClose) {
        elements.adminClose.addEventListener('click', () => {
            elements.adminModal.classList.remove('active');
        });
    }

    // Close on outside click
    if (elements.adminModal) {
        elements.adminModal.addEventListener('click', (e) => {
            if (e.target === elements.adminModal) {
                elements.adminModal.classList.remove('active');
            }
        });
    }

    // Add work form
    if (elements.addWorkForm) {
        elements.addWorkForm.addEventListener('submit', handleAddWork);
    }
}

async function checkAdminStatus() {
    if (!adminToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        if (response.ok) {
            isAdmin = true;
        } else {
            localStorage.removeItem('adminToken');
            adminToken = null;
        }
    } catch (error) {
        console.log('Admin verification failed');
    }
}

function promptAdminLogin() {
    const password = prompt('Введите пароль администратора:');
    if (!password) return;

    loginAdmin(password);
}

async function loginAdmin(password) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            const data = await response.json();
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);
            isAdmin = true;
            elements.adminModal.classList.add('active');
            showNotification('Вход выполнен успешно!', 'success');
        } else {
            showNotification('Неверный пароль', 'error');
        }
    } catch (error) {
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

async function handleAddWork(e) {
    e.preventDefault();
    
    if (!isAdmin || !adminToken) {
        showNotification('Требуется авторизация', 'error');
        return;
    }

    const formData = new FormData(elements.addWorkForm);
    
    const submitBtn = elements.addWorkForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/works`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            },
            body: formData
        });

        if (response.ok) {
            showNotification('Работа добавлена!', 'success');
            elements.addWorkForm.reset();
            elements.adminModal.classList.remove('active');
            // Reload works
            if (typeof loadWorks === 'function') {
                loadWorks();
            }
        } else {
            throw new Error('Failed to add work');
        }
    } catch (error) {
        showNotification('Ошибка добавления работы', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Telegram Links
function initTelegramLinks() {
    elements.telegramBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(TELEGRAM_BOT_URL, '_blank');
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 16px; color: var(--text-muted);">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for other modules
window.showNotification = showNotification;
window.API_BASE_URL = API_BASE_URL;
window.isAdmin = () => isAdmin;
window.getAdminToken = () => adminToken;
