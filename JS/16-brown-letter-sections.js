// 16-brown-letter-sections.js
// Brown alphabetical menu — RIGHT SIDE.
// Dynamic vertical spacing, scrolling, bottom fade.
// Preserves code selection and Toolbar 2.

let brownMenuScrollMemory = { functions: 0, labelless: 0 };
let currentBrownToolbarItem = null;

function getActiveBrownMenu(){
  const wrap = document.querySelector('body > .brown-index-wrap.brown-letter-mode');
  if (!wrap) return null;
  if (wrap.classList.contains('open-function-menu')) return wrap.querySelector('.function-list');
  if (wrap.classList.contains('open-labelless-menu')) return wrap.querySelector('.labelless-list');
  return null;
}

function updateBrownMenuFade(){
  const wrap = document.querySelector('body > .brown-index-wrap.brown-letter-mode');
  if (!wrap) return;
  const menu = getActiveBrownMenu();
  if (!menu){ wrap.classList.remove('brown-has-more'); return; }
  const hasMore = menu.scrollHeight > menu.clientHeight + 2 &&
    menu.scrollTop + menu.clientHeight < menu.scrollHeight - 2;
  wrap.classList.toggle('brown-has-more', hasMore);
  requestAnimationFrame(updateBrownHaze);
}

function rememberBrownMenuScroll(){
  const functionMenu = document.querySelector('.brown-index-menu.function-list');
  const labellessMenu = document.querySelector('.brown-index-menu.labelless-list');
  if (functionMenu) brownMenuScrollMemory.functions = functionMenu.scrollTop;
  if (labellessMenu) brownMenuScrollMemory.labelless = labellessMenu.scrollTop;
}

function restoreBrownMenuScroll(){
  requestAnimationFrame(() => {
    const functionMenu = document.querySelector('.brown-index-menu.function-list');
    const labellessMenu = document.querySelector('.brown-index-menu.labelless-list');
    if (functionMenu) functionMenu.scrollTop = brownMenuScrollMemory.functions || 0;
    if (labellessMenu) labellessMenu.scrollTop = brownMenuScrollMemory.labelless || 0;
    updateBrownMenuFade();
  });
}

function scrollToBrownItemCode(item){
  const keys = getBrownItemLineKeys(item);
  const firstKey = keys[0];
  const firstLine = firstKey ? firstKey.split(':')[1] : null;
  requestAnimationFrame(() => {
    const section = codeView.querySelector(`.code-section[data-index="${item.index}"]`);
    if (!section) return;
    let target = section;
    if (firstLine){
      const lineButton = section.querySelector(`.line-number-box[data-line="${firstLine}"]`);
      const row = lineButton ? lineButton.closest('.code-line') : null;
      if (row) target = row;
    }
    const top = target.offsetTop - 90;
    codeView.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
}

function openBrownItemCode(item){
  rememberBrownMenuScroll();
  const keys = getBrownItemLineKeys(item);
  const alreadySelected = keys.length > 0 && keys.every(key => selectedLines.has(key));
  keys.forEach(key => {
    if (alreadySelected) selectedLines.delete(key);
    else selectedLines.add(key);
  });
  const part = currentParts[item.index];
  activeType = part ? part.type : null;
  expandedBlocks.add(item.index);
  setPanelColor(activeType);
  renderBlockMode();
  restoreBrownMenuScroll();
  scrollToBrownItemCode(item);
}

function selectBrownItemAndShowToolbar2(item){
  currentBrownToolbarItem = item;
  openBrownItemCode(item);
  if (typeof showToolbar2 === 'function') showToolbar2(item);
}

function createBrownChip(item){
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'brown-index-chip';
  chip.classList.toggle('brown-chip-selected', brownItemIsSelected(item));
  chip.textContent = item.label;
  chip.brownItem = item;
  chip.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
  });
  chip.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

if (document.querySelector('#codeView')?.dataset.renameHidden === 'true') {

  showRenameArrangeSection(item);
} else {
  selectBrownItemAndShowToolbar2(item);
}
  });
  return chip;
}

