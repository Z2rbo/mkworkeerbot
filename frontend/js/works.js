/**
 * Portfolio Works Module
 * Handles loading, filtering, and displaying portfolio works
 */

// State
let works = [];
let filteredWorks = [];
let currentFilter = 'all';
let currentPage = 1;
const worksPerPage = 6;

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
}

// Load works from API
async function loadWorks() {
    try {
        const response = await fetch(`${API_BASE_URL}/works`);
        
        if (response.ok) {
            works = await response.json();
            filteredWorks = [...works];
            renderWorks();
        } else {
            // Use demo data if API is not available
            works = getDemoWorks();
            filteredWorks = [...works];
            renderWorks();
        }
    } catch (error) {
        console.log('Using demo works data');
        works = getDemoWorks();
        filteredWorks = [...works];
        renderWorks();
    }
}

// Demo works data
function getDemoWorks() {
    return [
        {
            id: 1,
            title: 'E-Commerce Platform',
            category: 'development',
            description: 'Полнофункциональный интернет-магазин с корзиной, оплатой и личным кабинетом',
            image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 2,
            title: 'Mobile Banking App',
            category: 'design',
            description: 'UI/UX дизайн мобильного приложения для финтех стартапа',
            image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 3,
            title: 'Brand Identity',
            category: 'design',
            description: 'Создание фирменного стиля для креативного агентства',
            image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 4,
            title: 'Marketing Dashboard',
            category: 'development',
            description: 'Аналитическая панель для отслеживания маркетинговых кампаний',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 5,
            title: 'Social Media Campaign',
            category: 'marketing',
            description: 'Комплексная SMM стратегия с ростом вовлеченности на 300%',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 6,
            title: 'Corporate Website',
            category: 'development',
            description: 'Корпоративный сайт с CMS и интеграцией с CRM системой',
            image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 7,
            title: 'Product Launch',
            category: 'marketing',
            description: 'Запуск нового продукта с охватом более 1 млн пользователей',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
            link: '#'
        },
        {
            id: 8,
            title: 'Travel App Design',
            category: 'design',
            description: 'Концепт дизайна приложения для планирования путешествий',
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
            link: '#'
        }
    ];
}

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
        card.addEventListener('click', () => {
            const workId = card.dataset.workId;
            openWorkModal(workId);
        });
    });

    // Animate cards
    setTimeout(() => {
        document.querySelectorAll('.work-card').forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, i * 100);
        });
    }, 100);
}

// Create work card HTML
function createWorkCard(work, index) {
    const categoryLabels = {
        design: 'Дизайн',
        development: 'Разработка',
        marketing: 'Маркетинг'
    };

    return `
        <div class="work-card" data-work-id="${work.id}" data-category="${work.category}" style="animation-delay: ${index * 0.1}s">
            <div class="work-image">
                <img src="${work.image}" alt="${work.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22100%25%22 height=%22100%25%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage%3C/text%3E%3C/svg%3E'">
                <div class="work-overlay">
                    <span class="work-view-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Подробнее
                    </span>
                </div>
            </div>
            <div class="work-info">
                <span class="work-category">${categoryLabels[work.category] || work.category}</span>
                <h3 class="work-title">${work.title}</h3>
                <p class="work-description">${work.description}</p>
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
            
            // Apply filter
            currentFilter = filter;
            currentPage = 1;
            
            if (filter === 'all') {
                filteredWorks = [...works];
            } else {
                filteredWorks = works.filter(w => w.category === filter);
            }
            
            renderWorks();
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

// Work Modal
function openWorkModal(workId) {
    const work = works.find(w => w.id == workId);
    if (!work) return;

    // Create modal if it doesn't exist
    let modal = document.getElementById('workModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'workModal';
        modal.className = 'work-modal';
        document.body.appendChild(modal);
    }

    const categoryLabels = {
        design: 'Дизайн',
        development: 'Разработка',
        marketing: 'Маркетинг'
    };

    modal.innerHTML = `
        <div class="work-modal-content">
            <button class="work-modal-close" onclick="closeWorkModal()">&times;</button>
            <div class="work-modal-image">
                <img src="${work.image}" alt="${work.title}">
            </div>
            <div class="work-modal-info">
                <span class="work-category">${categoryLabels[work.category] || work.category}</span>
                <h2>${work.title}</h2>
                <p>${work.description}</p>
                ${work.link && work.link !== '#' ? `
                    <a href="${work.link}" target="_blank" class="btn btn-primary">
                        <span>Открыть проект</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>
                ` : ''}
            </div>
        </div>
    `;

    // Add modal styles if not already added
    if (!document.getElementById('workModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'workModalStyles';
        styles.textContent = `
            .work-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                z-index: 2000;
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                padding: 20px;
            }
            .work-modal.active {
                opacity: 1;
                visibility: visible;
            }
            .work-modal-content {
                background: var(--bg-card);
                border-radius: var(--radius-xl);
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                position: relative;
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            .work-modal.active .work-modal-content {
                transform: translateY(0);
            }
            .work-modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 40px;
                height: 40px;
                background: var(--bg-dark);
                border: none;
                border-radius: 50%;
                color: var(--text-primary);
                font-size: 24px;
                cursor: pointer;
                z-index: 10;
                transition: background 0.3s ease;
            }
            .work-modal-close:hover {
                background: var(--primary);
            }
            .work-modal-image {
                width: 100%;
                height: 300px;
                overflow: hidden;
            }
            .work-modal-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .work-modal-info {
                padding: 32px;
            }
            .work-modal-info h2 {
                font-size: 1.5rem;
                margin: 8px 0 16px;
            }
            .work-modal-info p {
                color: var(--text-secondary);
                line-height: 1.8;
                margin-bottom: 24px;
            }
        `;
        document.head.appendChild(styles);
    }

    // Show modal
    setTimeout(() => modal.classList.add('active'), 10);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeWorkModal();
        }
    });

    // Close on escape
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeWorkModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeWorkModal() {
    const modal = document.getElementById('workModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Make functions globally available
window.loadWorks = loadWorks;
window.closeWorkModal = closeWorkModal;
