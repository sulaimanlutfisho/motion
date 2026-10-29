/**
 * modal.js - Modal Dialog Management, Code Tabs, Copying, and Direct Download
 */

import { generateSingleItemHTML, downloadHTMLFile } from './generator.js';

let currentItem = null;
let currentTab = 'html'; // 'html' | 'css' | 'full'

const modalOverlay = document.getElementById('modalOverlay');
const modalName = document.getElementById('modalName');
const modalCategory = document.getElementById('modalCategory');
const modalContent = document.getElementById('modalContent');
const modalInfo = document.getElementById('modalInfo');
const modalClose = document.getElementById('modalClose');
const copyBtn = document.getElementById('copyBtn');
const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
const tabs = document.querySelectorAll('.modal-tab-btn');

/**
 * Toast Notification Helper
 */
let toastTimer;
export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-cyan);"></i> ${message}`;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

/**
 * Custom Glass Confirmation Modal (Directive v2.4)
 * Returns a Promise<boolean> resolving to true on confirm, false on cancel/backdrop/Escape
 */
export function showConfirmModal({
  title = "تأكيد الإجراء",
  message = "هل أنت متأكد من الاستمرار؟",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  danger = true
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmModalOverlay');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const acceptBtn = document.getElementById('confirmAcceptBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    if (!overlay || !acceptBtn || !cancelBtn) {
      resolve(false);
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    acceptBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    if (danger) {
      acceptBtn.className = 'confirm-btn-danger';
    } else {
      acceptBtn.className = 'confirm-btn-cancel';
    }

    // Open Modal
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    let resolved = false;

    function cleanup(result) {
      if (resolved) return;
      resolved = true;

      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      acceptBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeyDown);

      resolve(result);
    }

    function onConfirm() {
      cleanup(true);
    }

    function onCancel() {
      cleanup(false);
    }

    function onBackdrop(e) {
      if (e.target === overlay) {
        cleanup(false);
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        cleanup(false);
      }
    }

    acceptBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeyDown);
  });
}

/**
 * Safe HTML Entity Escaper for Syntax Highlighting Injection
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render Content inside Modal based on current active tab with Prism Highlighting
 */
function renderContent() {
  if (!currentItem) return;

  let content = '';
  let typeLabel = '';
  let langClass = 'language-html';

  if (currentTab === 'html') {
    content = currentItem.html;
    typeLabel = 'HTML Code';
    langClass = 'language-html';
  } else if (currentTab === 'css') {
    content = currentItem.css;
    typeLabel = 'CSS Styles';
    langClass = 'language-css';
  } else if (currentTab === 'full') {
    content = generateSingleItemHTML(currentItem);
    typeLabel = 'Full Standalone HTML Document';
    langClass = 'language-html';
  }

  // 1. Assign correct language class
  modalContent.className = langClass;

  // 2. Safe HTML Entity Injection
  modalContent.innerHTML = escapeHtml(content);

  // 3. Trigger Prism Syntax Highlighting Engine
  if (typeof window !== 'undefined' && window.Prism && typeof window.Prism.highlightElement === 'function') {
    window.Prism.highlightElement(modalContent);
  }

  const lineCount = content.split('\n').length;
  modalInfo.textContent = `${lineCount} lines • ${typeLabel}`;
}

/**
 * Open Modal with the given item data (Button or Animation)
 */
export function openModal(item) {
  currentItem = item;
  currentTab = 'html';

  modalName.textContent = item.name;
  modalCategory.textContent = item.category.toUpperCase();

  // Set accent color
  modalOverlay.querySelector('.modal').style.setProperty('--modal-accent', item.accent || '#48dbfb');
  modalCategory.style.color = item.accent || '#48dbfb';

  // Set active tab
  tabs.forEach(t => t.classList.remove('active'));
  const activeTabBtn = document.querySelector(`.modal-tab-btn[data-tab="html"]`);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  renderContent();

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Close Modal
 */
export function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Copy currently displayed text to clipboard
 */
async function copyCurrentCode() {
  if (!currentItem) return;

  let textToCopy = '';
  if (currentTab === 'html') {
    textToCopy = currentItem.html;
  } else if (currentTab === 'css') {
    textToCopy = currentItem.css;
  } else if (currentTab === 'full') {
    textToCopy = generateSingleItemHTML(currentItem);
  }

  const onSuccess = () => {
    copyBtn.classList.add('copied');
    const origHtml = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
    showToast(`تم نسخ ${currentTab.toUpperCase()} بنجاح إلى الحافظة!`);

    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = origHtml;
    }, 1800);
  };

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      onSuccess();
    } catch {
      fallbackCopy(textToCopy, onSuccess);
    }
  } else {
    fallbackCopy(textToCopy, onSuccess);
  }
}

/**
 * Fallback copy using textarea
 */
function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Copy fallback error:', err);
  }

  document.body.removeChild(ta);
  if (success && callback) {
    callback();
  } else {
    showToast('تعذر النسخ التلقائي!');
  }
}

/**
 * Initialize Modal Event Listeners
 */
export function initModal() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderContent();
    });
  });

  // Close actions
  if (modalClose) modalClose.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCurrentCode);
  }

  // Direct HTML Download button
  if (downloadHtmlBtn) {
    downloadHtmlBtn.addEventListener('click', () => {
      if (!currentItem) return;
      const htmlContent = generateSingleItemHTML(currentItem);
      downloadHTMLFile(`${currentItem.id}.html`, htmlContent);
      showToast(`جاري تحميل ملف ${currentItem.id}.html...`);
    });
  }
}
