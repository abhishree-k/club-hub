const themeSwitch = document.getElementById("theme-switch");
const icon = themeSwitch ? themeSwitch.querySelector("i") : null;

// Available Themes: 'cosmic' (default), 'light', 'oled'
let currentTheme = localStorage.getItem("theme") || "cosmic";

const applyTheme = (theme) => {
  // Remove all theme classes first
  document.body.classList.remove("light-mode", "oled-mode");

  if (theme === "light") {
    document.body.classList.add("light-mode");
  } else if (theme === "oled") {
    document.body.classList.add("oled-mode");
  }
  // "cosmic" needs no class, it's the default

  localStorage.setItem("theme", theme);
  updateIcon(theme);
}

const updateIcon = (theme) => {
  if (!icon) return;

  // Reset icon classes (font awesome)
  icon.className = "fas";

  if (theme === "light") {
    icon.classList.add("fa-sun");
  } else if (theme === "oled") {
    icon.classList.add("fa-moon");
  } else {
    // Cosmic / Default
    // Use a star or planet icon for the "Cosmic" theme
    icon.classList.add("fa-meteor");
  }
};

// Initialize
applyTheme(currentTheme);

if (themeSwitch) {
  themeSwitch.addEventListener("click", () => {
    // Cycle: Cosmic -> Light -> OLED -> Cosmic
    if (currentTheme === "cosmic") {
      currentTheme = "light";
    } else if (currentTheme === "light") {
      currentTheme = "oled";
    } else {
      currentTheme = "cosmic";
    }
    applyTheme(currentTheme);
  });
}


