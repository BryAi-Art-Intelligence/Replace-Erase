// 16-brown-letter-sections.js
// Overrides the brown menu layout so alphabet order reads vertically by letter sections.
// Each first letter gets its own box, and chips stay alphabetical inside that box.

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

    const title = document.createElement("div");
    title.className = "brown-letter-title";
    title.textContent = letter;

    const rows = document.createElement("div");
    rows.className = "brown-letter-rows";

    groups.get(letter)
      .sort((a,b) => String(a.label).localeCompare(String(b.label)))
      .forEach(item => rows.appendChild(createBrownChip(item)));

    section.appendChild(title);
    section.appendChild(rows);
    menu.appendChild(section);
  });
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
    wrap.classList.toggle("open-function-menu");
    wrap.classList.remove("open-labelless-menu");
  });

  labellessToggle.addEventListener("click", e => {
    e.stopPropagation();
    wrap.classList.toggle("open-labelless-menu");
    wrap.classList.remove("open-function-menu");
  });

  wrap.appendChild(functionToggle);
  wrap.appendChild(labellessToggle);
  wrap.appendChild(functionMenu);
  wrap.appendChild(labellessMenu);

  codeView.prepend(wrap);
}