function getBrownSectionLetter(label){
  const clean = String(label || '').replace(/^[.#]/, '').replace(/\(\)$/, '').trim();
  const first = clean.charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(first) ? first : '#';
}

function makeBrownLetterSections(items, menu){
  const groups = new Map();
  items.forEach(item => {
    const letter = getBrownSectionLetter(item.label);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(item);
  });
  [...groups.keys()].sort((a,b) => a.localeCompare(b)).forEach(letter => {
    const section = document.createElement('div');
    section.className = 'brown-letter-section';
    const title = document.createElement('button');
    title.type = 'button';
    title.className = 'brown-letter-title';
const letterSpan = document.createElement('span');
letterSpan.textContent = letter;
letterSpan.style.display = 'block';
letterSpan.style.transform = 'translateX(1.9px)';
title.appendChild(letterSpan);
    title.dataset.letter = letter;
    title.setAttribute('aria-expanded', 'false');
    const rows = document.createElement('div');
    rows.className = 'brown-letter-rows';
    groups.get(letter)
      .sort((a,b) => String(a.label).localeCompare(String(b.label)))
      .forEach(item => rows.appendChild(createBrownChip(item)));

title.addEventListener('click', e => {
  e.stopPropagation();

  // Open or close the letter section
  const isOpen = section.classList.toggle('brown-letter-open');
  title.setAttribute('aria-expanded', String(isOpen));

  // SCRIPTURE RED — TAP CONFIRMATION
  if (!title.classList.contains('brown-letter-blue')) {
    clearTimeout(title._brownPulseTimer);

    title.classList.remove('brown-apple-pulse');
    void title.offsetWidth;
    title.classList.add('brown-apple-pulse');

    title._brownPulseTimer = setTimeout(() => {
      title.classList.remove('brown-apple-pulse');
    }, 1400);
  }

  requestAnimationFrame(() => {
    updateBrownMenuFade();
    updateBrownHaze();
  });
});
 String(isOpen));
requestAnimationFrame(() => {
  updateBrownMenuFade();
  updateBrownHaze();
});
    });
    section.appendChild(title);
    section.appendChild(rows);
    menu.appendChild(section);
  });
}

function toggleBrownItemSelection(item){
  rememberBrownMenuScroll();
  const keys = getBrownItemLineKeys(item);
  if (!keys.length) return;
  const shouldRemove = keys.every(key => selectedLines.has(key));
  keys.forEach(key => {
    if (shouldRemove) selectedLines.delete(key);
    else selectedLines.add(key);
  });
  expandedBlocks.add(item.index);
  renderBlockMode();
  restoreBrownMenuScroll();
}

