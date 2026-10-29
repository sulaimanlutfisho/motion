/**
 * basket.js - Collection Basket Management, Visual Mini-Preview Drawer, and Bundle Export
 * Unified State Management with updateGlobalCounter()
 */

import { generateBundleHTML, downloadHTMLFile } from './generator.js';
import { showToast, showConfirmModal } from './modal.js';

const STORAGE_KEY = 'nexusui_selected_items';
let selectedItems = [];

const navBasketBtn = document.getElementById('navBasketBtn');
const navBasketBadge = document.getElementById('navBasketBadge');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerClose = document.getElementById('drawerClose');
const basketList = document.getElementById('basketList');
const bundleDownloadBtn = document.getElementById('bundleDownloadBtn');
const bundleCopyCssBtn = document.getElementById('bundleCopyCssBtn');
const clearBasketBtn = document.getElementById('clearBasketBtn');

// Mobile Floating Bottom Dock Elements (Directive v2.3)
const floatingBasketDock = document.getElementById('floatingBasketDock');
const openBottomBasketBtn = document.getElementById('openBottomBasketBtn');
const dockBadgeCount = document.getElementById('dockBadgeCount');
const dockDynamicSubtitle = document.getElementById('dockDynamicSubtitle');

/**
 * Update Global Counter across all views (Desktop Navbar, Drawer & Mobile Bottom Dock)
 */
export function updateGlobalCounter(triggerPulse = false) {
  const count = selectedItems.length;

  // 1. Desktop Navbar Badge
  if (navBasketBadge) {
    navBasketBadge.textContent = count;
    if (triggerPulse) {
      navBasketBadge.classList.remove('badge-pulse');
      void navBasketBadge.offsetWidth; // Trigger reflow
      navBasketBadge.classList.add('badge-pulse');
    }
  }

  // 2. Basket Drawer Header Badge
  const drawerCountBadge = document.getElementById('drawerCountBadge');
  if (drawerCountBadge) {
    drawerCountBadge.textContent = `(${count})`;
  }

  // 3. Mobile Floating Bottom Dock Badge & Dynamic Subtitle
  if (dockBadgeCount) {
    dockBadgeCount.textContent = count;
  }

  if (dockDynamicSubtitle) {
    if (count === 0) {
      dockDynamicSubtitle.textContent = 'لا توجد عناصر • اضغط + للتجميع';
    } else if (count === 1) {
      dockDynamicSubtitle.textContent = 'عنصر واحد جاهز للتحميل';
    } else if (count === 2) {
      dockDynamicSubtitle.textContent = 'عنصران جاهزان للتحميل';
    } else if (count >= 3 && count <= 10) {
      dockDynamicSubtitle.textContent = `${count} عناصر جاهزة للتحميل`;
    } else {
      dockDynamicSubtitle.textContent = `${count} عنصراً جاهزاً للتحميل`;
    }
  }

  // 4. Mobile Floating Dock State & Pulse Micro-interaction
  if (floatingBasketDock) {
    if (count > 0) {
      floatingBasketDock.classList.add('has-items');
    } else {
      floatingBasketDock.classList.remove('has-items');
    }

    if (triggerPulse) {
      floatingBasketDock.classList.remove('pulse');
      void floatingBasketDock.offsetWidth; // Trigger reflow for pulse
      floatingBasketDock.classList.add('pulse');
    }
  }
}

/**
 * Load selected items from localStorage
 */
export function loadBasketState(allItems) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedIds = JSON.parse(saved);
      selectedItems = allItems.filter(item => savedIds.includes(item.id));
    }
  } catch (e) {
    console.warn('Could not load basket state:', e);
  }
  updateGlobalCounter();
}

/**
 * Save selected items to localStorage
 */
