// 5-undo-logic.js
// Saves rewind points and brings the app back if needed.
// This is the safety net before Replace & Erase changes anything.

function saveUndoState(){
  undoStack.push({
    parts: JSON.parse(JSON.stringify(currentParts)),
    selected: [...selectedLines],
    expanded: [...expandedBlocks],
    active: activeType
  });
  if (undoStack.length > 25) undoStack.shift();
}

function undoLastChange(){
  closeOtherEditors();
  const last = undoStack.pop();
  if (!last) return;
  currentParts = last.parts;
  selectedLines = new Set(last.selected);
  expandedBlocks = new Set(last.expanded);
  activeType = last.active;
  setPanelColor(activeType);
  renderBlockMode();
}
