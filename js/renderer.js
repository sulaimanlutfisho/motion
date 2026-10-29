/**
 * renderer.js - Unified Platform Renderer, Section Switching, and Dynamic Real-Time Counters
 */

import { openModal } from './modal.js';
import { toggleBasket, isInBasket } from './basket.js';

let buttonsData = [];
let animationsData = [];

let activeSection = 'buttons'; // 'buttons' | 'animations'
let currentCategory = 'all';
let currentSearchQuery = '';

const showcase = document.getElementById('showcase');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const categoriesContainer = document.getElementById('categoriesContainer');
const resultCountEl = document.getElementById('resultCount');
const heroDynamicCount = document.getElementById('heroDynamicCount');
const heroDynamicText = document.getElementById('heroDynamicText');
const heroSubtitle = document.getElementById('heroSubtitle');

// Category definitions for each section
const BUTTON_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fas fa-th' },
  { id: 'gradient', name: 'تدرجات', icon: 'fas fa-palette' },
  { id: 'neon', name: 'نيون', icon: 'fas fa-bolt' },
  { id: '3d', name: 'ثلاثي الأبعاد', icon: 'fas fa-cube' },
  { id: 'borders', name: 'حدود وإطارات', icon: 'fas fa-border-style' },
  { id: 'animations', name: 'حركات وتفاعلات', icon: 'fas fa-running' },
  { id: 'social', name: 'سوشيال ميديا', icon: 'fas fa-share-alt' },
  { id: 'typography', name: 'نصوص وطباعة', icon: 'fas fa-font' },
  { id: 'shapes', name: 'أشكال هندسية', icon: 'fas fa-shapes' },
  { id: 'creative', name: 'تصاميم إبداعية', icon: 'fas fa-magic' }
];

const ANIMATION_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fas fa-th' },
  { id: 'loaders', name: 'تحميل ودوران', icon: 'fas fa-sync-alt' },
  { id: 'pulse-glow', name: 'وميض ونبض', icon: 'fas fa-lightbulb' },
  { id: 'geometrics', name: 'حركات هندسية', icon: 'fas fa-shapes' },
  { id: 'icons-texts', name: 'نصوص وأيقونات', icon: 'fas fa-font' }
];

/**
 * Get active collection list
 */
function getCurrentCollection() {
  return activeSection === 'buttons' ? buttonsData : animationsData;
}

/**
 * Filter items based on active section, category, and search query
 */
export function getFilteredItems() {
  const collection = getCurrentCollection();

  return collection.filter(item => {
    const matchesCat = currentCategory === 'all' || item.category === currentCategory;

    const q = currentSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });
}

/**
 * Render category filter chips based on active section
 */
export function renderCategoryChips() {
  if (!categoriesContainer) return;

  const cats = activeSection === 'buttons' ? BUTTON_CATEGORIES : ANIMATION_CATEGORIES;
  categoriesContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();

  cats.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = `filter-chip ${cat.id === currentCategory ? 'active' : ''}`;
    chip.dataset.category = cat.id;
    chip.innerHTML = `<i class="${cat.icon}"></i> ${cat.name}`;

    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = cat.id;
      renderCards();
    });

    fragment.appendChild(chip);
  });

  categoriesContainer.appendChild(fragment);
}

/**
 * Update Dynamic Real-Time Hero Counter & Texts
 */
export function updateHeroCounter(filteredCount, totalCount) {
  if (heroDynamicCount) {
    heroDynamicCount.textContent = filteredCount;
  }

  if (heroDynamicText) {
    if (activeSection === 'buttons') {
      heroDynamicText.textContent = 'زر احترافي بتصاميم حديثة';
    } else {
      heroDynamicText.textContent = 'حركة وتأثير CSS تفاعلي';
    }
  }

  if (heroSubtitle) {
    if (activeSection === 'buttons') {
      heroSubtitle.textContent = 'معرض تفاعلي شامل • فلترة وبحث حي • استعراض وتخصيص الأكواد • سلة تجميع بصرية ذكية';
    } else {
      heroSubtitle.textContent = 'مكتبة حركية متكاملة • لودرز وحلقات دوران • وميض ونبض • حركات هندسية ونصوص وأيقونات حية';
    }
  }

  const unitName = activeSection === 'buttons' ? 'زر' : 'حركة';
  if (resultCountEl) {
    resultCountEl.textContent = `عرض ${filteredCount} من أصل ${totalCount} ${unitName}`;
  }
}

/**
 * Render Cards into the #showcase container
 */
export function renderCards() {
  if (!showcase) return;

  const items = getFilteredItems();
  const total = getCurrentCollection().length;
  showcase.innerHTML = '';

  // Update real-time dynamic hero counter and stats bar
  updateHeroCounter(items.length, total);

  // Handle empty state
  if (items.length === 0) {
    showcase.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>لم يتم العثور على نتائج مطابقة</h3>
        <p>جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً من القائمة أعلاه.</p>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'effect';
    card.style.setProperty('--accent', item.accent || '#48dbfb');
    card.dataset.id = item.id;

    // Card Stage
    const stage = document.createElement('div');
    stage.className = 'card-stage';
    stage.innerHTML = item.html;
    card.appendChild(stage);

    // Card Footer
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    // Meta
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML = `
      <div class="card-title">${item.name}</div>
      <div class="card-cat-tag">${item.category}</div>
    `;
    footer.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    // Code Button
    const codeBtn = document.createElement('button');
    codeBtn.className = 'btn-card-action btn-view-code';
    codeBtn.title = 'عرض الكود وتفاصيل العنصر';
    codeBtn.innerHTML = '<i class="fas fa-code"></i>';
    codeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(item);
    });
    actions.appendChild(codeBtn);

    // Add to Basket Button
    const basketBtn = document.createElement('button');
    const inBasket = isInBasket(item.id);
    basketBtn.className = `btn-card-action btn-add-basket ${inBasket ? 'in-basket' : ''}`;
    basketBtn.dataset.id = item.id;
    basketBtn.title = inBasket ? 'إزالة من السلة' : 'إضافة إلى السلة';
    basketBtn.innerHTML = inBasket ? '<i class="fas fa-check"></i>' : '<i class="fas fa-bookmark"></i>';

    basketBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBasket(item, basketBtn);
    });
    actions.appendChild(basketBtn);

    footer.appendChild(actions);
    card.appendChild(footer);

    fragment.appendChild(card);
  });

  showcase.appendChild(fragment);
}

/**
 * Switch Active Section ('buttons' or 'animations')
 */
export function switchSection(section) {
  if (activeSection === section) return;
  activeSection = section;
  currentCategory = 'all';

  // Update navbar links active state
  document.querySelectorAll('.nav-link-btn, .mobile-nav-link').forEach(btn => {
    if (btn.dataset.view === section) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderCategoryChips();
  renderCards();
}

/**
 * Initialize Renderer Engine
 */
export function initRenderer(buttons, animations) {
  buttonsData = buttons;
  animationsData = animations;

  // Search input events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearchQuery ? 'block' : 'none';
      }
      renderCards();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      renderCards();
    });
  }

  // Section switcher listeners
  document.querySelectorAll('.nav-link-btn, .mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const targetSection = link.dataset.view;
      if (targetSection) {
        switchSection(targetSection);
      }
    });
  });

  // Initial render
  renderCategoryChips();
  renderCards();
}
