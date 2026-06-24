// 13-functions-menu.js
// Builds the brown menu for fast function/block access.
// Brown chips select code chunks. The REPLACE / AND / ERASE toolbar performs the action.
// Hold a brown name to rename it in the code before final build.

function getCssSelectorName(line){
  const s = String(line || "").trim();

  if (!s.endsWith("{")) return null;
  if (s.startsWith("@")) return null;

  const name = s.replace(/\s*\{$/, "").trim();
  if (!name) return null;

  return name;
}

function getFirstCssSelector(content){
  const lines = String(content || "").split("\n");

  for (const line of lines){
    const selector = getCssSelectorName(line);
    if (selector) return selector;
  }

  return null;
}

function getBrownIndexLabel(part, index){
  const content = String(part.content || "").trim();

  const classMatch = content.match(/class=["']([^"']+)["']/i);
  const idMatch = content.match(/id=["']([^"']+)["']/i);
  const functionMatch = content.match(/function\s+([A-Za-z0-9_$]+)/);
  const cssMatch = getFirstCssSelector(content);

  if (idMatch) return "#" + idMatch[1];
  if (classMatch) return "." + classMatch[1].split(/\s+/)[0];
  if (functionMatch) return functionMatch[1] + "()";
  if (cssMatch) return cssMatch;

  return `${part.type}-${index + 1}`;
}

function getLineRangeFromIndexes(text, start, end){
  const beforeStart = String(text).slice(0, start);
  const beforeEnd = String(text).slice(0, end);

  return {
    startLine: beforeStart.split("\n").length,
    endLine: beforeEnd.split("\n").length
  };
}

function getBrownItemLineKeys(item){
  const part = currentParts[item.index];
  if (!part || typeof part.content !== "string") return [];

  const text = part.content;

  if (item.wholeBlock){
    return text.split("\n").map((_, i) => `${item.index}:${i + 1}`);
  }

  const start = text.indexOf(item.startText);
  if (start === -1) return [];

  const end = findMatchingFunctionEnd(text, start);
  if (end === null) return [];

  const range = getLineRangeFromIndexes(text, start, end);
  const keys = [];

  for (let line = range.startLine; line <= range.endLine; line++){
    keys.push(`${item.index}:${line}`);
  }

  return keys;
}

function brownItemIsSelected(item){
  const keys = getBrownItemLineKeys(item);
  return keys.length > 0 && keys.every(key => selectedLines.has(key));
}

function toggleBrownItemSelection(item){
  const keys = getBrownItemLineKeys(item);
  if (!keys.length) return;

  const shouldRemove = keys.every(key => selectedLines.has(key));

  keys.forEach(key => {
    if (shouldRemove) selectedLines.delete(key);
    else selectedLines.add(key);
  });

  expandedBlocks.add(item.index);
  renderBlockMode();
}

function escapeBrownRenameRegex(text){
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getBrownRenameInfo(item){
  const label = String(item.label || "").trim();

  if (label.startsWith(".")){
    const match = label.match(/^\.([A-Za-z0-9_-]+)/);
    if (!match) return null;

    return {
      type: "class",
      prefix: ".",
      oldName: match[1]
    };
  }

  if (label.startsWith("#")){
    const match = label.match(/^#([A-Za-z0-9_-]+)/);
    if (!match) return null;

    return {
      type: "id",
      prefix: "#",
      oldName: match[1]
    };
  }

  return null;
}

function replaceClassNameInCode(text, oldName, newName){
  const oldEsc = escapeBrownRenameRegex(oldName);

  let out = String(text);

  out = out.replace(
    new RegExp(`\\.(${oldEsc})(?=[\\s\\.#:\\[,>+~\\{\\)]|$)`, "g"),
    "." + newName
  );

  out = out.replace(
    /(class\s*=\s*["'])([^"']*)(["'])/gi,
    (match, open, names, close) => {
      const replaced = String(names)
        .split(/\s+/)
        .map(name => name === oldName ? newName : name)
        .join(" ");

      return open + replaced + close;
    }
  );

  out = out.replace(
    new RegExp(`(classList\\.(?:add|remove|toggle|contains)\\s*\\(\\s*["'\`])${oldEsc}(["'\`]\\s*\\))`, "g"),
    "$1" + newName + "$2"
  );

  return out;
}

function replaceIdNameInCode(text, oldName, newName){
  const oldEsc = escapeBrownRenameRegex(oldName);

  let out = String(text);

  out = out.replace(
    new RegExp(`#${oldEsc}(?=[\\s\\.#:\\[,>+~\\{\\)]|$)`, "g"),
    "#" + newName
  );

  out = out.replace(
    new RegExp(`(id\\s*=\\s*["'])${oldEsc}(["'])`, "gi"),
    "$1" + newName + "$2"
  );

  out = out.replace(
    new RegExp(`(getElementById\\s*\\(\\s*["'\`])${oldEsc}(["'\`]\\s*\\))`, "g"),
    "$1" + newName + "$2"
  );

  return out;
}

function renameBrownItemInCode(item, typedValue){
  const info = getBrownRenameInfo(item);
  if (!info) return;

  const newName = String(typedValue || "")
    .replace(info.prefix, "")
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "");

  if (!newName || newName === info.oldName) return;

  saveUndoState();

  currentParts = currentParts.map(part => {
    if (!part || typeof part.content !== "string") return part;

    const next = { ...part };

    if (info.type === "class"){
      next.content = replaceClassNameInCode(next.content, info.oldName, newName);
    }

    if (info.type === "id"){
      next.content = replaceIdNameInCode(next.content, info.oldName, newName);
    }

    return next;
  });

  selectedLines = new Set();
  expandedBlocks.add(item.index);
  renderBlockMode();
}

function startBrownChipRename(chip, item){
  const info = getBrownRenameInfo(item);
  if (!info) return;

  chip.classList.add("brown-chip-renaming");
  chip.textContent = "";

  const input = document.createElement("input");
  input.className = "brown-rename-input";
  input.value = info.prefix;
  input.autocapitalize = "none";
  input.autocomplete = "off";
  input.spellcheck = false;

  let finished = false;

  function finishRename(save){
    if (finished) return;
    finished = true;

    const value = input.value;

    if (save) renameBrownItemInCode(item, value);
    else renderBlockMode();
  }

  input.addEventListener("pointerdown", e => e.stopPropagation());
  input.addEventListener("click", e => e.stopPropagation());

  input.addEventListener("keydown", e => {
    if (e.key === "Enter"){
      e.preventDefault();
      finishRename(true);
    }

    if (e.key === "Escape"){
      e.preventDefault();
      finishRename(false);
    }

    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      input.selectionStart <= info.prefix.length &&
      input.selectionEnd <= info.prefix.length
    ){
      e.preventDefault();
    }
  });

  input.addEventListener("input", () => {
    if (!input.value.startsWith(info.prefix)){
      input.value = info.prefix + input.value.replace(info.prefix, "");
    }
  });

  input.addEventListener("blur", () => finishRename(true));

  chip.appendChild(input);

  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(info.prefix.length, info.prefix.length);
  });
}

