// 14-show-parts.js
// Draws the code pieces, line numbers, toolbar, and views.
// This is what makes the separated code visible and touchable.

function getBlockType(block){
  if (block.classList.contains("type-head")) return "head";
  if (block.classList.contains("type-hidden")) return "hidden";
  if (block.classList.contains("type-html")) return "html";
  if (block.classList.contains("type-css")) return "css";
  if (block.classList.contains("type-js")) return "js";
  if (block.classList.contains("type-svg")) return "svg";
  return null;
}

function enableLineNumberToggle(){
  const buttons = [...codeView.querySelectorAll(".line-number-box")];

  let active = false;
  let mode = "add";
  let pointerId = null;
  let touched = new Set();

  function applyButton(button){
    if (!button) return;

    const block = button.dataset.block;
    const line = button.dataset.line;
    const key = `${block}:${line}`;

    if (touched.has(key)) return;
    touched.add(key);

    if (mode === "remove") selectedLines.delete(key);
    else selectedLines.add(key);

    const row = button.closest(".code-line");
    if (row) row.classList.toggle("selected-line", selectedLines.has(key));

    updateSelectedLineTools();
  }

  function buttonFromPoint(x,y){
    const el = document.elementFromPoint(x,y);
    if (!el) return null;
    return el.closest(".line-number-box");
  }

  buttons.forEach(button => {
    button.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();

      const key = `${button.dataset.block}:${button.dataset.line}`;

      active = true;
      pointerId = e.pointerId;
      touched = new Set();
      mode = selectedLines.has(key) ? "remove" : "add";

      button.setPointerCapture(e.pointerId);
      applyButton(button);
    });

    button.addEventListener("pointermove", e => {
      if (!active || e.pointerId !== pointerId) return;
      e.preventDefault();
      e.stopPropagation();
      applyButton(buttonFromPoint(e.clientX, e.clientY));
    });

    button.addEventListener("pointerup", e => {
      if (e.pointerId !== pointerId) return;
      active = false;
      pointerId = null;
      touched = new Set();
      try{ button.releasePointerCapture(e.pointerId); }catch(err){}
    });

    button.addEventListener("pointercancel", e => {
      active = false;
      pointerId = null;
      touched = new Set();
      try{ button.releasePointerCapture(e.pointerId); }catch(err){}
    });

    button.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
}

function enableSectionTapSelect(){
  const sections = [...codeView.querySelectorAll(".code-section")];

  sections.forEach(section => {
    section.addEventListener("click", e => {
      if (document.body.classList.contains("unified-mode")) return;
      if (e.target.closest(".block-editor")) return;
      if (e.target.closest(".function-line")) return;
      if (e.target.closest(".line-number-box")) return;
      if (e.target.closest(".selected-line-tools")) return;

      const index = Number(section.dataset.index);
      const block = section.querySelector(".code-block");
      if (!block) return;

      if (e.target.closest(".section-label")) return;

      if (!expandedBlocks.has(index)){
        expandedBlocks.add(index);
        renderBlockMode();
        return;
      }

      if (block.classList.contains("editing-block")) return;
      if (activeType && getBlockType(block) !== activeType) return;

      closeOtherEditors(block);

      codeView.querySelectorAll(".code-block.selected-block").forEach(other => {
        if (other !== block && !other.classList.contains("editing-block")){
          other.classList.remove("selected-block");
        }
      });

      block.classList.add("selected-block");
      block.classList.remove("dragging-block");
      block.style.transform = "";
      block.style.opacity = "";

      clearTextSelection();
    });
  });
}

function enableBlockSelectionAndErase(){
  const blocks = [...codeView.querySelectorAll(".code-block")];

  blocks.forEach(block => {
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let dragging = false;
    let moved = false;

    function blockIsActiveForEditing(){
      if (document.body.classList.contains("unified-mode")) return false;
      if (!activeType) return true;
      return getBlockType(block) === activeType;
    }

    block.addEventListener("pointerdown", e => {
      if (e.target.closest(".line-number-box")) return;
      if (!blockIsActiveForEditing()) return;
      if (block.classList.contains("editing-block")) return;

      const index = Number(block.dataset.index);
      if (!expandedBlocks.has(index)) return;

      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
      dy = 0;
      moved = false;
      dragging = true;

      block.setPointerCapture(e.pointerId);
      clearTextSelection();
    });

    block.addEventListener("pointermove", e => {
      if (!dragging) return;
      if (!blockIsActiveForEditing()) return;
      if (block.classList.contains("editing-block")) return;

      dx = e.clientX - startX;
      dy = e.clientY - startY;

      const distance = Math.hypot(dx, dy);
      if (distance > 2) moved = true;

      if (distance > 18){
        block.classList.add("dragging-block");
        block.style.transform = `translate(${dx}px, ${dy}px)`;
        block.style.opacity = "0.82";
      }
    });

    block.addEventListener("pointerup", e => {
      if (!dragging) return;
      dragging = false;

      if (!blockIsActiveForEditing()) return;
      if (block.classList.contains("editing-block")) return;

      if (!moved){
        closeOtherEditors(block);

        codeView.querySelectorAll(".code-block.selected-block").forEach(other => {
          if (other !== block && !other.classList.contains("editing-block")){
            other.classList.remove("selected-block");
          }
        });

        block.classList.add("selected-block");

        try{ block.releasePointerCapture(e.pointerId); }catch(err){}
        return;
      }

      const distance = Math.hypot(dx, dy);
      const eraseThreshold = 120;

      if (distance > eraseThreshold){
        saveUndoState();

        const index = Number(block.dataset.index);
        block.classList.add("erasing-block");

        setTimeout(() => {
          currentParts[index] = null;
          currentParts = currentParts.filter(Boolean);

          expandedBlocks = new Set(
            [...expandedBlocks]
              .filter(i => i !== index)
              .map(i => i > index ? i - 1 : i)
          );

          cleanSelectedLines();
          renderBlockMode();
        }, 180);

        return;
      }

      block.classList.remove("dragging-block");
      block.style.transform = "";
      block.style.opacity = "";

      try{ block.releasePointerCapture(e.pointerId); }catch(err){}
    });

    block.addEventListener("pointercancel", e => {
      dragging = false;
      block.classList.remove("dragging-block");
      block.style.transform = "";
      block.style.opacity = "";
      try{ block.releasePointerCapture(e.pointerId); }catch(err){}
    });
  });
}

