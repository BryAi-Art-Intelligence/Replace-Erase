// 13-functions-menu.js
// Builds the brown menu for fast function/block access.
// Lets BryAi jump to or replace important code chunks from the top menu.

function getBrownIndexLabel(part, index){
  const content = String(part.content || "").trim();

  const classMatch = content.match(/class=["']([^"']+)["']/i);
  const idMatch = content.match(/id=["']([^"']+)["']/i);
  const functionMatch = content.match(/function\s+([A-Za-z0-9_$]+)/);
  const cssMatch = content.match(/([.#][A-Za-z0-9_-]+)\s*\{/);

  if (idMatch) return "#" + idMatch[1];
  if (classMatch) return "." + classMatch[1].split(/\s+/)[0];
  if (functionMatch) return functionMatch[1] + "()";
  if (cssMatch) return cssMatch[1];

  return `${part.type}-${index + 1}`;
}

function buildBrownIndexBar(){
  const old = codeView.querySelector(".brown-index-wrap");
  if (old) old.remove();

  if (!currentParts.length) return;

  const wrap = document.createElement("div");
  wrap.className = "brown-index-wrap";

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

    if (part.type === "js" && !functionMatches.length && content.length){
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "brown-index-chip";
      chip.textContent = `js-${index + 1}`;

      chip.addEventListener("click", async e => {
        e.stopPropagation();

        try{
          const newText = await navigator.clipboard.readText();
          if (!newText || !newText.trim()) return;

          saveUndoState();
          currentParts[index].content = newText.trim();
          expandedBlocks.add(index);
          renderBlockMode();
        }catch(err){
          alert("Labelless replace failed.");
        }
      });

      labellessMenu.appendChild(chip);
    }
  });

  functionItems.sort((a,b) => a.label.localeCompare(b.label));

  functionItems.forEach(item => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "brown-index-chip";
    chip.textContent = item.label;

    chip.addEventListener("click", async e => {
      e.stopPropagation();

      try{
        const newText = await navigator.clipboard.readText();
        if (!newText || !newText.trim()) return;

        const part = currentParts[item.index];
        if (!part) return;

        const text = part.content;
        const start = text.indexOf(item.startText);
        if (start === -1) return;

        const end = findMatchingFunctionEnd(text, start);
        if (end === null){
          alert("Could not find function ending. Check for missing }");
          return;
        }

        saveUndoState();

        part.content =
          text.slice(0, start) +
          newText.trim() +
          text.slice(end);

        selectedLines = new Set();
        expandedBlocks.add(item.index);
        renderBlockMode();
      }catch(err){
        alert("Function paste update failed.");
      }
    });

    functionMenu.appendChild(chip);
  });

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

function injectCollapsedStyles(){
  if (document.getElementById("collapsed-block-style")) return;

  const style = document.createElement("style");
  style.id = "collapsed-block-style";
  style.textContent = `
.brown-index-wrap{pointer-events:none;}
.brown-index-wrap *{pointer-events:auto;}

.brown-index-wrap{
  position:sticky;
  top:0;
  z-index:120;
  padding:10px;
  background:#150d08;
  border-bottom:1px solid #6b3f22;
}

.function-menu-toggle{
  border:1px solid #7b4a2a;
  border-radius:999px;
  padding:10px 14px;
  background:#3a2416;
  color:#ffd6aa;
  font-size:11px;
  font-weight:900;
  letter-spacing:.08em;
  cursor:pointer;
}

.brown-index-menu{
  display:none;
  flex-direction:column;
  gap:8px;
  max-height:260px;
  overflow-y:auto;
  padding-top:10px;
}

.brown-index-wrap.open-function-menu .function-list{
  display:flex;
}

.brown-index-wrap.open-labelless-menu .labelless-list{
  display:flex;
}

.brown-index-chip{
  flex:none;
  border:1px solid #7b4a2a;
  border-radius:999px;
  padding:8px 12px;
  background:#3a2416;
  color:#ffd6aa;
  font-size:11px;
  font-weight:900;
  letter-spacing:.04em;
  white-space:nowrap;
  cursor:pointer;
}

.brown-index-chip:active{
  transform:scale(.96);
}

.code-block.minimized-block{
  min-height:44px;
  max-height:62px;
  overflow:hidden;
  opacity:.86;
}

.type-tool-empty{
  opacity:.28;
  filter:grayscale(1);
  box-shadow:none !important;
}

.type-tool-empty:active{
  transform:none;
}
  `;

  document.head.appendChild(style);
}
