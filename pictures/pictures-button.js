
/* pictures-button.js
   Creates the optional PICTURES button.
   Hidden by default.
*/

function buildPicturesButton(){

  const stack = document.getElementById("stack");
  if (!stack) return;

  stack.querySelector(".start-color-button")?.remove();

  const button = document.createElement("button");

  button.type = "button";
  button.className = "start-color-button";
  button.textContent = "PICTURES";
  button.setAttribute("aria-pressed", "false");

  button.addEventListener("click", e => {
    e.stopPropagation();

    colorOnlyMode = !colorOnlyMode;

    document.body.classList.toggle(
      "color-only-mode",
      colorOnlyMode
    );

    button.classList.toggle(
      "is-active",
      colorOnlyMode
    );

    button.textContent =
      colorOnlyMode ? "pictures" : "PICTURES";

    button.setAttribute(
      "aria-pressed",
      String(colorOnlyMode)
    );
  });

  stack.appendChild(button);
}
