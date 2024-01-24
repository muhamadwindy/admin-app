document.addEventListener("DOMContentLoaded", () => {
  const openModal = document.getElementById("open-modal");
  const formModal = document.getElementById("inputUser");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementsByClassName("close-modal");

  openModal.addEventListener("click", () => {
    modal.classList.remove("hidden");
    formModal.reset();
  });

  Array.from(closeModal).forEach((e) => {
    e.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  });

  const isActive = document.getElementById("isActive");

  isActive.addEventListener("change", () => {
    const labelIsComplete = document.querySelector('label[for="isActive"]');
    isActive.checked
      ? (labelIsComplete.classList.remove("bg-gray-300"),
        labelIsComplete.classList.add("bg-green-500"))
      : (labelIsComplete.classList.remove("bg-green-500"),
        labelIsComplete.classList.add("bg-gray-300"));
  });

  const linkTab = document.querySelectorAll(".tab-link");
  const arrTabCOntent = document.querySelectorAll(".tab-content");
  linkTab.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById("searchUsername").value = "";
      const tabName = event.target.getAttribute("data-tab");

      if (tabName === "tab-3") {
        let alltab = document.getElementsByClassName("tab-content");
        Array.from(alltab).forEach((tab) => {
          tab.classList.remove("hidden");
        });
        return;
      }
      arrTabCOntent.forEach((contentTab) => {
        contentTab.classList.add("hidden");
      });
      document.getElementById(tabName).classList.remove("hidden");
    });
  });
});
