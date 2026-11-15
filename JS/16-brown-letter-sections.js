// 16-brown-letter-sections.js
// Replace & Erase — 3-column A-Z + ? index.
// Fixed alphabet, no bottom menu fade; preserves selection and Toolbar 2.

let brownMenuScrollMemory = { functions: 0, labelless: 0 };
let currentBrownToolbarItem = null;

function getActiveBrownMenu(){
  const wrap = document.querySelector('body > .brown-index-wrap.brown-letter-mode');
  if (!wrap) return null;
  if (wrap.classList.contains('open-labelless-menu')) return wrap.querySelector('.labelless-list');
  return wrap.querySelector('.function-list');
}

// Kept for compatibility with existing calls. The alphabet never fades.
function updateBrownMenuFade(){
  const wrap = document.querySelector('body > .brown-index-wrap.brown-letter-mode');
  if (!wrap) return;
  wrap.classList.remove('brown-has-more');
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
    const view = document.querySelector('#codeView') || document.querySelector('.code-view');
    if (!view) return;
    const section = view.querySelector(`.code-section[data-index="${item.index}"]`);
    if (!section) return;
    let target = section;
    if (firstLine){
      const lineButton = section.querySelector(`.line-number-box[data-line="${firstLine}"]`);
      const row = lineButton ? lineButton.closest('.code-line') : null;
      if (row) target = row;
    }
    view.scrollTo({ top: Math.max(0, target.offsetTop - 90), behavior: 'smooth' });
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
    const view = document.querySelector('#codeView') || document.querySelector('.code-view');
    if (view?.dataset.renameHidden === 'true') showRenameArrangeSection(item);
    else selectBrownItemAndShowToolbar2(item);
  });
  return chip;
}

