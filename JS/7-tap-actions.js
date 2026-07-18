// 7-tap-actions.js
// Handles selecting, replacing, erasing, and pasting lines.
// These are the hands that touch the code lines.

function getSelectedLineGroups(){
  const groups = {};

  selectedLines.forEach(key => {
    const [block, line] = key.split(":").map(Number);
    if (!groups[block]) groups[block] = [];
    groups[block].push(line);
  });

  Object.keys(groups).forEach(block => groups[block].sort((a,b) => a-b));
  return groups;
}

function replaceSelectedLinesWithText(newText){
  closeOtherEditors();

  const groups = getSelectedLineGroups();
  const blockIndexes = Object.keys(groups).map(Number).sort((a,b) => a-b);
  if (!blockIndexes.length) return;

  saveUndoState();

  const pasteLines = String(newText).split("\n");
  const firstBlock = blockIndexes[0];
  const selectedKeys = [...selectedLines];

  /*
    Let the old selection visibly leave first.
    The actual edit follows immediately after the blur-out.
  */
  selectedKeys.forEach(key => {
    const [blockIndex, lineNumber] = key.split(":").map(Number);
    const row = codeView.querySelector(
      `.code-line[data-line="${lineNumber}"]`
    );

    if (row && Number(row.closest(".code-section")?.dataset.index) === blockIndex){
      row.classList.add("replace-exit");
    }
  });

  setTimeout(() => {
    blockIndexes.forEach(blockIndex => {
      const part = currentParts[blockIndex];
      if (!part) return;

      const lines = part.content.split("\n");
      const selected = new Set(groups[blockIndex]);
      const minLine = Math.min(...groups[blockIndex]);
      const insertAt = Math.max(0, minLine - 1);
      const kept = lines.filter((line, i) => !selected.has(i + 1));

      if (blockIndex === firstBlock && newText !== ""){
        kept.splice(insertAt, 0, ...pasteLines);
      }

      part.content = kept.join("\n");
    });

    selectedLines = new Set();
    renderBlockMode();
    commitUndoState(newText === "" ? "Erase" : "Replace / Paste");

    if (newText !== ""){
      requestAnimationFrame(() => {
        const section = codeView.querySelector(
          `.code-section[data-index="${firstBlock}"]`
        );

        if (!section) return;

        pasteLines.forEach((line, offset) => {
          const row = section.querySelector(
            `.code-line[data-line="${insertAt + offset + 1}"]`
          );

          if (row){
            row.classList.add("replace-enter");
            setTimeout(() => row.classList.remove("replace-enter"), 430);
          }
        });
      });
    }
  }, 220);
}
function eraseSelectedLines(){
  replaceSelectedLinesWithText("");
}

async function pasteIntoSelectedLines(){
  if (!selectedLines.size) return;

  try{
    const text = await navigator.clipboard.readText();
    replaceSelectedLinesWithText(text);
  }catch(err){
    alert("Paste failed. Copy text first.");
  }
}

document.addEventListener("keydown", e => {
  if (!selectedLines.size) return;
  if (e.target.closest("textarea, input, [contenteditable='true']")) return;

  if (e.key === "Backspace" || e.key === "Delete"){
    e.preventDefault();
    eraseSelectedLines();
  }
});

document.addEventListener("paste", e => {
  if (!selectedLines.size) return;
  if (e.target.closest("textarea, input, [contenteditable='true']")) return;

  const text = e.clipboardData.getData("text/plain");
  if (!text) return;

  e.preventDefault();
  replaceSelectedLinesWithText(text);
});
