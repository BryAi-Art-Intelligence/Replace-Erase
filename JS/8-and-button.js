// 8-and-button.js
// Handles the AND button and inserting between lines.
// This is where new AND behavior should live later.

async function addBetweenSelectedLines(){
  if (selectedLines.size !== 2) return;

  const selected = [...selectedLines].map(key => {
    const [block, line] = key.split(":").map(Number);
    return { block, line };
  });

  if (selected[0].block !== selected[1].block) return;

  selected.sort((a,b) => a.line - b.line);
  if (selected[1].line !== selected[0].line + 1) return;

  const part = currentParts[selected[0].block];
  if (!part) return;

  try{
    const text = await navigator.clipboard.readText();
    if (!text) return;

    saveUndoState();

    const lines = part.content.split("\n");
    lines.splice(selected[0].line, 0, ...String(text).split("\n"));

    part.content = lines.join("\n");
    selectedLines = new Set();
    renderBlockMode();
  }catch(err){
    alert("AND failed. Copy text first.");
  }
}