function createBrownChip(item){
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "brown-index-chip";
  chip.classList.toggle("brown-chip-selected", brownItemIsSelected(item));
  chip.textContent = item.label;

  let holdTimer = null;
  let didLongPress = false;

  chip.addEventListener("pointerdown", e => {
    e.stopPropagation();

    didLongPress = false;
    clearTimeout(holdTimer);

    holdTimer = setTimeout(() => {
      didLongPress = true;
      startBrownChipRename(chip, item);
    }, 560);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(type => {
    chip.addEventListener(type, () => {
      clearTimeout(holdTimer);
    });
  });

  chip.addEventListener("click", e => {
    e.stopPropagation();

    if (didLongPress){
      didLongPress = false;
      return;
    }

    toggleBrownItemSelection(item);
  });

  return chip;
}

function buildBrownIndexBar(){
  const old = codeView.querySelector(".brown-index-wrap");
  if (old) old.remove();

  if (!currentParts.length) return;

  const wrap = document.createElement("div");
  wrap.className = "brown-index-wrap open-function-menu";

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

  functionItems.sort((a,b) => a.label.localeCompare(b.label));
  labellessItems.sort((a,b) => a.label.localeCompare(b.label));

  functionItems.forEach(item => {
    functionMenu.appendChild(createBrownChip(item));
  });

  labellessItems.forEach(item => {
    labellessMenu.appendChild(createBrownChip(item));
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
  position:fixed;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  z-index:160;
  width:min(86vw, 430px);
  max-height:46vh;
  padding:12px;
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:8px;
  background:rgba(38,25,16,.76);
  border:1px solid rgba(123,74,42,.56);
  border-radius:28px;
  box-shadow:0 22px 70px rgba(0,0,0,.22);
  backdrop-filter:blur(18px);
}

.function-menu-toggle{
  border:1px solid rgba(123,74,42,.82);
  border-radius:999px;
  padding:10px 14px;
  background:rgba(58,36,22,.86);
  color:#ffd6aa;
  font-size:11px;
  font-weight:900;
  letter-spacing:.08em;
  cursor:pointer;
}

.brown-index-menu{
  display:none;
  width:100%;
  flex-wrap:wrap;
  justify-content:center;
  gap:8px;
  max-height:31vh;
  overflow-y:auto;
  padding-top:4px;
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

.brown-index-chip.brown-chip-selected{
  background:#100905;
  color:#fff2dc;
  border-color:#f0c28e;
  box-shadow:0 0 0 2px rgba(240,194,142,.22);
}

.brown-index-chip.brown-chip-renaming{
  padding:6px 10px;
}

.brown-rename-input{
  width:92px;
  max-width:34vw;
  border:0;
  outline:0;
  background:transparent;
  color:#fff2dc;
  font:inherit;
  font-weight:900;
  letter-spacing:.04em;
  text-align:left;
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