function saveBasketState() {
  try {
    const ids = selectedItems.map(item => item.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Could not save basket state:', e);
  }
}

/**
 * Check if an item is in the basket
 */
export function isInBasket(itemId) {
  return selectedItems.some(item => item.id === itemId);
}

/**
 * Toggle item in the basket
 */
export function toggleBasket(item, triggerElement = null) {
  const index = selectedItems.findIndex(i => i.id === item.id);
  const isAdding = index === -1;

  if (!isAdding) {
    // Remove
    selectedItems.splice(index, 1);
    showToast(`تمت إزالة "${item.name}" من السلة`);
  } else {
    // Add
    selectedItems.push(item);
    showToast(`تمت إضافة "${item.name}" إلى السلة (+1)`);

    // Animation on trigger element if available
    if (triggerElement) {
      triggerElement.classList.remove('basket-pop');
      void triggerElement.offsetWidth;
      triggerElement.classList.add('basket-pop');
    }
  }

  saveBasketState();
  updateGlobalCounter(isAdding);
  renderDrawerList();
  updateCardStates();
}

/**
 * Remove specific item by ID
 */
export function removeFromBasket(itemId) {
  selectedItems = selectedItems.filter(item => item.id !== itemId);
  saveBasketState();
  updateGlobalCounter();
  renderDrawerList();
  updateCardStates();
}

/**
 * Clear the entire basket
 */
export function clearBasket() {
  if (selectedItems.length === 0) return;
  selectedItems = [];
  saveBasketState();
  updateGlobalCounter();
  renderDrawerList();
  updateCardStates();
  showToast('تم تفريغ السلة بالكامل');
}

/**
 * Update card action buttons active state in the DOM
 */
export function updateCardStates() {
  document.querySelectorAll('.btn-add-basket').forEach(btn => {
    const btnId = btn.dataset.id;
    if (isInBasket(btnId)) {
      btn.classList.add('in-basket');
      btn.title = 'إزالة من السلة';
      btn.innerHTML = '<i class="fas fa-check"></i>';
    } else {
      btn.classList.remove('in-basket');
      btn.title = 'إضافة إلى السلة';
      btn.innerHTML = '<i class="fas fa-bookmark"></i>';
    }
  });
}

/**
 * Render items in the Basket Drawer with Visual Mini-Preview
 */
function renderDrawerList() {
  if (!basketList) return;

  if (selectedItems.length === 0) {
    basketList.innerHTML = `
      <div class="empty-state" style="padding: 50px 10px;">
        <i class="fas fa-shopping-bag" style="font-size: 38px; margin-bottom: 12px; color: var(--text-dim);"></i>
        <h4 style="font-size: 15px; color: var(--text-secondary); margin-bottom: 6px;">السلة فارغة</h4>
        <p style="font-size: 12.5px; color: var(--text-muted);">انقر على أيقونة الإضافة في أي عنصر لتجميعه هنا ومعاينته حياً وتصدير حزمة مخصصة.</p>
      </div>`;
    return;
  }

  basketList.innerHTML = '';
  const fragment = document.createDocumentFragment();

  selectedItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'basket-item';

    // Live Mini-Preview Container
    card.innerHTML = `
      <div class="basket-item-preview" style="--accent: ${item.accent || '#48dbfb'};">
        <div class="mini-live-stage">
          ${item.html}
        </div>
      </div>
      <div class="basket-item-content">
        <div class="basket-item-title">${item.name}</div>
        <div class="basket-item-cat">${item.category.toUpperCase()}</div>
      </div>
      <button class="basket-item-remove" title="حذف من السلة" data-id="${item.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    card.querySelector('.basket-item-remove').addEventListener('click', () => {
      removeFromBasket(item.id);
    });

    fragment.appendChild(card);
  });

  basketList.appendChild(fragment);
}

/**
 * Open Drawer
 */
export function openDrawer() {
  renderDrawerList();
  drawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Close Drawer
 */
export function closeDrawer() {
  drawerOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Copy Combined CSS for all selected items
 */
async function copyCombinedCSS() {
  if (selectedItems.length === 0) {
    showToast('السلة فارغة!');
    return;
  }

  const combined = selectedItems.map(item => `/* ==========================================\n   ${item.name} (${item.id})\n   ========================================== */\n${item.css}`).join('\n\n');

  try {
    await navigator.clipboard.writeText(combined);
    showToast(`✓ تم نسخ الـ CSS المجمع (${selectedItems.length} عنصر)!`);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = combined;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`✓ تم نسخ الـ CSS المجمع (${selectedItems.length} عنصر)!`);
  }
}

/**
 * Download Standalone Bundle HTML File
 */
function downloadBundleFile() {
  if (selectedItems.length === 0) {
    showToast('السلة فارغة!');
    return;
  }

  const bundleHtml = generateBundleHTML(selectedItems);
  downloadHTMLFile(`nexusui-bundle-${selectedItems.length}.html`, bundleHtml);
  showToast(`جاري تحميل حزمة العناصر (${selectedItems.length} عنصر)...`);
}

/**
 * Initialize Basket Drawer Event Listeners
 */
export function initBasket(allItems) {
  loadBasketState(allItems);

  // Desktop Navbar Basket Button
  if (navBasketBtn) {
    navBasketBtn.addEventListener('click', openDrawer);
  }

  // Mobile Bottom Floating Basket Dock
  if (openBottomBasketBtn) {
    openBottomBasketBtn.addEventListener('click', openDrawer);
  }
  if (floatingBasketDock) {
    floatingBasketDock.addEventListener('click', (e) => {
      openDrawer();
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', e => {
      if (e.target === drawerOverlay) closeDrawer();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawerOverlay && drawerOverlay.classList.contains('open')) {
      closeDrawer();
    }
  });

  if (bundleCopyCssBtn) {
    bundleCopyCssBtn.addEventListener('click', copyCombinedCSS);
  }

  if (bundleDownloadBtn) {
    bundleDownloadBtn.addEventListener('click', downloadBundleFile);
  }

  if (clearBasketBtn) {
    clearBasketBtn.addEventListener('click', async () => {
      if (selectedItems.length === 0) {
        showToast('السلة فارغة بالفعل!');
        return;
      }

      const confirmed = await showConfirmModal({
        title: "تفريغ السلة",
        message: "هل أنت متأكد من رغبتك في تفريغ كافة العناصر من السلة؟ لا يمكن التراجع عن هذا الإجراء.",
        confirmText: "نعم، تفريغ السلة",
        cancelText: "تراجع",
        danger: true
      });

      if (confirmed) {
        clearBasket();
      }
    });
  }
}
