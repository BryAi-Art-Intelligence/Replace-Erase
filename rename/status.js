
/* status/status.js */

function setupStatus() {
  if (!status) return;

  status.addEventListener("click", e => {
    e.stopPropagation();

    statusWasPressed = true;

    status.classList.remove("status-faded");
    status.classList.add("status-green");
  });
}

function fadeStatusAfterPaste() {
  if (statusWasPressed && status) {
    status.classList.add("status-faded");
  }
}
