/**
 * Portfolio Works Module
 * Handles loading, filtering, and displaying portfolio works
 * with fullscreen lightbox gallery
 */

// State
let works = [];
let filteredWorks = [];
let currentFilter = 'all';
let currentPage = 1;
const worksPerPage = 12;
let currentLightboxIndex = 0;

// DOM Elements
const worksGrid = document.getElementById('worksGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Initialize
document.addEventListener('DOMContentLoaded', initWorks);

function initWorks() {
    loadWorks();
    initFilters();
    initLoadMore();
    injectLightboxStyles();
}

// Load works from API
async function loadWorks() {
    try {
        const response = await fetch(`${API_BASE_URL}/works`);
        
        if (response.ok) {
            const apiWorks = await response.json();
            if (apiWorks && apiWorks.length > 0) {
                works = apiWorks;
            } else {
                works = getDemoWorks();
            }
        } else {
            works = getDemoWorks();
        }
    } catch (error) {
        console.log('Using demo works data');
        works = getDemoWorks();
    }
    filteredWorks = [...works];
    renderWorks();
}

// Demo works data - Makar's real portfolio with proper images
function getDemoWorks() {
    return [
        {
            id: 1,
            title: 'Дизайн курсов',
            category: 'design',
            description: 'Создание системы продаж с доходом от 500.000 руб+ и привлечение от 1000 подписчиков ежемесячно. Полный визуал для авторского блога — от презентаций до обложек.',
            image: 'images/course.jpg',
            link: 'https://t.me/dsgnportfromz2rbo',
            tags: ['Презентации', 'Инфопродукты', 'Визуал']
        },
        {
            id: 2,
            title: 'Дизайн сайтов',
            category: 'design',
            description: 'Интернет-магазин бытовой техники VALUE — полный дизайн: каталог, акции, корзина, адаптив. Лендинги и многостраничные сайты для бизнеса.',
            image: 'images/site.jpg',
            images: ['images/site.jpg', 'images/site-full.png'],
            link: 'https://t.me/dsgnportfromz2rbo',
            tags: ['Сайты', 'E-commerce', 'UI/UX']
        },
        {
            id: 3,
            title: 'Инфографика WB',
            category: 'design',
            description: 'Карточки товаров и инфографика для Wildberries: SEO, магазин под ключ, продвижение, анализ и подбор товара. Комплексное оформление для маркетплейса.',
            image: 'images/wb-1.png',
            images: ['images/wb-1.png', 'images/wb-2.png', 'images/wb-3.png', 'images/wb-4.png', 'images/wb-5.png'],
            link: 'https://t.me/dsgnportfromz2rbo',
            tags: ['Wildberries', 'Инфографика', 'Маркетплейс']
        },
        {
            id: 4,
            title: 'Чек-листы',
            category: 'design',
            description: 'Дизайн чек-листов для инфопродуктов и блогеров. Стильное оформление, удобная структура, готовый PDF для аудитории.',
            image: 'images/checklist-1.png',
            images: ['images/checklist-1.png', 'images/checklist-2.png', 'images/checklist-3.png', 'images/checklist-4.png'],
            link: 'https://t.me/dsgnportfromz2rbo',
            tags: ['Чек-листы', 'Инфопродукты', 'PDF']
        },
        {
            id: 5,
            title: 'Аватарки каналов',
            category: 'design',
            description: 'Уникальные аватарки для Telegram-каналов и YouTube в разных стилях: от минимализма до GTA и нейро-арта.',
            image: 'images/ava-genius.png',
            images: ['images/ava-genius.png', 'images/ava-gta.png', 'images/m1ndpeak.jpeg'],
            link: 'https://t.me/dsgnportfromz2rbo',
            tags: ['Аватарки', 'Брендинг', 'Стиль']
        },
        {
            id: 6,
            title: 'Баннеры и ивенты',
            category: 'design',
            description: 'Баннеры для соцсетей, Telegram-каналов и мероприятий. Яркий визуал, который привлекает внимание и передаёт настроение.',
            image: 'images/banner.png',
            images: ['images/banner.png', 'images/event.png'],
            link: 'https://t.me/dsgnportfromz2rbo',
            tags: ['Баннеры', 'Ивенты', 'Соцсети']
        },
        {
            id: 7,
            title: 'Монтаж рилсов',
            category: 'reels',
            description: 'Вирусные ролики для блогеров-миллиоников. Динамичный монтаж, цветокоррекция, motion-графика. Рилсы, шортсы, TikTok.',
            image: 'images/reels-1.png',
            images: ['images/reels-1.png', 'images/reels-2.png'],
            link: 'https://t.me/mkworkeerbot',
            tags: ['Рилсы', 'Шортсы', 'Монтаж']
        },
        {
            id: 8,
            title: 'Канал m1ndpeak',
            category: 'youtube',
            description: '15 000 подписчиков за 10 видео. Авторский YouTube-канал с нуля — от идеи до продакшена. Съемка, монтаж, продвижение.',
            image: 'images/m1ndpeak.jpeg',
            link: 'https://youtube.com/@m1ndpeak',
            tags: ['YouTube', '15к подписчиков', 'Контент']
        },
        {
            id: 9,
            title: 'Telegram Боты',
            category: 'development',
            description: 'Разработка ботов для автоматизации бизнеса: воронки продаж, чат-боты, интеграции с платежами, рассылки и уведомления.',
            image: 'images/bot.jpg',
            images: ['images/bot.jpg', 'images/bot-2.png'],
            link: 'https://t.me/mkworkeerbot',
            tags: ['Боты', 'Автоматизация', 'Воронки']
        }
    ];
}

// Category config
const categoryConfig = {
    design: { label: 'Дизайн', color: '#6366f1' },
    reels: { label: 'Рилсы', color: '#ef4444' },
    youtube: { label: 'YouTube', color: '#ff0000' },
    development: { label: 'Разработка', color: '#0088cc' },
    marketing: { label: 'Маркетинг', color: '#10b981' }
};

// Render works to grid
function renderWorks() {
    if (!worksGrid) return;

    const worksToShow = filteredWorks.slice(0, currentPage * worksPerPage);
    
    if (worksToShow.length === 0) {
        worksGrid.innerHTML = `
            <div class="work-placeholder">
                <div class="placeholder-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                    </svg>
                </div>
                <p>Работы не найдены</p>
            </div>
        `;
        return;
    }

    worksGrid.innerHTML = worksToShow.map((work, index) => createWorkCard(work, index)).join('');
    
    // Update load more button visibility
    if (loadMoreBtn) {
        loadMoreBtn.style.display = worksToShow.length >= filteredWorks.length ? 'none' : 'inline-flex';
    }

    // Add click handlers for work cards
    document.querySelectorAll('.work-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open lightbox if clicking carousel controls or external link
            if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-dot') || e.target.closest('.work-external-link')) return;
            const workId = card.dataset.workId;
            openLightbox(workId);
        });
    });

    // Initialize carousels
    initCarousels();

    // Animate cards with stagger
    requestAnimationFrame(() => {
        document.querySelectorAll('.work-card').forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, i * 80);
        });
    });
}

