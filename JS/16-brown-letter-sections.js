// 16-brown-letter-sections.js
// Overrides the brown menu layout so alphabet order reads vertically by letter sections.
// Each first letter gets its own box, and chips stay alphabetical inside that box.
// Single tap selects and opens Toolbar 2. Rename / Review now live in Toolbar 2.

let brownMenuScrollMemory = {
  functions: 0,
  labelless: 0
};

let currentBrownToolbarItem = null;

function rememberBrownMenuScroll(){
  const functionMenu = document.querySelector(".brown-index-menu.function-list");
  const labellessMenu = document.querySelector(".brown-index-menu.labelless-list");

  if (functionMenu) brownMenuScrollMemory.functions = functionMenu.scrollTop;
  if (labellessMenu) brownMenuScrollMemory.labelless = labellessMenu.scrollTop;
}

function restoreBrownMenuScroll(){
  requestAnimationFrame(() => {
    const functionMenu = document.querySelector(".brown-index-menu.function-list");
    const labellessMenu = document.querySelector(".brown-index-menu.labelless-list");

    if (functionMenu) functionMenu.scrollTop = brownMenuScrollMemory.functions || 0;
    if (labellessMenu) labellessMenu.scrollTop = brownMenuScrollMemory.labelless || 0;
  });
}

function scrollToBrownItemCode(item){
  const keys = getBrownItemLineKeys(item);
  const firstKey = keys[0];
  const firstLine = firstKey ? firstKey.split(":")[1] : null;

  requestAnimationFrame(() => {
    const section = codeView.querySelector(`.code-section[data-index="${item.index}"]`);
    if (!section) return;

    let target = section;

    if (firstLine){
      const lineButton = section.querySelector(`.line-number-box[data-line="${firstLine}"]`);
      const row = lineButton ? lineButton.closest(".code-line") : null;
      if (row) target = row;
    }

    const top = target.offsetTop - 90;
    codeView.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  });
}

function openBrownItemCode(item){
  rememberBrownMenuScroll();

  const keys = getBrownItemLineKeys(item);

  selectedLines = new Set(keys);

  const part = currentParts[item.index];
  activeType = part ? part.type : null;

  expandedBlocks.clear();
  expandedBlocks.add(item.index);
  setPanelColor(activeType);

  renderBlockMode();
  restoreBrownMenuScroll();
  scrollToBrownItemCode(item);
}

function selectBrownItemAndShowToolbar2(item){
  currentBrownToolbarItem = item;

  /*
    A function tap is a command:
    open the real code, select the function's lines,
    and scroll directly to where it lives.
  */
  openBrownItemCode(item);

  if (typeof showToolbar2 === "function"){
    showToolbar2(item);
  }
}

function createBrownChip(item){
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "brown-index-chip";
  chip.classList.toggle("brown-chip-selected", brownItemIsSelected(item));
  chip.textContent = item.label;

  chip.addEventListener("contextmenu", e => {
    e.preventDefault();
    e.stopPropagation();
  });

  chip.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    selectBrownItemAndShowToolbar2(item);
  });

  return chip;
}

function getBrownSectionLetter(label){
  const clean = String(label || "")
    .replace(/^[.#]/, "")
    .replace(/\(\)$/, "")
    .trim();

  const first = clean.charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(first) ? first : "#";
}

function makeBrownLetterSections(items, menu){
  const groups = new Map();

  items.forEach(item => {
    const letter = getBrownSectionLetter(item.label);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(item);
  });

  [...groups.keys()].sort((a,b) => a.localeCompare(b)).forEach(letter => {
    const section = document.createElement("div");
    section.className = "brown-letter-section";

    const title = document.createElement("button");
    title.type = "button";
    title.className = "brown-letter-title";
    title.textContent = letter;
    title.setAttribute("aria-expanded", "false");

    const rows = document.createElement("div");
    rows.className = "brown-letter-rows";

    groups.get(letter)
      .sort((a,b) => String(a.label).localeCompare(String(b.label)))
      .forEach(item => rows.appendChild(createBrownChip(item)));

    title.addEventListener("click", e => {
      e.stopPropagation();

      const isOpen = section.classList.toggle("brown-letter-open");
      title.setAttribute("aria-expanded", String(isOpen));
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

function buildBrownIndexBar(){
  const old = codeView.querySelector(".brown-index-wrap");
  if (old) old.remove();

  if (!currentParts.length) return;

  const wrap = document.createElement("div");
  wrap.className = "brown-index-wrap open-function-menu brown-letter-mode";

  const functionToggle = document.createElement("button");
  functionToggle.type = "button";
  functionToggle.className = "function-menu-toggle";
  functionToggle.textContent = "FUNCTIONS";

  const labellessToggle = document.createElement("button");
  labellessToggle.type = "button";
  labellessToggle.className = "function-menu-toggle";
  labellessToggle.textContent = "LABELLESS";

  const functionMenu = document.createElement("div");
  functionMenu.className = "brown-index-menu function-list";

  const labellessMenu = document.createElement("div");
  labellessMenu.className = "brown-index-menu labelless-list";

  functionMenu.addEventListener("scroll", () => {
    brownMenuScrollMemory.functions = functionMenu.scrollTop;
  }, { passive:true });

  labellessMenu.addEventListener("scroll", () => {
    brownMenuScrollMemory.labelless = labellessMenu.scrollTop;
  }, { passive:true });

  const functionItems = [];
  const labellessItems = [];

  currentParts.forEach((part, index) => {
    if (!part || !part.content) return;

    const content = String(part.content).trim();
    const functionMatches = [...content.matchAll(/function\s+([A-Za-z0-9_$]+)\s*\(/g)];

    if (part.type === "js" && functionMatches.length){
      functionMatches.forEach(match => {
        functionItems.push({
          index,
          label: match[1] + "()",
          startText: match[0]
        });
      });
    }

    if (part.type === "css"){
      const lines = content.split("\n");

      lines.forEach(line => {
        const selector = getCssSelectorName(line);

        if (selector){
          functionItems.push({
            index,
            label: selector,
            startText: line.trim()
          });
        }
      });
    }

    if (part.type === "js" && !functionMatches.length && content.length){
      labellessItems.push({
        index,
        label: `js-${index + 1}`,
        wholeBlock: true
      });
    }
  });

  functionItems.sort((a,b) => String(a.label).localeCompare(String(b.label)));
  labellessItems.sort((a,b) => String(a.label).localeCompare(String(b.label)));

  makeBrownLetterSections(functionItems, functionMenu);
  makeBrownLetterSections(labellessItems, labellessMenu);

  functionToggle.addEventListener("click", e => {
    e.stopPropagation();
    rememberBrownMenuScroll();
    wrap.classList.toggle("open-function-menu");
    wrap.classList.remove("open-labelless-menu");
    restoreBrownMenuScroll();
  });

  labellessToggle.addEventListener("click", e => {
    e.stopPropagation();
    rememberBrownMenuScroll();
    wrap.classList.toggle("open-labelless-menu");
    wrap.classList.remove("open-function-menu");
    restoreBrownMenuScroll();
  });

  wrap.appendChild(functionToggle);
  wrap.appendChild(labellessToggle);
  wrap.appendChild(functionMenu);
  wrap.appendChild(labellessMenu);

  codeView.prepend(wrap);
  restoreBrownMenuScroll();
}
