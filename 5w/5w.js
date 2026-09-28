
const bryaiButtons = document.querySelectorAll(
  ".bryai-nav button"
);
const bryaiNav = document.querySelector(".bryai-nav");
const bryaiSlider = document.querySelector(".bryai-slider");

function moveBryaiSlider(button) {
  const navBox = bryaiNav.getBoundingClientRect();
  const buttonBox = button.getBoundingClientRect();

  bryaiSlider.style.width = buttonBox.width + "px";
  bryaiSlider.style.height = buttonBox.height + "px";

  bryaiSlider.style.transform =
    `translate(
      ${buttonBox.left - navBox.left}px,
      ${buttonBox.top - navBox.top}px
    )`;

  bryaiSlider.style.opacity = "1";
}

const bryaiWords = {
  WHO: "Your WHO text goes here.",
  WHAT: "Your WHAT text goes here.",
  WHEN: "Your WHEN text goes here.",
  WHERE: "Your WHERE text goes here.",
  WHY: "Your WHY text goes here."
};

const bryaiOutput = document.createElement("div");
bryaiOutput.className = "bryai-words";

document.querySelector(".bryai-nav")
  .insertAdjacentElement("afterend", bryaiOutput);

let activeWord = "";

bryaiButtons.forEach(button => {
  button.addEventListener("click", () => {
    const word = button.textContent.trim();

    if (activeWord === word) {
      activeWord = "";
      bryaiOutput.textContent = "";

bryaiSlider.style.opacity = "0";

    } else {
      activeWord = word;
      bryaiOutput.textContent = bryaiWords[word] || "";

      bryaiButtons.forEach(b => {
        b.classList.remove("active");
      });

moveBryaiSlider(button);
    }

    // Tell the main page whether a W is open.
    window.parent.postMessage({
      type: "BRYAI_5W",
      active: activeWord !== ""
    }, window.location.origin);
  });
});
