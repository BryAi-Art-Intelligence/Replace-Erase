// 2-start-page.js
// Makes the opening paste screen.
// Builds the start page and handles the first full-screen paste.

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

  stack.appendChild(startMessage);
  stack.appendChild(ghostTitle);
  stack.appendChild(centerTitle);

  stack.removeEventListener("click", handleWholeScreenPaste);
  stack.addEventListener("click", handleWholeScreenPaste);
}

async function handleWholeScreenPaste(e){
  if (e.target.closest("#status")) return;

  try{
    const text = await navigator.clipboard.readText();
    if (!text || !text.trim()) return;

    stack.classList.add("fade-out-start");

    setTimeout(() => {
      currentParts = splitCode(text);
      selectedLines = new Set();
      expandedBlocks = new Set();
      activeType = null;
      setPanelColor(null);

      if (statusWasPressed && status) status.classList.add("status-faded");

      stack.removeEventListener("click", handleWholeScreenPaste);
      renderBlockMode(true);
    }, 320);
  }catch(err){
    alert("Clipboard paste failed. Try copying the code again first.");
  }
}
