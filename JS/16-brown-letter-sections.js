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
  chip.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
  });
  chip.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    selectBrownItemAndShowToolbar2(item);
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
    title.textContent = letter;
    title.setAttribute('aria-expanded', 'false');
    const rows = document.createElement('div');
    rows.className = 'brown-letter-rows';
    groups.get(letter)
      .sort((a,b) => String(a.label).localeCompare(String(b.label)))
      .forEach(item => rows.appendChild(createBrownChip(item)));
    title.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = section.classList.toggle('brown-letter-open');
      title.setAttribute('aria-expanded', String(isOpen));
      requestAnimationFrame(updateBrownMenuFade);
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
  bottom:110px !important;
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
  background:#3a2416;
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
  body > .brown-index-wrap .function-menu-toggle:first-child {
  transform: perspective(300px) rotateY(-18deg) rotateZ(4deg) scale(1.1) !important;
  transform-origin:center center !important;
}
body > .brown-index-wrap .brown-index-menu {
  display:none !important;
  width:100% !important;
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
  padding:4px 0 14px !important;
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
  padding:2px !important;
  border:1px solid #7b4a2a !important;
  border-radius:12px !important;
  background:#3a2416 !important;
  color:#ffd6aa !important;
  font-weight:900 !important;
  font-size:30px !important;
  cursor:pointer;
}
body > .brown-index-wrap .brown-letter-section.brown-letter-open .brown-letter-title {
  aspect-ratio:auto !important;
  min-height:42px !important;
  padding:8px 2px !important;
  border-radius:14px !important;
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
`;
  document.head.appendChild(style);
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
  functionToggle.textContent = 'PARTS';
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
    e.stopPropagation();
    rememberBrownMenuScroll();
    wrap.classList.toggle('open-function-menu');
    wrap.classList.remove('open-labelless-menu');
    restoreBrownMenuScroll();
    requestAnimationFrame(updateBrownMenuFade);
  });
  labellessToggle.addEventListener('click', e => {
    e.stopPropagation();
    rememberBrownMenuScroll();
    wrap.classList.toggle('open-labelless-menu');
    wrap.classList.remove('open-function-menu');
    restoreBrownMenuScroll();
    requestAnimationFrame(updateBrownMenuFade);
  });
  wrap.appendChild(functionToggle);
  wrap.appendChild(labellessToggle);
  wrap.appendChild(functionMenu);
  wrap.appendChild(labellessMenu);
  document.body.appendChild(wrap);
  restoreBrownMenuScroll();
  requestAnimationFrame(updateBrownMenuFade);
}
