// 2-start-page.js
// Makes the opening paste screen.
// Builds the start page and handles the first paste.

let pasteBox = null;

if (status){
  status.addEventListener("click", e => {
    e.stopPropagation();
    statusWasPressed = true;
    status.classList.remove("status-faded");
    status.classList.add("status-green");
  });
}

function buildStartUI(){
  stack.innerHTML = "";
  stack.classList.remove("fade-out-start");

  const startMessage = document.createElement("div");
  startMessage.className = "start-message";
  startMessage.innerHTML = `
    Replace and Erase;<br>
    Luhvcraft sculpted intellectual form of silence through the art of preservation.
  `;

  const ghostTitle = document.createElement("div");
  ghostTitle.className = "ghost-title";
  ghostTitle.innerHTML = `
    <div>Replace</div>
    <div>&amp; Erase</div>
  `;

  const centerTitle = document.createElement("div");
  centerTitle.className = "center-title";
  centerTitle.innerHTML = `
    <span class="center-word word-replace">REPLACE</span>
    <span class="center-word word-and">AND</span>
    <span class="center-word word-erase">ERASE</span>
  `;

  const pasteHint = document.createElement("div");
  pasteHint.className = "paste-hint";
  pasteHint.textContent = "Tap here, then paste code";

  pasteBox = document.createElement("textarea");
  pasteBox.id = "startPasteBox";
  pasteBox.className = "start-paste-box";
  pasteBox.placeholder = "Paste code here...";
  pasteBox.value = "";

  stack.appendChild(startMessage);
  stack.appendChild(ghostTitle);
  stack.appendChild(centerTitle);
  stack.appendChild(pasteHint);
  const colorButton = document.createElement("button");
  colorButton.type = "button";
  colorButton.className = "start-color-button";
  colorButton.textContent = "COLOR";
  colorButton.setAttribute("aria-pressed", "false");

  colorButton.addEventListener("click", e => {
    e.stopPropagation();
    colorOnlyMode = !colorOnlyMode;
    document.body.classList.toggle("color-only-mode", colorOnlyMode);
    colorButton.classList.toggle("is-active", colorOnlyMode);
    colorButton.textContent = colorOnlyMode ? "COLOR ON" : "COLOR";
    colorButton.setAttribute("aria-pressed", String(colorOnlyMode));
  });

  stack.appendChild(pasteBox);

  stack.appendChild(colorButton);
}


function beginCodeLoad(text){
  stack.classList.add("fade-out-start");

  beforeCode = String(text);

  setTimeout(() => {
    currentParts = splitCode(text);
    selectedLines = new Set();
    expandedBlocks = new Set(
      currentParts.map((part, index) => index)
    );
    activeType = "all";
    setPanelColor(null);

    if (statusWasPressed && status) status.classList.add("status-faded");


    renderBlockMode(true);
  }, 320);
}