function installRightBrownMenuStyles(){
  const existing = document.getElementById('brown-right-menu-layout');
  if (existing) existing.remove();
  const style = document.createElement('style');
  style.id = 'brown-right-menu-layout';
  style.textContent = `
body > .brown-index-wrap.brown-letter-mode {
  position:fixed !important;
  background:transparent !important;
  left:auto !important;
  right:8px !important;
  top:20px !important;
bottom:45px !important;
  transform:none !important;
  box-sizing:border-box !important;
  width:72px !important;
  height:auto !important;
  max-height:none !important;
  padding:5px !important;
  display:flex !important;
  flex-direction:column !important;
  flex-wrap:nowrap !important;
  align-items:stretch !important;
  justify-content:flex-start !important;
  gap:6px !important;
  overflow:visible !important;
  z-index:1000 !important;
  border-radius:14px !important;
  pointer-events:auto !important;
  visibility:visible !important;
  opacity:1 !important;
}
/* FULL BROWN BACKGROUND — EXTENDS LEFT */

body > .brown-index-wrap.brown-letter-mode::before {
  content:"";
  position:absolute;
  top:0;
  bottom:0;
  right:0;
  width:90px;
  background:transparent;
  border-radius:0;
  pointer-events:none;
  z-index:-1;
}
body > .brown-index-wrap .function-menu-toggle {
  display:block !important;
  flex:0 0 auto !important;
  width:100% !important;
  min-width:0 !important;
  padding:7px 2px !important;
  font-size:8px !important;
  overflow-wrap:anywhere !important;
  white-space:normal !important;
  }
  body > .brown-index-wrap .function-menu-toggle:first-of-type {
  transform:perspective(500px) rotateX(-8deg) rotateY(-10deg) rotateZ(3deg) scale(1.65) !important;
  transform-origin:center center !important;

  -webkit-transform:perspective(500px) rotateX(-8deg) rotateY(-10deg) rotateZ(3deg) scale(1.65) !important;
  -webkit-transform-origin:center center !important;
}
body > .brown-index-wrap .brown-index-menu {
  display:none !important;
width:100% !important;
margin-left:0 !important;
padding:24px 0 0 10px !important;
  min-width:0 !important;
  flex:1 1 0 !important;
  min-height:0 !important;
  max-height:none !important;
  overflow-x:hidden !important;
  overflow-y:auto !important;
  flex-direction:column !important;
  flex-wrap:nowrap !important;
  align-items:stretch !important;
  justify-content:safe space-between !important;
  gap:6px !important;
  box-sizing:border-box !important;
  scrollbar-width:none;
  -ms-overflow-style:none;
  -webkit-overflow-scrolling:touch;
  overscroll-behavior:contain;
  touch-action:pan-y;
}
body > .brown-index-wrap .brown-index-menu::-webkit-scrollbar { display:none; }
body > .brown-index-wrap.open-function-menu .function-list { display:flex !important; }
body > .brown-index-wrap.open-labelless-menu .labelless-list { display:flex !important; }
body > .brown-index-wrap .brown-letter-section {
  width:100% !important;
  min-width:0 !important;
  flex:0 0 auto !important;
}
/* BROWN BUTTON — NATURAL CORNER FADE */

body > .brown-index-wrap .brown-letter-title {
  position:relative !important;
  isolation:isolate !important;
  overflow:visible !important;
}

body > .brown-index-wrap .brown-letter-title::before {
  content:"";
  position:absolute;

  width:110px;
  height:125px;

  left:-48px;
  bottom:-55px;

  background:radial-gradient(
    ellipse at 70% 25%,
    rgba(58,36,22,.85) 0%,
    rgba(58,36,22,.55) 25%,
    rgba(58,36,22,.25) 48%,
    rgba(58,36,22,0) 75%
  );

  filter:blur(16px);
  pointer-events:none;
  z-index:-1;
}
body > .brown-index-wrap .brown-letter-title {
  display:grid !important;
  place-items:center !important;
  width:90% !important;
  min-width:0 !important;
  aspect-ratio:1 / 1 !important;
  flex:none !important;
margin:0 auto !important;
transform:translateX(0px) !important;
  padding:2px !important;
  border:3px solid #7b4a2a !important;
  border-radius:12px !important;
  background:#3E281A !important;
  color:#ffd6aa !important;
  font-weight:900 !important;
  font-size:30px !important;
  cursor:pointer;
}
body > .brown-index-wrap .brown-letter-section.brown-letter-open .brown-letter-title {
  aspect-ratio:1 / 1 !important;
  min-height:0 !important;
  padding:2px !important;
  border-radius:12px !important;
}
body > .brown-index-wrap .brown-letter-rows {
  display:none !important;
  width:100% !important;
  min-width:0 !important;
}
body > .brown-index-wrap .brown-letter-section.brown-letter-open .brown-letter-rows {
  display:flex !important;
  flex-direction:column !important;
  gap:4px !important;
}
body > .brown-index-wrap .brown-index-chip {
  width:100% !important;
  max-width:100% !important;
  white-space:normal !important;
  overflow-wrap:anywhere !important;
  font-size:9px !important;
  padding:7px 3px !important;
}
body > .brown-index-wrap.brown-letter-mode::after {
  content:"";
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  height:58px;
  background:linear-gradient(to bottom,transparent 0%,rgba(255,255,255,.08) 35%,rgba(255,255,255,.65) 100%);
  opacity:0;
  pointer-events:none;
  transition:opacity .2s ease;
  z-index:5;
}
body > .brown-index-wrap.brown-letter-mode.brown-has-more::after { opacity:1; }
body > .brown-index-wrap.brown-has-more .brown-index-menu {
  -webkit-mask-image:linear-gradient(to bottom,black 0%,black calc(100% - 55px),transparent 100%);
  mask-image:linear-gradient(to bottom,black 0%,black calc(100% - 55px),transparent 100%);
}
/* WIDER BROWN HAZE — LETTERS STAY PUT */

body > .brown-index-wrap .brown-index-menu {
  overflow-x:hidden !important;
}

/* Haze outside the scrolling container */
body > .brown-index-wrap .brown-letter-title::before {
  display:none !important;
}

body > .brown-index-wrap .brown-haze-layer {
  position:absolute;
  inset:0;
  overflow:visible;
  pointer-events:none;
  z-index:0;
}

body > .brown-index-wrap .brown-haze-spot {
  position:absolute;
  width:150px;
  height:145px;
background:radial-gradient(
  ellipse at 70% 25%,
  rgba(164,156,145,1) 0%,
  rgba(164,156,145,.75) 25%,
  rgba(164,156,145,.35) 48%,
  rgba(164,156,145,0) 75%
);
  filter:blur(24px);
  pointer-events:none;
}


body > .brown-index-wrap .brown-index-menu,
body > .brown-index-wrap .function-menu-toggle {
  position:relative;
  z-index:1;
}

/* BROWN GLOW — RENAME & ARRANGE + LABELLESS */
body > .brown-index-wrap .function-menu-toggle {
  box-shadow:0 0 10px rgba(62,40,26,.45) !important;
}

`;
  document.head.appendChild(style);
}
function updateBrownHaze(){
  const wrap = document.querySelector(
    'body > .brown-index-wrap.brown-letter-mode'
  );
  if (!wrap) return;

  const layer = wrap.querySelector('.brown-haze-layer');
  const menu = getActiveBrownMenu();
  if (!layer) return;

  layer.replaceChildren();
  if (!menu) return;

  const wrapRect = wrap.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  menu.querySelectorAll('.brown-letter-title').forEach(button => {
    const rect = button.getBoundingClientRect();

    // Only draw haze for buttons visible in the menu.
    if (rect.bottom <= menuRect.top ||
        rect.top >= menuRect.bottom) return;

    const spot = document.createElement('div');
    spot.className = 'brown-haze-spot';

    spot.style.left =
      `${rect.left - wrapRect.left - 65}px`;

    spot.style.top =
      `${rect.bottom - wrapRect.top - 80}px`;

    layer.appendChild(spot);
  });
}
function buildBrownIndexBar(){
  document.querySelectorAll('.brown-index-wrap').forEach(el => el.remove());
  if (!currentParts.length) return;
  installRightBrownMenuStyles();
  const wrap = document.createElement('div');
  wrap.className = 'brown-index-wrap open-function-menu brown-letter-mode';
  const functionToggle = document.createElement('button');
  functionToggle.type = 'button';
  functionToggle.className = 'function-menu-toggle';
functionToggle.textContent = 'rename\n& arrange';
functionToggle.style.whiteSpace = 'pre-line';
  const labellessToggle = document.createElement('button');
  labellessToggle.type = 'button';
  labellessToggle.className = 'function-menu-toggle';
  labellessToggle.textContent = 'LABELLESS';
  const functionMenu = document.createElement('div');
  functionMenu.className = 'brown-index-menu function-list';
  const labellessMenu = document.createElement('div');
  labellessMenu.className = 'brown-index-menu labelless-list';
  functionMenu.addEventListener('scroll', () => {
    brownMenuScrollMemory.functions = functionMenu.scrollTop;
    updateBrownMenuFade();
  }, { passive:true });
  labellessMenu.addEventListener('scroll', () => {
    brownMenuScrollMemory.labelless = labellessMenu.scrollTop;
    updateBrownMenuFade();
  }, { passive:true });
  const functionItems = [];
  const labellessItems = [];
  currentParts.forEach((part, index) => {
    if (!part || !part.content) return;
    const content = String(part.content).trim();
    const functionMatches = [...content.matchAll(/function\s+([A-Za-z0-9_$]+)\s*\(/g)];
    if (part.type === 'js' && functionMatches.length){
      functionMatches.forEach(match => {
        functionItems.push({ index, label:match[1] + '()', startText:match[0] });
      });
    }
    if (part.type === 'css'){
      content.split('\n').forEach(line => {
        const selector = getCssSelectorName(line);
        if (selector) functionItems.push({ index, label:selector, startText:line.trim() });
      });
    }
    if (part.type === 'js' && !functionMatches.length && content.length){
      labellessItems.push({ index, label:`js-${index + 1}`, wholeBlock:true });
    }
  });
  functionItems.sort((a,b) => String(a.label).localeCompare(String(b.label)));
  labellessItems.sort((a,b) => String(a.label).localeCompare(String(b.label)));
  makeBrownLetterSections(functionItems, functionMenu);
  makeBrownLetterSections(labellessItems, labellessMenu);
  functionToggle.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  const view = document.querySelector('#codeView') ||
               document.querySelector('.code-view');

  if (!view) {
    console.warn('Code view not found');
    return;
  }

  const isHidden = view.dataset.renameHidden === 'true';
    // PARTS POPUP — LOAD SEPARATE HTML FILE

let partsFrame = document.getElementById('rename-parts-frame');

if (!partsFrame) {
  partsFrame = document.createElement('iframe');
  partsFrame.id = 'rename-parts-frame';
  partsFrame.src = './parts.html';
  partsFrame.title = 'The Parts';

  Object.assign(partsFrame.style, {
    position: 'fixed',
    top: '70px',
    left: '12px',
    width: 'calc(100% - 117px)',
    height: 'calc(100% - 160px)',
    border: 'none',
    background: 'transparent',
    zIndex: '900',
    display: 'none'
  });

  document.body.appendChild(partsFrame);
}

partsFrame.style.display = isHidden ? 'none' : 'block';

  view.style.transition = 'opacity 0.8s ease';

  if (isHidden) {
    view.style.opacity = '1';
    view.style.pointerEvents = '';
    view.dataset.renameHidden = 'false';

functionToggle.style.color = '';

  } else {
    view.style.opacity = '0';
    view.style.pointerEvents = 'none';
    view.dataset.renameHidden = 'true';

functionToggle.style.color = '#FFCC33';

  }
});
  labellessToggle.addEventListener('click', e => {
    e.stopPropagation();
    rememberBrownMenuScroll();
    wrap.classList.toggle('open-labelless-menu');
    wrap.classList.remove('open-function-menu');
    restoreBrownMenuScroll();
    requestAnimationFrame(updateBrownMenuFade);
  });
  const hazeLayer = document.createElement('div');
