// 15-opening-page.js
// Starts the app and resets it to the opening state.
// This runs when the page opens, clears the table, then calls the start page.

function startDefaultCanvas(){
  injectCollapsedStyles();

  codeView.classList.add("hidden");
  codeView.classList.remove("fade-in-blocks");
  scene.classList.remove("hidden");
  document.body.classList.remove("unified-mode");
  activeType = null;
  currentParts = [];
  selectedLines = new Set();
  expandedBlocks = new Set();
  setPanelColor(null);
  buildStartUI();
}

if (document.readyState === "loading"){
  window.addEventListener("DOMContentLoaded", startDefaultCanvas);
} else {
  startDefaultCanvas();
}
