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
    <button type="button" class="toolbar2-undo">UNDO</button>
    <button type="button" class="toolbar2-redo">REDO</button>
  `;

  bar.querySelector(".toolbar2-rename").addEventListener("click", e => {
    e.stopPropagation();
    renameToolbar2Item();
  });

  bar.querySelector(".toolbar2-review").addEventListener("click", e => {
    e.stopPropagation();
    reviewToolbar2Item();
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
