// 9-text-editing.js
// Turns code blocks into editable writing boxes.
// Handles text editing, auto height, saving, and closing open editors.

function clearTextSelection(){
  const selection = window.getSelection();
  if (selection) selection.removeAllRanges();
}

function clampNumber(num, min, max){
  return Math.max(min, Math.min(max, num));
}

function autoSizeEditor(editor){
  editor.style.height = "auto";
  editor.style.height = editor.scrollHeight + "px";
}

function saveTextareaBlock(block){
  if (!block.classList.contains("editing-block")) return;

  const editor = block.querySelector(".block-editor");
  if (!editor) return;

  const index = Number(block.dataset.index);
  const newText = editor.value;
  const before = block.__undoBefore;
  const oldText = before && before.parts[index]
    ? before.parts[index].content
    : newText;

  if (currentParts[index]) currentParts[index].content = newText;

  block.classList.remove("editing-block", "selected-block");
  block.innerHTML = renderCodeBlockHTML(newText, index, false);
  clearTextSelection();
  enableLineNumberToggle();
  enableFunctionLineTap();

  if (oldText !== newText && window.ReplaceEraseHistory){
    const after = captureUndoState();

    window.ReplaceEraseHistory.record({
      label: "Text Edit",

      undo: function(){
        restoreUndoState(before);
      },

      redo: function(){
        restoreUndoState(after);
      }
    });
  }

  delete block.__undoBefore;
}

function convertBlockToTextarea(block, start = 0, end = 0){
  if (block.classList.contains("editing-block")) return;

  const scrollY = codeView.scrollTop;
  const index = Number(block.dataset.index);

  expandedBlocks.add(index);

  const text = currentParts[index] ? currentParts[index].content : block.textContent;
  block.__undoBefore = captureUndoState();

  start = clampNumber(start, 0, text.length);
  end = clampNumber(end, 0, text.length);

  block.classList.add("editing-block", "selected-block");
  block.innerHTML = "";

  const editor = document.createElement("textarea");
  editor.className = "block-editor";
  editor.value = text;
  editor.spellcheck = false;
  editor.autocapitalize = "off";
  editor.autocomplete = "off";
  editor.autocorrect = "off";
  editor.inputMode = "text";

  block.appendChild(editor);

  editor.addEventListener("input", () => {
    autoSizeEditor(editor);
    if (currentParts[index]) currentParts[index].content = editor.value;
  });

  editor.addEventListener("blur", () => {
    saveTextareaBlock(block);
  });

  requestAnimationFrame(() => {
    editor.focus({ preventScroll:true });
    autoSizeEditor(editor);
    editor.setSelectionRange(start, end);
    codeView.scrollTop = scrollY;
  });
}

function closeOtherEditors(exceptBlock = null){
  if (!codeView) return;
  codeView.querySelectorAll(".code-block.editing-block").forEach(block => {
    if (block !== exceptBlock) saveTextareaBlock(block);
  });
}