function getBrownSectionLetter(label){
  const clean = String(label || '').replace(/^[.#]/, '').replace(/\(\)$/, '').trim();
  const first = clean.charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(first) ? first : '#';
}

function makeBrownLetterSections(items, menu, fixedAlphabet = false){
  const groups = new Map();
  items.forEach(item => {
    const letter = getBrownSectionLetter(item.label);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(item);
  });

  const letters = fixedAlphabet
    ? [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
    : [...groups.keys()].sort((a,b) => a.localeCompare(b));

  letters.forEach(letter => {
    const entries = groups.get(letter) || [];
    const section = document.createElement('div');
    section.className = 'brown-letter-section';
    if (!entries.length) section.classList.add('brown-letter-empty');

    const title = document.createElement('button');
    title.type = 'button';
    title.className = 'brown-letter-title';
    title.dataset.letter = letter;
    title.setAttribute('aria-expanded', 'false');
    title.disabled = !entries.length;

    const letterSpan = document.createElement('span');
    letterSpan.textContent = letter;
    letterSpan.style.display = 'block';
    letterSpan.style.transform = 'translateX(1.9px)';
    title.appendChild(letterSpan);

    const rows = document.createElement('div');
    rows.className = 'brown-letter-rows';
    entries.sort((a,b) => String(a.label).localeCompare(String(b.label)))
      .forEach(item => rows.appendChild(createBrownChip(item)));

    title.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = section.classList.contains('brown-letter-open');
      menu.querySelectorAll('.brown-letter-open').forEach(other => {
        other.classList.remove('brown-letter-open');
        other.querySelector('.brown-letter-title')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen){
        section.classList.add('brown-letter-open');
        title.setAttribute('aria-expanded', 'true');
      }
      updateBrownMenuFade();
    });

    section.appendChild(title);
    section.appendChild(rows);
    menu.appendChild(section);
  });

  // Nonalphabetic names, if any, remain accessible through a # section.
  if (fixedAlphabet){
    const extras = [...groups.keys()].filter(letter => !/^[A-Z]$/.test(letter));
    if (extras.length){
      const extraItems = extras.flatMap(letter => groups.get(letter));
      const labellessMenu = menu.parentElement?.querySelector('.labelless-list');
      // Extra items are added to the ? menu during buildBrownIndexBar.
      menu._brownExtraItems = extraItems;
    }
  }
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
  document.getElementById('brown-right-menu-layout')?.remove();
  // Remove styles injected by the previous two-column/LL versions if present.
  document.getElementById('brown-az-grid-style')?.remove();
  document.getElementById('brown-az-two-column-fix')?.remove();
  document.getElementById('brown-az-three-column')?.remove();
  const style = document.createElement('style');
  style.id = 'brown-right-menu-layout';
  style.textContent = `
body > .brown-index-wrap.brown-letter-mode {
  position: fixed !important;
  top: 112px !important;
  bottom: 145px !important;
  right: 8px !important;
  left: auto !important;
  width: 112px !important;
  height: auto !important;
  box-sizing: border-box !important;
  padding: 0 3px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0 !important;
  overflow: visible !important;
  background: transparent !important;
  z-index: 1000 !important;
  pointer-events: auto !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}
body > .brown-index-wrap.brown-letter-mode::before,
body > .brown-index-wrap.brown-letter-mode::after {
  display: none !important;
  content: none !important;
}
body > .brown-index-wrap .function-menu-toggle {
  position: relative;
  z-index: 2;
  flex: 0 0 auto !important;
  width: 100% !important;
  min-width: 0 !important;
  padding: 7px 2px !important;
  font-size: 8px !important;
  white-space: pre-line !important;
  overflow-wrap: anywhere !important;
}
body > .brown-index-wrap .function-menu-toggle:first-of-type {
  position: absolute !important;
  bottom: calc(100% + 12px) !important;
  left: 0 !important;
  transform: perspective(500px) rotateX(-8deg) rotateY(-10deg) rotateZ(3deg) scale(1.35) !important;
  transform-origin: center bottom !important;
  -webkit-transform: perspective(500px) rotateX(-8deg) rotateY(-10deg) rotateZ(3deg) scale(1.35) !important;
  -webkit-transform-origin: center bottom !important;
  box-shadow: 0 0 10px rgba(62,40,26,.45) !important;
}
body > .brown-index-wrap .brown-index-menu {
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  -webkit-mask-image: none !important;
  mask-image: none !important;
  scrollbar-width: none;
}
body > .brown-index-wrap .brown-index-menu::-webkit-scrollbar { display: none; }
body > .brown-index-wrap .function-list,
body > .brown-index-wrap.open-function-menu .function-list,
body > .brown-index-wrap.open-labelless-menu .function-list {
  display: grid !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  grid-template-rows: repeat(9, minmax(0, 1fr)) !important;
  grid-auto-flow: row !important;
  align-items: center !important;
  align-content: stretch !important;
  justify-content: stretch !important;
  column-gap: 5px !important;
  row-gap: 0 !important;
  order: 1 !important;
}
body > .brown-index-wrap .function-list .brown-letter-section {
  position: relative !important;
  box-sizing: border-box !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  grid-column: auto !important;
  align-self: center !important;
}
body > .brown-index-wrap .function-list .brown-letter-title,
body > .brown-index-wrap .brown-question-square {
  display: grid !important;
  place-items: center !important;
  box-sizing: border-box !important;
  width: 100% !important;
  min-width: 0 !important;
  aspect-ratio: 1 / 1 !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 2px solid #7b4a2a !important;
  border-radius: 8px !important;
  background: #3E281A !important;
  color: #ffd6aa !important;
  font-size: 17px !important;
  font-weight: 900 !important;
  line-height: 1 !important;
  transform: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
  overflow: visible !important;
  isolation: isolate !important;
  cursor: pointer;
}
body > .brown-index-wrap .brown-letter-title::before { display: none !important; }
body > .brown-index-wrap .brown-letter-section.brown-letter-empty .brown-letter-title {
  background: #514942 !important;
  border-color: #625b54 !important;
  color: #928981 !important;
  opacity: .65 !important;
  pointer-events: none !important;
}
body > .brown-index-wrap .function-list .brown-question-square {
  position: relative !important;
  z-index: 2 !important;
  order: initial !important;
  align-self: center !important;
  padding: 0 !important;
  white-space: nowrap !important;
  overflow-wrap: normal !important;
}
body > .brown-index-wrap.open-labelless-menu .brown-question-square {
  border-color: #ffd6aa !important;
}
body > .brown-index-wrap .brown-letter-rows {
  display: none !important;
  position: absolute !important;
  right: calc(100% + 9px) !important;
  top: 0 !important;
  width: 150px !important;
  max-width: 43vw !important;
  max-height: 45vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 5px !important;
  box-sizing: border-box !important;
  border-radius: 10px !important;
  background: rgba(245,241,235,.97) !important;
  box-shadow: 0 4px 18px rgba(62,40,26,.18) !important;
  z-index: 20 !important;
}
body > .brown-index-wrap .brown-letter-section.brown-letter-open .brown-letter-rows {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}
body > .brown-index-wrap .brown-index-chip {
  width: 100% !important;
  max-width: 100% !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  font-size: 10px !important;
  padding: 7px 3px !important;
}
body > .brown-index-wrap .labelless-list,
body > .brown-index-wrap.open-labelless-menu .labelless-list {
  display: none !important;
  position: absolute !important;
  right: calc(100% + 8px) !important;
  bottom: 0 !important;
  width: 150px !important;
  max-width: 43vw !important;
  max-height: 65% !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 5px !important;
  border-radius: 10px !important;
  background: rgba(245,241,235,.97) !important;
  box-shadow: 0 4px 18px rgba(62,40,26,.18) !important;
  z-index: 20 !important;
}
body > .brown-index-wrap.open-labelless-menu .labelless-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;
}
body > .brown-index-wrap .labelless-list .brown-letter-section,
body > .brown-index-wrap .labelless-list .brown-letter-rows { width: 100% !important; }
body > .brown-index-wrap .labelless-list .brown-letter-title {
  width: 100% !important;
  font-size: 14px !important;
  padding: 6px !important;
  background: #3E281A !important;
  color: #ffd6aa !important;
  border: 2px solid #7b4a2a !important;
  border-radius: 8px !important;
}
body > .brown-index-wrap .labelless-list .brown-letter-rows {
  position: static !important;
  max-width: none !important;
  max-height: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
body > .brown-index-wrap .brown-haze-layer {
  position: absolute !important;
  inset: 0 !important;
  overflow: visible !important;
  pointer-events: none !important;
  z-index: 0 !important;
}
body > .brown-index-wrap .brown-haze-spot {
  position: absolute !important;
  width: 150px !important;
  height: 145px !important;
  background: radial-gradient(ellipse at 70% 25%, rgba(164,156,145,1) 0%, rgba(164,156,145,.75) 25%, rgba(164,156,145,.35) 48%, rgba(164,156,145,0) 75%) !important;
  filter: blur(24px) !important;
  pointer-events: none !important;
}
body > .brown-index-wrap .function-list { position: relative !important; z-index: 1 !important; }
`;
  document.head.appendChild(style);
}

function updateBrownHaze(){
  const wrap = document.querySelector('body > .brown-index-wrap.brown-letter-mode');
  if (!wrap) return;
  const layer = wrap.querySelector('.brown-haze-layer');
  if (!layer) return;
  layer.replaceChildren();
  const menu = wrap.querySelector('.function-list');
  if (!menu) return;
  const wrapRect = wrap.getBoundingClientRect();
  menu.querySelectorAll('.brown-letter-title:not(:disabled)').forEach(button => {
    const rect = button.getBoundingClientRect();
    const spot = document.createElement('div');
    spot.className = 'brown-haze-spot';
    spot.style.left = `${rect.left - wrapRect.left - 65}px`;
    spot.style.top = `${rect.bottom - wrapRect.top - 80}px`;
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

  const questionToggle = document.createElement('button');
  questionToggle.type = 'button';
  questionToggle.className = 'function-menu-toggle brown-question-square';
  questionToggle.textContent = '?';
  questionToggle.title = 'LABELLESS';
  questionToggle.setAttribute('aria-label', 'LABELLESS');

  const functionMenu = document.createElement('div');
  functionMenu.className = 'brown-index-menu function-list';
  const labellessMenu = document.createElement('div');
  labellessMenu.className = 'brown-index-menu labelless-list';

  labellessMenu.addEventListener('scroll', () => {
    brownMenuScrollMemory.labelless = labellessMenu.scrollTop;
  }, { passive:true });

  const functionItems = [];
  const labellessItems = [];
  currentParts.forEach((part, index) => {
    if (!part || !part.content) return;
    const content = String(part.content).trim();
    const functionMatches = [...content.matchAll(/function\s+([A-Za-z0-9_$]+)\s*\(/g)];
    if (part.type === 'js' && functionMatches.length){
      functionMatches.forEach(match => {
        functionItems.push({ index, label: match[1] + '()', startText: match[0] });
      });
    }
    if (part.type === 'css'){
      content.split('\n').forEach(line => {
        const selector = getCssSelectorName(line);
        if (selector) functionItems.push({ index, label: selector, startText: line.trim() });
      });
    }
    if (part.type === 'js' && !functionMatches.length && content.length){
      labellessItems.push({ index, label: `js-${index + 1}`, wholeBlock:true });
    }
  });
  functionItems.sort((a,b) => String(a.label).localeCompare(String(b.label)));
  labellessItems.sort((a,b) => String(a.label).localeCompare(String(b.label)));

  makeBrownLetterSections(functionItems, functionMenu, true);
  const extraItems = functionMenu._brownExtraItems || [];
  makeBrownLetterSections([...labellessItems, ...extraItems], labellessMenu);
  functionMenu.appendChild(questionToggle); // The 27th grid cell: Y, Z, ?

  functionToggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const view = document.querySelector('#codeView') || document.querySelector('.code-view');
    if (!view){ console.warn('Code view not found'); return; }
    const isHidden = view.dataset.renameHidden === 'true';
    let partsFrame = document.getElementById('rename-parts-frame');
    if (!partsFrame){
      partsFrame = document.createElement('iframe');
      partsFrame.id = 'rename-parts-frame';
      partsFrame.src = './parts.html';
      partsFrame.title = 'The Parts';
      Object.assign(partsFrame.style, {
        position: 'fixed', top: '70px', left: '12px',
        width: 'calc(100% - 117px)', height: 'calc(100% - 160px)',
        border: 'none', background: 'transparent', zIndex: '900', display: 'none'
      });
      document.body.appendChild(partsFrame);
    }
    partsFrame.style.display = isHidden ? 'none' : 'block';
    view.style.transition = 'opacity 0.8s ease';
    if (isHidden){
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

  questionToggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    rememberBrownMenuScroll();
    const opening = !wrap.classList.contains('open-labelless-menu');
    wrap.classList.toggle('open-labelless-menu', opening);
    functionMenu.querySelectorAll('.brown-letter-open').forEach(section => {
      section.classList.remove('brown-letter-open');
      section.querySelector('.brown-letter-title')?.setAttribute('aria-expanded', 'false');
    });
    restoreBrownMenuScroll();
  });

  const hazeLayer = document.createElement('div');
  hazeLayer.className = 'brown-haze-layer';
  wrap.appendChild(hazeLayer);
  wrap.appendChild(functionToggle);
  wrap.appendChild(functionMenu);
  wrap.appendChild(labellessMenu);
  document.body.appendChild(wrap);
  restoreBrownMenuScroll();
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
  if (preview.dataset.itemKey === `${item.index}:${item.label}`){
    preview.remove();
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
    position: 'fixed', top: '70px', left: '12px', right: '105px',
    bottom: '90px', overflowY: 'auto', overflowX: 'auto',
    zIndex: '5', background: 'transparent', pointerEvents: 'auto'
  });
}

/* REPLACE & ERASE — MULTI BLUE LETTERS */
function updateBrownLetterSelection(){
  document.querySelectorAll('.brown-letter-section').forEach(section => {
    const letter = section.querySelector('.brown-letter-title');
    const chips = section.querySelectorAll('.brown-index-chip');
    const selected = [...chips].some(chip => {
      const item = chip.brownItem;
      return item && getBrownItemLineKeys(item).some(key => selectedLines.has(key));
    });
    if (letter) letter.classList.toggle('brown-letter-blue', selected);
  });
}


/* REPLACE & ERASE — RESTORE RENAME & ARRANGE */

(function(){

  const style = document.createElement('style');
  style.id = 'brown-restore-rename-button';

  style.textContent = `
    body > .brown-index-wrap.brown-letter-mode
    .function-menu-toggle:first-of-type {
      position: absolute !important;
      top: -72px !important;
      bottom: auto !important;
      left: 0 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 10 !important;
    }
  `;

  document.head.appendChild(style);

})();

