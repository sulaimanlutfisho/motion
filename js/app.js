/**
 * app.js - Unified Platform Orchestrator (NexusUI)
 * Manages Mobile Drawer, Developer Modal Chain, and Initialization
 */

import { initRenderer } from './renderer.js';
import { initModal } from './modal.js';
import { initBasket } from './basket.js';

const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
const mobileDrawerClose = document.getElementById('mobileDrawerClose');

// Developer Modal Elements
const openDevModalBtn = document.getElementById('openDevModalBtn');
const developerModal = document.getElementById('developerModal');
const devModalClose = document.getElementById('devModalClose');
const devModalCancel = document.getElementById('devModalCancel');

/**
 * Injects unified CSS rules (buttons + animations) into document head
 */
function injectUnifiedCSS(buttons, animations) {
  let styleEl = document.getElementById('dynamicUnifiedCSS');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicUnifiedCSS';
    document.head.appendChild(styleEl);
  }

  const buttonsCSS = buttons.map(b => b.css).join('\n\n');
  const animationsCSS = animations.map(a => a.css).join('\n\n');

  styleEl.textContent = `/* === BUTTONS STYLES === */\n${buttonsCSS}\n\n/* === ANIMATIONS STYLES === */\n${animationsCSS}`;
}

/**
 * Mobile Drawer Controls
 */
function openMobileDrawer() {
  if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('open');
  if (hamburgerBtn) hamburgerBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
  if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('open');
  if (hamburgerBtn) hamburgerBtn.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Gorilla-Glass Developer Modal Controls
 */
function openDevModal() {
  if (developerModal) {
    developerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeDevModal() {
  if (developerModal) {
    developerModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Setup Event Listeners for Mobile Drawer and Developer Modal Chain
 */
function setupDrawersAndModals() {
  // 1. Mobile Drawer
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawerOverlay && mobileDrawerOverlay.classList.contains('open');
      if (isOpen) closeMobileDrawer();
      else openMobileDrawer();
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === mobileDrawerOverlay) closeMobileDrawer();
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // 2. Developer Modal Chain Event
  if (openDevModalBtn) {
    openDevModalBtn.addEventListener('click', () => {
      // Step A: Close mobile drawer smoothly
      closeMobileDrawer();

      // Step B: Launch Ultra-Premium Developer Modal
      setTimeout(() => {
        openDevModal();
      }, 150);
    });
  }

  if (devModalClose) devModalClose.addEventListener('click', closeDevModal);
  if (devModalCancel) devModalCancel.addEventListener('click', closeDevModal);

  if (developerModal) {
    developerModal.addEventListener('click', (e) => {
      if (e.target === developerModal) closeDevModal();
    });
  }

  // Keyboard Escape listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (developerModal && developerModal.classList.contains('open')) {
        closeDevModal();
      } else if (mobileDrawerOverlay && mobileDrawerOverlay.classList.contains('open')) {
        closeMobileDrawer();
      }
    }
  });
}

/**
 * Main Initialization Function
 */
async function initApp() {
  try {
    const [buttonsRes, animsRes] = await Promise.all([
      fetch('./data/buttons.json'),
      fetch('./data/animations.json')
    ]);

    if (!buttonsRes.ok || !animsRes.ok) {
      throw new Error(`Failed to load data assets`);
    }

    const buttons = await buttonsRes.json();
    const animations = await animsRes.json();

    console.log(`[NexusUI] Loaded ${buttons.length} buttons and ${animations.length} animations.`);

    // 1. Inject combined CSS rules into the DOM
    injectUnifiedCSS(buttons, animations);

    // 2. Initialize Subsystems
    initModal();

    const allItems = [...buttons, ...animations];
    initBasket(allItems);
    initRenderer(buttons, animations);

    // 3. Setup Mobile Drawer and Developer Modal Chain
    setupDrawersAndModals();

  } catch (error) {
    console.error('[NexusUI] Initialization Error:', error);
    const showcase = document.getElementById('showcase');
    if (showcase) {
      showcase.innerHTML = `
        <div class="empty-state" style="padding: 100px 20px;">
          <i class="fas fa-exclamation-triangle" style="color: var(--accent-pink); font-size: 54px; margin-bottom: 20px;"></i>
          <h3 style="color: #fff; margin-bottom: 12px;">تعذر تحميل قاعدة بيانات المنصة</h3>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 20px;">
            يرجى تشغيل المشروع عبر خادم ويب محلي (Live Server أو Node/Python) لتخطي قيود الـ CORS المحلية.
          </p>
          <code style="background: rgba(255,255,255,0.06); padding: 8px 16px; border-radius: 6px; font-family: monospace;">
            npx serve . أو python -m http.server
          </code>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', initApp);
