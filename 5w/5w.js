
const bryaiButtons = document.querySelectorAll(
  ".bryai-nav button"
);

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

      button.classList.remove("active");

    } else {
      activeWord = word;
      bryaiOutput.textContent = bryaiWords[word] || "";

      bryaiButtons.forEach(b => {
        b.classList.remove("active");
      });

      button.classList.add("active");
    }

    // Tell the main page whether a W is open.
    window.parent.postMessage({
      type: "BRYAI_5W",
      active: activeWord !== ""
    }, window.location.origin);
  });
});