hazeLayer.className = 'brown-haze-layer';
wrap.appendChild(hazeLayer);
  wrap.appendChild(functionToggle);
  wrap.appendChild(labellessToggle);
  wrap.appendChild(functionMenu);
  wrap.appendChild(labellessMenu);
  document.body.appendChild(wrap);
  restoreBrownMenuScroll();
  requestAnimationFrame(updateBrownMenuFade);
  requestAnimationFrame(updateBrownHaze);
requestAnimationFrame(updateBrownLetterSelection);
}

function showRenameArrangeSection(item){
  const part = currentParts[item.index];
  if (!part || typeof part.content !== 'string') return;

  const keys = getBrownItemLineKeys(item);
  if (!keys.length) return;

  const lines = part.content.split('\n');

  let preview = document.getElementById('rename-arrange-preview');

  if (!preview){
    preview = document.createElement('div');
    preview.id = 'rename-arrange-preview';
    document.body.appendChild(preview);
  }
    const previewOpen = document.getElementById('rename-arrange-preview');

  if (previewOpen && previewOpen.dataset.itemKey ===
      `${item.index}:${item.label}`) {
    previewOpen.remove();
    return;
  }

  const rows = keys.map(key => {
    const lineNumber = Number(key.split(':')[1]);
    const line = lines[lineNumber - 1] ?? '';

    return `
      <div class="code-line" data-line="${lineNumber}">
        <span class="line-number-box">${lineNumber}</span>
        <pre>${renderCodeHTML(line)}</pre>
      </div>
    `;
  }).join('');

  preview.innerHTML = `<div class="code-lines">${rows}</div>`;
  preview.dataset.itemKey = `${item.index}:${item.label}`;
  Object.assign(preview.style, {
    position: 'fixed',
    top: '70px',
    left: '12px',
    right: '105px',
    bottom: '90px',
    overflowY: 'auto',
    overflowX: 'auto',
    zIndex: '5',
    background: 'transparent',
    pointerEvents: 'auto'
  });
}


