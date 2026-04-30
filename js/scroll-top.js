    const scrollTopButton = document.getElementById("scroll-top-btn");

    if (scrollTopButton) {
      scrollTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }