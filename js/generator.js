/**
 * generator.js - Direct HTML File Generation & Client-Side Download Engine
 * Supports both Buttons and Animations in Standalone and Bundle exports
 */

// Universal base styles for standalone exports (Buttons + Animations)
const BASE_EXPORT_CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
  background-color: #0a0a1a;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image:
    radial-gradient(ellipse at 20% 20%, rgba(72, 219, 251, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(255, 107, 107, 0.06) 0%, transparent 50%);
  padding: 30px;
  direction: rtl;
}

/* Base Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  font-family: inherit;
  user-select: none;
  outline: none;
}

.btn i {
  font-size: 18px;
  transition: inherit;
}

.btn svg {
  display: inline-block;
  vertical-align: middle;
  transition: inherit;
}

.btn .loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
}

.btn .heart {
  width: 18px;
  height: 18px;
  background: currentColor;
  border-radius: 50%;
  display: inline-block;
  transition: all 0.3s;
}

/* Base Animation Elements */
.anim-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 90px;
  position: relative;
}

.anim-box {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background: var(--accent, #48dbfb);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  display: inline-block;
}

.anim-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--accent, #48dbfb);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  display: inline-block;
}

.anim-ring {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top: 3px solid var(--accent, #48dbfb);
  border-right: 3px solid var(--accent, #48dbfb);
  box-sizing: border-box;
  display: inline-block;
}

.anim-bar {
  width: 65px;
  height: 6px;
  border-radius: 3px;
  background: var(--accent, #48dbfb);
  display: inline-block;
}

.anim-dots {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.anim-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent, #48dbfb);
  display: inline-block;
}

.anim-text {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent, #48dbfb);
  letter-spacing: 2px;
  display: inline-block;
}

svg.icon-svg {
  width: 45px;
  height: 45px;
  fill: none;
  stroke: var(--accent, #48dbfb);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  display: inline-block;
}

/* Keyframes */
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes heartBeat { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
`;

/**
 * Direct file download in the browser using Blob URL
 */
export function downloadHTMLFile(filename, content) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a complete, self-contained HTML page for a single item (Button or Animation)
 */
export function generateSingleItemHTML(item) {
  const hasFaIcon = item.html.includes('fa-') || item.html.includes('fas ') || item.html.includes('fab ');
  const faCDN = hasFaIcon
    ? '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />\n'
    : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.name}</title>
${faCDN}    <style>
${BASE_EXPORT_CSS}
${item.css}
    </style>
</head>
<body>

    <!-- ${item.name} -->
    <div style="--accent: ${item.accent || '#48dbfb'};">
        ${item.html}
    </div>

</body>
</html>`;
}

/**
 * Generates a complete standalone Showcase page for a bundle of items
 */
export function generateBundleHTML(selectedItems) {
  const hasFaIcon = selectedItems.some(b => b.html.includes('fa-') || b.html.includes('fas ') || b.html.includes('fab '));
  const faCDN = hasFaIcon
    ? '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />\n'
    : '';

  const mergedCss = selectedItems.map(b => `/* ${b.name} (${b.id}) */\n${b.css}`).join('\n\n');

  const itemsMarkup = selectedItems.map(b => `
        <div class="bundle-item" style="--accent: ${b.accent || '#48dbfb'};">
            <div class="item-wrap">
                ${b.html}
            </div>
            <span class="item-label">${b.name}</span>
        </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حزمة العناصر المختارة (${selectedItems.length}) - NexusUI</title>
${faCDN}    <style>
${BASE_EXPORT_CSS}

/* Showcase Grid Layout */
body {
    display: block;
    padding: 50px 20px;
    text-align: center;
}

.bundle-header {
    max-width: 800px;
    margin: 0 auto 40px;
}

.bundle-header h1 {
    font-size: 32px;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #48dbfb, #a29bfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.bundle-header p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
}

.bundle-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
}

.bundle-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 30px 25px 20px;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    transition: transform 0.3s;
}

.bundle-item:hover {
    transform: translateY(-4px);
    border-color: rgba(72, 219, 251, 0.3);
}

.bundle-item .item-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
}

/* Custom Selected Styles */
${mergedCss}
    </style>
</head>
<body>

    <div class="bundle-header">
        <h1>حزمة العناصر المختارة</h1>
        <p>تم تجميع ${selectedItems.length} عنصر مخصص وجاهز للاستخدام المباشر</p>
    </div>

    <div class="bundle-grid">
${itemsMarkup}
    </div>

</body>
</html>`;
}
