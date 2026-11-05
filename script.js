const sectionMenu = document.querySelector(".section-menu");
const themeToggle = sectionMenu.querySelector(".theme-toggle");
const pageTheme = document.documentElement.dataset;

themeToggle.setAttribute("aria-pressed", String(pageTheme.theme === "dark"));
themeToggle.hidden = false;
themeToggle.addEventListener("click", () => {
  const dark = pageTheme.theme !== "dark";
  pageTheme.theme = dark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(dark));
  try {
    localStorage.setItem("portfolio-theme", pageTheme.theme);
  } catch {}
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealElements = [...document.querySelectorAll(".reveal")];
let revealObserver;

function configureReveals() {
  revealObserver?.disconnect();
  revealElements.forEach((element) => element.classList.remove("is-pending"));
  document.body.classList.remove("motion-ready");
  if (motionPreference.matches || !("IntersectionObserver" in window)) return;
  document.body.classList.add("motion-ready");
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06 },
  );
  revealElements.forEach((element) => {
    if (element.getBoundingClientRect().top >= window.innerHeight)
      element.classList.add("is-pending");
    revealObserver.observe(element);
  });
}

configureReveals();
motionPreference.addEventListener("change", configureReveals);

document.querySelector("#current-year").textContent = new Date().getFullYear();

const sectionLinks = [...sectionMenu.querySelectorAll(".section-menu-links a")];
const menuToggle = sectionMenu.querySelector(".menu-toggle");
sectionMenu.querySelector(".nav-logo").addEventListener("click", () => {
  menuToggle.setAttribute("aria-expanded", "false");
});
menuToggle.hidden = false;
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
});
sectionLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    if (window.matchMedia("(max-width: 768px)").matches) menuToggle.focus({ preventScroll: true });
  });
});
sectionMenu.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.focus();
  }
});
window.matchMedia("(max-width: 768px)").addEventListener("change", () => {
  menuToggle.setAttribute("aria-expanded", "false");
});
const workWidget = document.querySelector(".work-widget");
if (workWidget) {
  const menuSections = sectionLinks.map((link) =>
    document.querySelector(link.getAttribute("href")),
  );
  let sectionUpdatePending = false;
  const backToTop = document.querySelector(".back-to-top");

  function updateCurrentSection() {
    backToTop.hidden = window.scrollY < 240;
    const marker = Math.max(160, sectionMenu.getBoundingClientRect().bottom + 24);
    let current = -1;
    menuSections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= marker) current = index;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      current = sectionLinks.length - 1;
    }
    sectionLinks.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    sectionUpdatePending = false;
  }

  const workTrigger = workWidget.querySelector("summary");
  const workClose = workWidget.querySelector(".work-close");

  function closeWorkWidget() {
    workWidget.open = false;
    workTrigger.focus();
  }

  workClose.hidden = false;
  workClose.addEventListener("click", closeWorkWidget);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && workWidget.open) {
      closeWorkWidget();
    }
  });
  document.addEventListener("click", (event) => {
    if (workWidget.open && !workWidget.contains(event.target)) {
      workWidget.open = false;
    }
  });

  function scheduleSectionUpdate() {
    if (sectionUpdatePending) return;
    sectionUpdatePending = true;
    window.requestAnimationFrame(updateCurrentSection);
  }

  window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
  window.addEventListener("resize", scheduleSectionUpdate);
  window.addEventListener("load", scheduleSectionUpdate);
  updateCurrentSection();
}
