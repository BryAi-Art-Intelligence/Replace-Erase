const buttons =
  document.querySelectorAll(
    ".shape-button"
  );

let selectedShape =
  "square";


function getSelectedShape() {

  return selectedShape;

}


function chooseShape(shape) {

  selectedShape =
    shape;

  buttons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.shape === shape
      );

    }
  );

}


buttons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        chooseShape(
          button.dataset.shape
        );

      }
    );

  }
);
