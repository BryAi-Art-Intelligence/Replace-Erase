// 5-undo-logic.js
// Saves rewind points and bridges the editor to the standalone undo/redo buttons.

let pendingUndoState = null;

function captureUndoState(){
  return {
    parts: JSON.parse(JSON.stringify(currentParts)),
    selected: [...selectedLines],
    expanded: [...expandedBlocks],
    active: activeType
  };
}

function restoreUndoState(state){
  if (!state) return;

  currentParts = JSON.parse(JSON.stringify(state.parts));
  selectedLines = new Set(state.selected);
  expandedBlocks = new Set(state.expanded);
  activeType = state.active;

  setPanelColor(activeType);
  renderBlockMode();
}

function saveUndoState(){
  const snapshot = captureUndoState();

  undoStack.push(snapshot);
  if (undoStack.length > 25) undoStack.shift();

  pendingUndoState = snapshot;
}

function commitUndoState(label){
  if (!pendingUndoState || !window.ReplaceEraseHistory){
    pendingUndoState = null;
    return;
  }

  const before = pendingUndoState;
  const after = captureUndoState();

  window.ReplaceEraseHistory.record({
    label: label || "Edit",

    undo: function(){
      restoreUndoState(before);
    },

    redo: function(){
      restoreUndoState(after);
    }
  });

  pendingUndoState = null;
}

function undoLastChange(){
  closeOtherEditors();

  const last = undoStack.pop();
  if (!last) return;

  restoreUndoState(last);
}
