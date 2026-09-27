
/* Connect 5W buttons to the main title */

let fiveWOpen = false;

function updateFiveWTitle() {
  const title = document.querySelector(".ghost-title");

  if (!title) return;

  title.classList.toggle("is-hidden", fiveWOpen);
}

window.addEventListener("message", event => {
  if (event.origin !== window.location.origin) return;

  const frame = document.querySelector(
    'iframe[src="5w/5w.html"]'
  );

  if (!frame || event.source !== frame.contentWindow) {
    return;
  }

  if (event.data?.type !== "BRYAI_5W") return;

  fiveWOpen = event.data.active === true;
  updateFiveWTitle();
});

window.addEventListener(
  "replaceEraseLoaded",
  updateFiveWTitle
);
