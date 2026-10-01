const bryaiButtons = document.querySelectorAll(
  ".bryai-nav button"
);

const bryaiNav = document.querySelector(".bryai-nav");
const bryaiSlider = document.querySelector(".bryai-slider");

function moveBryaiSlider(button) {
  const navBox = bryaiNav.getBoundingClientRect();
  const buttonBox = button.getBoundingClientRect();

  bryaiSlider.style.zIndex =
    getComputedStyle(button).zIndex;

  // Fade out first
  bryaiSlider.style.opacity = "0";

  setTimeout(() => {

    // Move while invisible
    bryaiSlider.style.width = buttonBox.width + "px";
    bryaiSlider.style.height = buttonBox.height + "px";

    bryaiSlider.style.transform =
      `translate(
        ${buttonBox.left - navBox.left}px,
        ${buttonBox.top - navBox.top}px
      )`;

    // Fade back in
    setTimeout(() => {
      bryaiSlider.style.opacity = "1";
    }, 350);

  }, 200);
}


/* =========================
   5W CONTENT
   ========================= */

const bryaiWords = {

  WHO: `You, every one, ai, and earth.
That's who replace & erase is for.
Thanks for takin the time to read this.`,

  WHEN: "Your WHEN text goes here.",

  WHERE: "Your WHERE text goes here.",

  WHY: "Your WHY text goes here."

};


/* =========================
   OUTPUT AREA
   ========================= */

const bryaiOutput = document.createElement("div");
bryaiOutput.className = "bryai-words";

document.querySelector(".bryai-nav")
  .insertAdjacentElement("afterend", bryaiOutput);

let activeWord = "";


/* =========================
   SHOW CONTENT
   ========================= */

function showBryaiContent(word) {

  // Clear whatever was there before
  bryaiOutput.innerHTML = "";

  // WHAT gets its own HTML file
  if (word === "WHAT") {

    const frame = document.createElement("iframe");

    frame.src = "what.html";
    frame.title = "What — Code & Pix";

    frame.style.width = "100%";
    frame.style.height = "430px";
    frame.style.border = "0";
    frame.style.display = "block";
    frame.style.background = "transparent";

    bryaiOutput.appendChild(frame);

    return;
  }

  // Other W buttons still use regular text
  bryaiOutput.textContent =
    bryaiWords[word] || "";
}


/* =========================
   BUTTONS
   ========================= */

bryaiButtons.forEach(button => {

  button.addEventListener("click", () => {

    const word = button.textContent.trim();

    // Tap active button again = close
    if (activeWord === word) {

      activeWord = "";

      bryaiOutput.innerHTML = "";

      bryaiSlider.style.opacity = "0";

    } else {

      activeWord = word;

      showBryaiContent(word);

      bryaiButtons.forEach(b => {
        b.classList.remove("active");
      });

      moveBryaiSlider(button);
    }


    // Tell main Replace & Erase page
    // whether a W is currently open
    window.parent.postMessage({
      type: "BRYAI_5W",
      active: activeWord !== ""
    }, window.location.origin);

  });

});
