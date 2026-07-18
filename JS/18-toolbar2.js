// 18-toolbar2.js
// Second toolbar for brown menu parts: rename, review, undo, redo.

let toolbar2Item = null;
let redoStack = [];

const originalSaveUndoStateForToolbar2 = saveUndoState;
saveUndoState = function(){
  redoStack = [];
  originalSaveUndoStateForToolbar2();
};

const originalUndoLastChangeForToolbar2 = undoLastChange;
undoLastChange = function(){
  if (!undoStack.length) return;

  redoStack.push({
    parts: JSON.parse(JSON.stringify(currentParts)),
    selected: [...selectedLines],
    expanded: [...expandedBlocks],
    active: activeType
  });

  originalUndoLastChangeForToolbar2();
};

function redoLastChange(){
  closeOtherEditors();
  const next = redoStack.pop();
  if (!next) return;

  undoStack.push({
    parts: JSON.parse(JSON.stringify(currentParts)),
    selected: [...selectedLines],
    expanded: [...expandedBlocks],
    active: activeType
  });

  currentParts = next.parts;
  selectedLines = new Set(next.selected);
  expandedBlocks = new Set(next.expanded);
  activeType = next.active;
  setPanelColor(activeType);
  renderBlockMode();
}

function getSelectedFunctionRows(){
  return [...document.querySelectorAll(".code-line.selected-line")];
}

function applyFunctionColor(color){
  getSelectedFunctionRows().forEach(row => {
    row.style.color = color;
    row.dataset.functionColor = color;
  });
}

function applyFunctionSize(size){
  getSelectedFunctionRows().forEach(row => {
    row.style.fontSize = size + "px";
    row.dataset.functionSize = size;
  });
}

function ensureToolbar2(){
  let bar = document.getElementById("toolbar2");
  if (bar) return bar;

  bar = document.createElement("div");
  bar.className = "toolbar2";
  bar.id = "toolbar2";
  bar.setAttribute("aria-label", "Brown part toolbar");
  bar.innerHTML = `
    <button type="button" class="toolbar2-rename">RENAME</button>
    <button type="button" class="toolbar2-review">REVIEW</button>
    <button type="button" class="toolbar2-color">COLOR</button>
    <button type="button" class="toolbar2-size">SIZE</button>
    <button type="button" class="toolbar2-undo">UNDO</button>
    <button type="button" class="toolbar2-redo">REDO</button>
    <div class="toolbar2-color-menu" aria-label="Function colors">
      <button type="button" data-function-color="#2f2f2f">DARK</button>
      <button type="button" data-function-color="#6f56a8">PURPLE</button>
      <button type="button" data-function-color="#00796b">TEAL</button>
      <button type="button" data-function-color="#9b6200">GOLD</button>
    </div>
    <div class="toolbar2-size-menu" aria-label="Function sizes">
      <button type="button" data-function-size="10">SMALL</button>
      <button type="button" data-function-size="12">NORMAL</button>
      <button type="button" data-function-size="15">LARGE</button>
    </div>
  `;

  bar.querySelector(".toolbar2-rename").addEventListener("click", e => {
    e.stopPropagation();
    renameToolbar2Item();
  });

  bar.querySelector(".toolbar2-review").addEventListener("click", e => {
    e.stopPropagation();
    reviewToolbar2Item();
  });

  bar.querySelector(".toolbar2-color").addEventListener("click", e => {
    e.stopPropagation();
    bar.classList.toggle("show-color-menu");
    bar.classList.remove("show-size-menu");
  });

  bar.querySelector(".toolbar2-size").addEventListener("click", e => {
    e.stopPropagation();
    bar.classList.toggle("show-size-menu");
    bar.classList.remove("show-color-menu");
  });

  bar.querySelectorAll("[data-function-color]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      applyFunctionColor(button.dataset.functionColor);
      bar.classList.remove("show-color-menu");
    });
  });

  bar.querySelectorAll("[data-function-size]").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      applyFunctionSize(button.dataset.functionSize);
      bar.classList.remove("show-size-menu");
    });
  });

  bar.querySelector(".toolbar2-undo").addEventListener("click", e => {
    e.stopPropagation();
    undoLastChange();
  });

  bar.querySelector(".toolbar2-redo").addEventListener("click", e => {
    e.stopPropagation();
    redoLastChange();
  });

  document.body.appendChild(bar);
  return bar;
}

function findBrownChipForItem(item){
  if (!item) return null;

  return [...document.querySelectorAll(".brown-index-chip")]
    .find(chip => chip.textContent.trim() === String(item.label || "").trim()) || null;
}

function showToolbar2(item){
  toolbar2Item = item;
  currentBrownToolbarItem = item;

  const bar = ensureToolbar2();
  bar.classList.add("show-toolbar2");
}

function hideToolbar2(){
  const bar = document.getElementById("toolbar2");
  if (bar) bar.classList.remove("show-toolbar2");
}

function renameToolbar2Item(){
  const item = toolbar2Item || currentBrownToolbarItem;
  if (!item) return;

  const chip = findBrownChipForItem(item);
  if (!chip) return;

  rememberBrownMenuScroll();
  startBrownChipRename(chip, item);
}

function reviewToolbar2Item(){
  const item = toolbar2Item || currentBrownToolbarItem;
  if (!item) return;

  openBrownItemCode(item);
  showToolbar2(item);
}
