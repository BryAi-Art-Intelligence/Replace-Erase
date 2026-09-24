
/* Create the ghost title */

const ghostTitle = document.createElement("div");
ghostTitle.className = "ghost-title";

ghostTitle.innerHTML = `
  <div>Replace</div>

  <div class="ghost-bottom">
    <span class="ghost-amp">&amp;</span>
    <span class="ghost-erase">Erase</span>
  </div>
`;

/* Tap the & to show or hide artwork */

const amp = ghostTitle.querySelector(".ghost-amp");

amp.addEventListener("click", (e) => {
  e.stopPropagation();

  document
    .querySelector(".amp-art")
    ?.classList.toggle("show");
});