// Create work card HTML
function createWorkCard(work, index) {
    const cat = categoryConfig[work.category] || { label: work.category, color: '#6366f1' };
    const tagsHtml = work.tags ? work.tags.map(t => `<span class="work-tag">${t}</span>`).join('') : '';
    const hasCarousel = work.images && work.images.length > 1;
    const errorImg = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22100%25%22 height=%22100%25%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage%3C/text%3E%3C/svg%3E";

    let imageHtml;
    if (hasCarousel) {
        const slides = work.images.map((img, i) =>
            `<div class="carousel-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                <img src="${img}" alt="${work.title} ${i + 1}" loading="lazy" onerror="this.src='${errorImg}'">
            </div>`
        ).join('');
        const dots = work.images.map((_, i) =>
            `<span class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
        ).join('');
        imageHtml = `
            <div class="work-image work-carousel" data-carousel>
                <div class="carousel-track">${slides}</div>
                <button class="carousel-btn carousel-prev" data-dir="-1" aria-label="Назад">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button class="carousel-btn carousel-next" data-dir="1" aria-label="Вперёд">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <div class="carousel-dots">${dots}</div>
                <div class="carousel-counter">${1}/${work.images.length}</div>
                <div class="work-overlay">
                    <div class="work-overlay-content">
                        <span class="work-view-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            </svg>
                            Смотреть
                        </span>
                    </div>
                </div>
            </div>`;
    } else {
        imageHtml = `
            <div class="work-image">
                <img src="${work.image}" alt="${work.title}" loading="lazy" onerror="this.src='${errorImg}'">
                <div class="work-overlay">
                    <div class="work-overlay-content">
                        <span class="work-view-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            </svg>
                            Смотреть
                        </span>
                    </div>
                </div>
            </div>`;
    }

    return `
        <div class="work-card" data-work-id="${work.id}" data-category="${work.category}">
            ${imageHtml}
            <div class="work-info">
                <div class="work-info-top">
                    <span class="work-category" style="--cat-color: ${cat.color}">${cat.label}</span>
                </div>
                <h3 class="work-title">${work.title}</h3>
                <p class="work-description">${work.description.length > 80 ? work.description.slice(0, 80) + '...' : work.description}</p>
                ${tagsHtml ? `<div class="work-tags">${tagsHtml}</div>` : ''}
            </div>
        </div>
    `;
}

// Filter functionality
function initFilters() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Apply filter with animation
            currentFilter = filter;
            currentPage = 1;
            
            if (filter === 'all') {
                filteredWorks = [...works];
            } else {
                filteredWorks = works.filter(w => w.category === filter);
            }
            
            // Fade out existing cards then render new
            const cards = worksGrid.querySelectorAll('.work-card');
            cards.forEach(c => c.classList.remove('visible'));
            
            setTimeout(() => {
                renderWorks();
            }, 200);
        });
    });
}

// Load more functionality
function initLoadMore() {
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage++;
        renderWorks();
    });
}

// ==========================================
// Card Carousels (WB, Checklists, etc.)
// ==========================================
function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const counter = carousel.querySelector('.carousel-counter');
        const total = slides.length;
        let current = 0;
        let touchStartX = 0;

        function goTo(idx) {
            current = (idx + total) % total;
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            slides[current].classList.add('active');
            if (dots[current]) dots[current].classList.add('active');
            if (counter) counter.textContent = `${current + 1}/${total}`;
        }

        // Arrow buttons
        carousel.querySelectorAll('.carousel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                goTo(current + parseInt(btn.dataset.dir));
            });
        });

        // Dot clicks
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goTo(parseInt(dot.dataset.index));
            });
        });

        // Touch swipe
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        carousel.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 40) {
                goTo(current + (diff > 0 ? -1 : 1));
            }
        }, { passive: true });
    });
}

// ==========================================
// Fullscreen Lightbox Gallery
// ==========================================
function openLightbox(workId) {
    const work = filteredWorks.find(w => w.id == workId);
    if (!work) return;
    
    currentLightboxIndex = filteredWorks.findIndex(w => w.id == workId);

    // Create lightbox
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        document.body.appendChild(lightbox);
    }

    renderLightbox(lightbox, work);

    // Show lightbox
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
    });

    // Keyboard navigation
    lightbox._escHandler = function(e) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    document.addEventListener('keydown', lightbox._escHandler);
}

function renderLightbox(lightbox, work) {
    const cat = categoryConfig[work.category] || { label: work.category, color: '#6366f1' };
    const tagsHtml = work.tags ? work.tags.map(t => `<span class="lb-tag">${t}</span>`).join('') : '';
    const totalWorks = filteredWorks.length;
    const currentNum = currentLightboxIndex + 1;
    const hasMultipleImages = work.images && work.images.length > 1;
    const lbImages = hasMultipleImages ? work.images : [work.image];

    let imageAreaHtml;
    if (hasMultipleImages) {
        const lbSlides = lbImages.map((img, i) =>
            `<div class="lb-carousel-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                <img src="${img}" alt="${work.title} ${i + 1}" class="lb-image">
            </div>`
        ).join('');
        const lbDots = lbImages.map((_, i) =>
            `<span class="lb-carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
        ).join('');
        imageAreaHtml = `
            <div class="lb-image-wrap lb-has-carousel" data-lb-carousel>
                <div class="lb-carousel-track">${lbSlides}</div>
                <button class="lb-carousel-btn lb-carousel-prev" data-dir="-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button class="lb-carousel-btn lb-carousel-next" data-dir="1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <div class="lb-carousel-dots">${lbDots}</div>
                <div class="lb-carousel-counter">1/${lbImages.length}</div>
            </div>`;
    } else {
        imageAreaHtml = `
            <div class="lb-image-wrap">
                <img src="${work.image}" alt="${work.title}" class="lb-image" onclick="toggleLightboxZoom(this)">
            </div>`;
    }

    lightbox.innerHTML = `
        <div class="lb-backdrop" onclick="closeLightbox()"></div>
        <div class="lb-container">
            <div class="lb-header">
                <span class="lb-counter">${currentNum} / ${totalWorks}</span>
                <button class="lb-close" onclick="closeLightbox()" aria-label="Закрыть">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="lb-body">
                ${totalWorks > 1 ? `
                <button class="lb-nav lb-prev" onclick="navigateLightbox(-1)" aria-label="Предыдущая">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>` : ''}
                <div class="lb-main">
                    ${imageAreaHtml}
                    <div class="lb-details">
                        <div class="lb-details-top">
                            <span class="lb-category" style="--cat-color: ${cat.color}">${cat.label}</span>
                            <h2 class="lb-title">${work.title}</h2>
                        </div>
                        <p class="lb-description">${work.description}</p>
                        ${tagsHtml ? `<div class="lb-tags">${tagsHtml}</div>` : ''}
                        ${work.link ? `
                        <a href="${work.link}" target="_blank" class="lb-link btn btn-primary" onclick="event.stopPropagation()">
                            <span>Открыть проект</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>` : ''}
                    </div>
                </div>
                ${totalWorks > 1 ? `
                <button class="lb-nav lb-next" onclick="navigateLightbox(1)" aria-label="Следующая">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>` : ''}
            </div>
        </div>
    `;

    // Init lightbox carousel if present
    initLbCarousel(lightbox);

    // Touch swipe support for work navigation
    let touchStartX = 0;
    const lbBody = lightbox.querySelector('.lb-body');
    lbBody.addEventListener('touchstart', (e) => {
        if (e.target.closest('[data-lb-carousel]')) return;
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lbBody.addEventListener('touchend', (e) => {
        if (e.target.closest('[data-lb-carousel]')) return;
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 60) navigateLightbox(diff > 0 ? -1 : 1);
    }, { passive: true });
}

function initLbCarousel(lightbox) {
    const wrap = lightbox.querySelector('[data-lb-carousel]');
    if (!wrap) return;
    const slides = wrap.querySelectorAll('.lb-carousel-slide');
    const dots = wrap.querySelectorAll('.lb-carousel-dot');
    const counter = wrap.querySelector('.lb-carousel-counter');
    const total = slides.length;
    let cur = 0;
    let touchX = 0;

    function goTo(idx) {
        cur = (idx + total) % total;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[cur].classList.add('active');
        if (dots[cur]) dots[cur].classList.add('active');
        if (counter) counter.textContent = `${cur + 1}/${total}`;
    }

    wrap.querySelectorAll('.lb-carousel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(cur + parseInt(btn.dataset.dir));
        });
    });
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(parseInt(dot.dataset.index));
        });
    });
    wrap.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].screenX; }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchX;
        if (Math.abs(diff) > 40) goTo(cur + (diff > 0 ? -1 : 1));
    }, { passive: true });
}

