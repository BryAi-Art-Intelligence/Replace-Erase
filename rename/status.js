
/* status/status.js */

function setupStatus() {
  if (!status) return;

  status.addEventListener("click", e => {
    e.stopPropagation();

    statusWasPressed = true;

    status.classList.remove("status-faded");
    status.classList.toggle("status-green");
  });
}

function fadeStatusAfterPaste() {
  if (statusWasPressed && status) {
    status.classList.add("status-faded");
  }

  if (status) {
    status.style.display = "none";
  }
}
