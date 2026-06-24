// 17-brown-rename-focus.js
// Makes double-tap rename immediately place the cursor and open the keyboard without iOS zoom.

function focusBrownRenameInput(input, prefixLength){
  const placeCursor = () => {
    input.focus({ preventScroll:true });
    input.setSelectionRange(prefixLength, prefixLength);
  };

  placeCursor();
  requestAnimationFrame(placeCursor);
  setTimeout(placeCursor, 60);
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
  input.autocorrect = "off";
  input.inputMode = "text";
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
  input.addEventListener("touchstart", e => e.stopPropagation(), { passive:true });

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
  focusBrownRenameInput(input, info.prefix.length);
}