function cleanSelectedLines(){
  const validKeys = new Set();

  currentParts.forEach((part, blockIndex) => {
    if (!part || typeof part.content !== "string") return;

    const lineCount = part.content.split("\n").length;

    for (let i = 1; i <= lineCount; i++){
      validKeys.add(`${blockIndex}:${i}`);
    }
  });

  selectedLines = new Set([...selectedLines].filter(key => validKeys.has(key)));
}

function renderBlockMode(animated = false){
  closeOtherEditors();

  document.body.classList.remove("unified-mode");

  scene.classList.add("hidden");
  codeView.classList.remove("hidden");
  codeView.classList.toggle("fade-in-blocks", animated);

  cleanSelectedLines();

  const scrollY = codeView.scrollTop;
  const activeElement = document.activeElement;

  let html = "";

  currentParts.forEach((part, index) => {
    if (!part) return;
    if (
      activeType !== "all" &&
      (!activeType || part.type !== activeType)
    ) return;

    const isExpanded = expandedBlocks.has(index);
    const blockMinClass = isExpanded ? "" : " minimized-block";

    html += `
      <section class="code-section"
        data-type="${part.type}"
        data-section-id="${part.type}-${index}"
        data-index="${index}">
        <div class="section-body">
          <div class="code-block type-${part.type}${blockMinClass}" data-index="${index}">
            ${renderCodeBlockHTML(part.content, index, !isExpanded)}
          </div>
        </div>
      </section>
    `;

    html += `<div class="insert-gap" data-insert-index="${index + 1}"></div>`;
  });

  codeView.innerHTML = html;
  buildBrownIndexBar();

  requestAnimationFrame(() => {
    codeView.scrollTop = scrollY;
    if (activeElement && activeElement.blur) activeElement.blur();
  });

  buildTypeToolbar();
  buildSelectedLineTools();
  enableToolbarSwipe();
  enableInsertGapSwipe();
  enableBlockSelectionAndErase();
  enableSectionTapSelect();
  enableFunctionLineTap();
  enableLineNumberToggle();
}

function renderSeparatedBlocks(text){
  currentParts = splitCode(text);
  activeType = "all";
  selectedLines = new Set();
  expandedBlocks = new Set(
    currentParts.map((part, index) => index)
  );
  setPanelColor(null);
  renderBlockMode();
}

function renderCodeBlockHTML(text, blockIndex, collapsed = false){
  const lines = String(text).split("\n");

  if (collapsed){
    const preview = lines.find(line => line.trim()) || "(empty block)";

    return `
      <div class="collapsed-preview">
        <span>${lines.length} lines</span>
        <pre>${renderCodeHTML(preview.slice(0, 140))}</pre>
      </div>
    `;
  }

  const rows = lines.map((line, i) => {
    const lineNumber = i + 1;
    const key = `${blockIndex}:${lineNumber}`;
    const selected = selectedLines.has(key) ? " selected-line" : "";

    return `
      <div class="code-line${selected}" data-line="${lineNumber}">
        <button class="line-number-box" data-block="${blockIndex}" data-line="${lineNumber}" type="button">
          ${lineNumber}
        </button>
        <pre>${renderCodeHTML(line)}</pre>
      </div>
    `;
  }).join("");

  return `<div class="code-lines">${rows}</div>`;
}

function renderCodeHTML(text){
  let html = escapeHTML(text);

  html = html.replace(
    /(^|\n)(function\s+[A-Za-z0-9_$]+\s*\([^)]*\)\s*\{)/g,
    '$1<span class="function-line" data-select-type="brace">$2</span>'
  );

  html = html.replace(
    /(^|\n)(\s*(?!(?:from|to|\d+%|@media|@supports|@font-face)\b)(?:[.#]?[A-Za-z][A-Za-z0-9_-]*(?:\s*,\s*[.#]?[A-Za-z][A-Za-z0-9_-]*)*|\[[^\n{}]+\]|@keyframes\s+[^\n{}]+|[.#][^\n{}]+)\s*\{\s*)/g,
    '$1<span class="function-line" data-select-type="brace">$2</span>'
  );

  return html;
}

function escapeHTML(text){
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