function navigateLightbox(direction) {
    const total = filteredWorks.length;
    if (total <= 1) return;
    
    currentLightboxIndex = (currentLightboxIndex + direction + total) % total;
    const work = filteredWorks[currentLightboxIndex];
    const lightbox = document.getElementById('lightbox');
    if (lightbox && work) {
        // Add slide animation class
        const main = lightbox.querySelector('.lb-main');
        if (main) {
            main.style.opacity = '0';
            main.style.transform = direction > 0 ? 'translateX(30px)' : 'translateX(-30px)';
            setTimeout(() => {
                renderLightbox(lightbox, work);
                const newMain = lightbox.querySelector('.lb-main');
                if (newMain) {
                    newMain.style.opacity = '0';
                    newMain.style.transform = direction > 0 ? 'translateX(-30px)' : 'translateX(30px)';
                    requestAnimationFrame(() => {
                        newMain.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        newMain.style.opacity = '1';
                        newMain.style.transform = 'translateX(0)';
                    });
                }
            }, 150);
        }
    }
}

function toggleLightboxZoom(img) {
    img.classList.toggle('zoomed');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        if (lightbox._escHandler) {
            document.removeEventListener('keydown', lightbox._escHandler);
        }
        setTimeout(() => lightbox.remove(), 400);
    }
}