/* APPLE RED — SAFE VISIBLE CODE DETECTION */

(function () {
  let previousVisibleLetters = new Set();
  let scheduled = false;
  const pulseTimers = new WeakMap();

  function checkVisibleBrownLetters() {
    scheduled = false;

    const view = document.querySelector('#codeView');
    const menu = document.querySelector(
      'body > .brown-index-wrap.brown-letter-mode'
    );

    if (!view || !menu ||
        typeof getBrownItemLineKeys !== 'function') {
      previousVisibleLetters.clear();
      return;
    }

    const viewport = view.getBoundingClientRect();
    const visibleLetters = new Set();

    menu.querySelectorAll('.function-list .brown-index-chip')
      .forEach(chip => {
        const item = chip.brownItem;
        if (!item) return;

        const letter = chip.closest('.brown-letter-section')
          ?.querySelector('.brown-letter-title')
          ?.dataset.letter;

        if (!letter) return;

        const section = Array.from(
          view.querySelectorAll('.code-section')
        ).find(el => Number(el.dataset.index) === item.index);

        if (!section) return;

        const keys = getBrownItemLineKeys(item);

        const isVisible = keys.some(key => {
          const line = key.split(':')[1];

          const number = Array.from(
            section.querySelectorAll('.line-number-box')
          ).find(el => el.dataset.line === line);

          const row = number?.closest('.code-line');
          if (!row) return false;

          const rect = row.getBoundingClientRect();

          return rect.bottom > viewport.top &&
                 rect.top < viewport.bottom &&
                 rect.right > viewport.left &&
                 rect.left < viewport.right;
        });

        if (isVisible) visibleLetters.add(letter);
      });

    visibleLetters.forEach(letter => {
      if (previousVisibleLetters.has(letter)) return;

      const button = Array.from(
        menu.querySelectorAll(
          '.function-list .brown-letter-title'
        )
      ).find(el => el.dataset.letter === letter);

      if (!button ||
          button.classList.contains('brown-letter-blue')) return;

      const oldTimer = pulseTimers.get(button);
      if (oldTimer) clearTimeout(oldTimer);

      button.classList.add('brown-apple-pulse');

      const timer = setTimeout(() => {
        button.classList.remove('brown-apple-pulse');
        pulseTimers.delete(button);
      }, 1400);

      pulseTimers.set(button, timer);
    });

    previousVisibleLetters = visibleLetters;
  }

  function scheduleCheck() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(checkVisibleBrownLetters);
  }

  document.addEventListener('scroll', event => {
    if (event.target?.matches?.('#codeView, .code-view')) {
      scheduleCheck();
    }
  }, true);

  document.addEventListener('click', scheduleCheck);

  window.addEventListener('load', scheduleCheck);

  scheduleCheck();
})();




