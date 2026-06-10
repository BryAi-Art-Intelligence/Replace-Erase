// 10-toolbar.js
// Shows the REPLACE / AND / ERASE tools and the type toolbar.
// Handles bottom buttons, copy button, type buttons, and toolbar swipes.

const typePanelColors = {
  head: ["rgba(120,90,170,.20)", "rgba(120,90,170,.09)", "rgba(120,90,170,.16)"],
  html: ["rgba(180,135,20,.20)", "rgba(180,135,20,.09)", "rgba(180,135,20,.16)"],
  css: ["rgba(0,150,135,.20)", "rgba(0,150,135,.09)", "rgba(0,150,135,.16)"],
  js: ["rgba(190,120,0,.20)", "rgba(190,120,0,.09)", "rgba(190,120,0,.16)"],
  svg: ["rgba(90,60,150,.20)", "rgba(90,60,150,.09)", "rgba(90,60,150,.16)"],
  hidden: ["rgba(0,0,0,.09)", "rgba(0,0,0,.035)", "rgba(0,0,0,.10)"]
};

function setPanelColor(type){
  const c = typePanelColors[type] || ["rgba(142,103,58,.20)", "rgba(92,65,35,.10)", "rgba(105,73,38,.13)"];
  document.documentElement.style.setProperty("--type-bg-1", c[0]);
  document.documentElement.style.setProperty("--type-bg-2", c[1]);
  document.documentElement.style.setProperty("--type-border", c[2]);
}

function buildSelectedLineTools(){
  const old = document.querySelector(".selected-line-tools");
  if (old) old.remove();

  const tools = document.createElement("div");
  tools.className = "selected-line-tools";
  tools.innerHTML = `
    <button type="button" class="selected-replace-btn">REPLACE</button>
    <button type="button" class="selected-and-btn">AND</button>
    <button type="button" class="selected-erase-btn">ERASE</button>
  `;

  tools.querySelector(".selected-replace-btn").addEventListener("click", e => {
    e.stopPropagation();
    pasteIntoSelectedLines();
  });

  tools.querySelector(".selected-and-btn").addEventListener("click", e => {
    e.stopPropagation();
    addBetweenSelectedLines();
  });

  tools.querySelector(".selected-erase-btn").addEventListener("click", e => {
    e.stopPropagation();
    eraseSelectedLines();
  });

  document.body.appendChild(tools);
  updateSelectedLineTools();
}

function updateSelectedLineTools(){
  const tools = document.querySelector(".selected-line-tools");
  if (!tools) return;

  tools.classList.toggle("show-selected-tools", selectedLines.size > 0);

  const andBtn = tools.querySelector(".selected-and-btn");
  if (!andBtn) return;

  const selected = [...selectedLines].map(key => {
    const [block, line] = key.split(":").map(Number);
    return { block, line };
  });

  const canAnd =
    selected.length === 2 &&
    selected[0].block === selected[1].block &&
    Math.abs(selected[0].line - selected[1].line) === 1;

  andBtn.disabled = !canAnd;
  andBtn.classList.toggle("and-ready", canAnd);
}

function buildTypeToolbar(){
  const bar = document.createElement("div");
  bar.className = "type-toolbar";

  ["head", "html", "css", "js", "svg", "hidden"].forEach(type => {
    const button = document.createElement("button");
    button.className = `type-tool type-tool-${type}`;
    button.dataset.type = type;
    button.textContent = type === "hidden" ? "SRC" : type.toUpperCase();

    const count = currentParts.filter(part => part && part.type === type).length;

    if (!count){
      button.classList.add("type-tool-empty");
      button.disabled = true;
    }

    button.addEventListener("click", e => {
      e.stopPropagation();

      const indexes = currentParts
        .map((part, index) => part && part.type === type ? index : null)
        .filter(index => index !== null);

      if (!indexes.length) return;

      const allOpen = indexes.every(index => expandedBlocks.has(index));

      if (allOpen){
        indexes.forEach(index => expandedBlocks.delete(index));
        activeType = null;
        setPanelColor(null);
      } else {
        expandedBlocks.clear();
        indexes.forEach(index => expandedBlocks.add(index));
        activeType = type;
        setPanelColor(type);
      }

      renderBlockMode();
    });

    bar.appendChild(button);
  });

  codeView.appendChild(bar);
}

function buildCopyFinalButton(){
  const button = document.createElement("button");
  button.className = "copy-final-btn";
  button.textContent = "COPY ALL";

  button.addEventListener("pointerdown", e => e.stopPropagation());
  button.addEventListener("click", e => {
    e.stopPropagation();
    copyFinalBuild();
  });

  return button;
}

function enterUnifiedMode(){
  closeOtherEditors();

  activeType = null;
  setPanelColor(null);
  document.body.classList.add("unified-mode");
  clearTextSelection();

  const clean = getUnifiedCleanText();

  codeView.innerHTML = `<pre>${escapeHTML(clean)}</pre>`;
  codeView.appendChild(buildCopyFinalButton());
  buildTypeToolbar();
  enableToolbarSwipe();
}

function enableToolbarSwipe(){
  const bar = document.querySelector(".type-toolbar");
  if (!bar) return;

  let startX = 0;
  let dx = 0;
  let dragging = false;

  bar.addEventListener("pointerdown", e => {
    closeOtherEditors();
    startX = e.clientX;
    dx = 0;
    dragging = true;
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener("pointermove", e => {
    if (!dragging) return;
    dx = e.clientX - startX;
  });

  bar.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;

    if (dx > 70) enterUnifiedMode();
    if (dx < -70) undoLastChange();
  });

  bar.addEventListener("pointercancel", () => {
    dragging = false;
  });
}
