// scroll to top button with progress indicator and adaptive visibility
(function() {
  // Create scroll button element
  const scrollTopBtn = document.createElement("div");
  scrollTopBtn.id = "scrollTopBtn";
  scrollTopBtn.setAttribute("aria-label", "Scroll to top");
  scrollTopBtn.tabIndex = 0;

  // Apply essential styles
  Object.assign(scrollTopBtn.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    opacity: "0",
    transform: "scale(0.7)",
    transition: "opacity 0.3s, transform 0.3s",
    zIndex: "9999",
    fontSize: "20px",
    fontWeight: "bold",
    userSelect: "none"
  });
  scrollTopBtn.textContent = "↑";

  // Create SVG circular progress indicator
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 36 36");
  svg.style.position = "absolute";
  svg.style.width = "100%";
  svg.style.height = "100%";

  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", "18");
  circle.setAttribute("cy", "18");
  circle.setAttribute("r", "16");
  circle.setAttribute("stroke", "#fff");
  circle.setAttribute("stroke-width", "2");
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke-dasharray", "100");
  circle.setAttribute("stroke-dashoffset", "100");
  circle.style.transition = "stroke-dashoffset 0.2s linear";

  svg.appendChild(circle);
  scrollTopBtn.appendChild(svg);
  document.body.appendChild(scrollTopBtn);

  // Configuration
  const threshold = 0.15; // Show the button after 15% scroll
  let ticking = false;
  let inactiveTimer;

  /**
   * Updates scroll button visibility, position relative to footer and progress ring
   */
  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = window.scrollY / scrollHeight;

    // Toggle visibility based on scroll threshold
    const visible = scrollFraction > threshold;
    scrollTopBtn.style.opacity = visible ? "1" : "0";
    scrollTopBtn.style.transform = visible ? "scale(1)" : "scale(0.7)";
    scrollTopBtn.style.display = visible || scrollTopBtn.style.opacity === "1" ? "flex" : "none";

    // Prevent overlap with footer
    const footer = document.querySelector("footer");
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY + window.innerHeight > footerTop - 20) {
        scrollTopBtn.style.opacity = "0";
        scrollTopBtn.style.transform = "scale(0.7)";
      }
    }

    // Update circular progress indicator
    circle.setAttribute("stroke-dashoffset", `${100 - scrollFraction * 100}`);

    // Fade to semi-transparent after inactivity
    if (visible) {
      clearTimeout(inactiveTimer);
      inactiveTimer = setTimeout(() => {
        scrollTopBtn.style.opacity = "0.5";
      }, 2000);
    }

    ticking = false;
  };

  // Optimize scroll event using requestAnimationFrame
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  });

  /**
   * Scrolls the page to top with smooth animation
   */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  scrollTopBtn.addEventListener("click", scrollToTop);

  // Enable keyboard accessibility (Enter and Space keys)
  scrollTopBtn.addEventListener("keypress", e => {
    if (e.key === "Enter" || e.key === " ") scrollToTop();
  });

  // Adjust button on window resize
  window.addEventListener("resize", () => {
    ticking = false;
    handleScroll();
  });
})();
