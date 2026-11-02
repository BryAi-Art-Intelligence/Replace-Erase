
/* status/status.js */

function setupStatus() {
  if (!status) return;

  status.style.transform = "scale(1.4)";
  status.style.transformOrigin = "center";

  status.addEventListener("click", e => {
    e.stopPropagation();

    statusWasPressed = true;

    status.classList.remove("status-faded");
    status.classList.toggle("status-green");
  });
}

function fadeStatusAfterPaste() {
  if (!status) return;

  status.style.display = "";
  status.style.transform = "scale(1)";
  status.classList.add("status-faded");
}
