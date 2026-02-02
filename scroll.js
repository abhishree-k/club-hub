// scroll top button
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  scrollTopBtn.style.display = window.scrollY > 600 ? "flex" : "none";
  scrollTopBtn.style.alignItems = "center";
  scrollTopBtn.style.justifyContent = "center";
});
scrollTopBtn.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);