// ==========================================
// Inject lightbox + enhanced card styles
// ==========================================
function injectLightboxStyles() {
    if (document.getElementById('lightboxStyles')) return;
    const style = document.createElement('style');
    style.id = 'lightboxStyles';
    style.textContent = `
        /* Work card enhancements */
        .work-card {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .work-card.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .work-overlay-content {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 24px;
        }
        .work-view-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: rgba(99, 102, 241, 0.9);
            backdrop-filter: blur(8px);
            color: white;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            transition: transform 0.2s ease, background 0.2s ease;
        }
        .work-view-btn:hover {
            background: var(--primary);
            transform: translateY(-2px);
        }
        .work-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 12px;
        }
        .work-tag {
            display: inline-block;
            padding: 3px 10px;
            font-size: 0.7rem;
            font-weight: 500;
            color: var(--primary-light);
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 20px;
            letter-spacing: 0.02em;
        }
        .work-category {
            position: relative;
            padding-left: 12px;
        }
        .work-category::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--cat-color, var(--primary));
        }

        /* ==========================================
           Lightbox Gallery
           ========================================== */
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 5000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }
        .lightbox.active {
            opacity: 1;
            visibility: visible;
        }
        .lb-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(20px);
        }
        .lb-container {
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .lb-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            flex-shrink: 0;
        }
        .lb-counter {
            font-size: 0.85rem;
            font-weight: 500;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0.1em;
        }
        .lb-close {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .lb-close:hover {
            background: rgba(239, 68, 68, 0.8);
            border-color: transparent;
            transform: rotate(90deg);
        }
        .lb-body {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 0 16px 32px;
            min-height: 0;
        }
        .lb-nav {
            flex-shrink: 0;
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .lb-nav:hover {
            background: rgba(99, 102, 241, 0.5);
            border-color: var(--primary);
            transform: scale(1.1);
        }
        .lb-main {
            display: flex;
            flex-direction: column;
            max-width: 900px;
            width: 100%;
            max-height: 100%;
            background: var(--bg-card);
            border-radius: var(--radius-xl);
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 40px 80px rgba(0,0,0,0.5);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .lb-image-wrap {
            width: 100%;
            max-height: 55vh;
            overflow: hidden;
            background: #0a0a14;
            cursor: zoom-in;
            position: relative;
        }
        .lb-image {
            width: 100%;
            height: 100%;
            max-height: 55vh;
            object-fit: contain;
            transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .lb-image.zoomed {
            transform: scale(1.8);
            cursor: zoom-out;
        }
        .lb-details {
            padding: 28px 32px 32px;
            overflow-y: auto;
        }
        .lb-details-top {
            margin-bottom: 12px;
        }
        .lb-category {
            display: inline-block;
            padding: 4px 12px 4px 16px;
            font-size: 0.7rem;
            font-weight: 600;
            color: var(--primary-light);
            background: rgba(99, 102, 241, 0.1);
            border-radius: 20px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            position: relative;
            margin-bottom: 10px;
        }
        .lb-category::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 50%;
            transform: translateY(-50%);
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--cat-color, var(--primary));
        }
        .lb-title {
            font-size: 1.6rem;
            font-weight: 700;
            line-height: 1.3;
            color: white;
        }
        .lb-description {
            color: var(--text-secondary);
            line-height: 1.8;
            font-size: 0.95rem;
            margin-bottom: 16px;
        }
        .lb-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 20px;
        }
        .lb-tag {
            display: inline-block;
            padding: 4px 12px;
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--text-secondary);
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
        }
        .lb-link {
            display: inline-flex;
            margin-top: 4px;
        }

        /* Mobile lightbox */
        @media (max-width: 768px) {
            .lb-nav {
                display: none;
            }
            .lb-main {
                border-radius: 16px;
                max-height: calc(100vh - 100px);
            }
            .lb-details {
                padding: 20px;
            }
            .lb-title {
                font-size: 1.25rem;
            }
            .lb-image {
                max-height: 40vh;
            }
            .lb-image-wrap {
                max-height: 40vh;
            }
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.loadWorks = loadWorks;
window.closeLightbox = closeLightbox;
window.navigateLightbox = navigateLightbox;
window.toggleLightboxZoom = toggleLightboxZoom;
