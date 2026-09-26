// 2-start-page.js

// Makes the opening paste screen.

// Builds the start page and handles the first paste.

let pasteBox = null;
let pictureOpening = false;

function buildStartUI(){

  stack.innerHTML = "";

  stack.classList.remove("fade-out-start");

  const startMessage = document.createElement("div");

  startMessage.className = "start-message";

  startMessage.innerHTML = "";

  

const ghostTitle = document.createElement("div");

ghostTitle.className = "ghost-title";

ghostTitle.innerHTML = `

  <div>Replace</div>

  <div class="ghost-bottom">

    <span class="ghost-amp">and</span>

    <span class="ghost-erase">Erase</span>

  </div>

`;

/* Tap the & to show or hide artwork */

const amp = ghostTitle.querySelector(".ghost-amp");

amp.addEventListener("click", (e) => {

  e.stopPropagation();

  amp.textContent =

    amp.textContent.trim() === "&" ? "and" : "&";

});

  const centerTitle = document.createElement("div");

  centerTitle.className = "center-title";

  centerTitle.innerHTML = `

    <span class="center-word word-replace">REPLACE</span>

    <span class="center-word word-and">and</span>

    <span class="center-word word-erase">ERASE</span>

  `;

  const pasteHint = document.createElement("div");

  pasteHint.className = "paste-hint";

pasteHint.textContent = "Tap here, then paste code or picture";


  pasteBox = document.createElement("div");

pasteBox.id = "startPasteBox";
pasteBox.className = "start-paste-box";
pasteBox.contentEditable = "true";
pasteBox.setAttribute("role", "textbox");
pasteBox.setAttribute("aria-label", "Paste code or picture");

pasteBox.dataset.placeholder = "Paste code or picture here...";

stack.appendChild(startMessage);

stack.appendChild(ghostTitle);

stack.appendChild(centerTitle);

stack.appendChild(pasteHint);

  stack.appendChild(pasteBox);

  buildPicturesButton();

  stack.removeEventListener("click", handleWholeScreenPaste);

  stack.addEventListener("click", handleWholeScreenPaste);

  pasteBox.removeEventListener("input", handlePasteBoxInput);

  pasteBox.addEventListener("input", handlePasteBoxInput);

  pasteBox.removeEventListener("paste", handlePasteBoxPaste);

  pasteBox.addEventListener("paste", handlePasteBoxPaste);

}





async function handleWholeScreenPaste(e) {
  if (e.target.closest("#status")) return;
  if (e.target.closest("#startPasteBox")) return;

  try {
    // Check for pictures first.
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        const imageType = item.types.find(
          type => type.startsWith("image/")
        );

        if (imageType) {
          const blob = await item.getType(imageType);
          openPictureEditor(blob);
          return;
        }

        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();

          if (text.trim()) {
            beginCodeLoad(text);
            return;
          }
        }
      }
    } else if (navigator.clipboard?.readText) {
      const text = await navigator.clipboard.readText();
      if (text.trim()) beginCodeLoad(text);
    }
  } catch (err) {
    console.warn("Clipboard unavailable.", err);
  }
}


function handlePasteBoxPaste(event) {
  alert("PASTE DETECTED!");

  const item = [...(event.clipboardData?.items || [])]
    .find(item => item.type.startsWith("image/"));

  if (item) {
    event.preventDefault();

    const file = item.getAsFile();
    if (file) openPictureEditor(file);
    return;
  }

  // Let Safari insert ordinary text.
}

function handlePasteBoxInput() {
  if (!pasteBox) return;

  // Safari may insert an image directly.
  const image = pasteBox.querySelector("img");

  if (image) {
    fetch(image.src)
      .then(response => response.blob())
      .then(openPictureEditor)
      .catch(console.error);
    return;
  }

  const text = pasteBox.innerText;

  if (text?.trim()) beginCodeLoad(text);
}

function openPictureEditor(blob) {
  if (pictureOpening) return;
  if (!blob?.type.startsWith("image/")) return;

  pictureOpening = true;

  stack.removeEventListener("click", handleWholeScreenPaste);

  const frame = document.createElement("iframe");

  frame.src = "pictures/reveal-conceal.html";
  frame.title = "Reveal & Conceal";

  Object.assign(frame.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    border: "0",
    zIndex: "1000",
    background: "#343638"
  });

  frame.onload = () => {
    frame.contentWindow.postMessage(
      { type: "OPEN_PICTURE", blob },
      location.origin
    );
  };

  document.body.appendChild(frame);
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


fadeStatusAfterPaste();

        stack.removeEventListener("click", handleWholeScreenPaste);

    renderBlockMode(true);

    const undoButton = document.getElementById("replace-erase-undo-button");

    const redoButton = document.getElementById("replace-erase-redo-button");

    if (undoButton) undoButton.style.display = "";

    if (redoButton) redoButton.style.display = "";

  }, 320);

}
