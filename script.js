const profileSidebar = document.querySelector(".profile-sidebar");

function positionProfileSidebar() {
  const height = profileSidebar.getBoundingClientRect().height;
  const top = Math.min(24, window.innerHeight - height - 24);
  profileSidebar.style.setProperty("--profile-top", `${top}px`);
  profileSidebar.parentElement.style.setProperty("--profile-top", `${top}px`);
  const frame = document.querySelector(".page-frame");
  if (window.innerWidth <= 1100 || getComputedStyle(profileSidebar).position !== "sticky") {
    frame.style.paddingBottom = "0px";
    return;
  }
  const shell = profileSidebar.parentElement;
  const existingSpace = parseFloat(frame.style.paddingBottom) || 0;
  const spaceBelowCards = document.documentElement.scrollHeight - (shell.getBoundingClientRect().bottom + window.scrollY);
  const requiredSpace = window.innerHeight - top - height;
  frame.style.paddingBottom = `${Math.min(24, Math.max(0, existingSpace + requiredSpace - spaceBelowCards))}px`;
}

positionProfileSidebar();
window.addEventListener("resize", positionProfileSidebar);
window.addEventListener("load", positionProfileSidebar);
if ("ResizeObserver" in window) {
  new ResizeObserver(positionProfileSidebar).observe(profileSidebar);
}

const filterBar = document.querySelector(".project-filters");
const filterButtons = [...filterBar.querySelectorAll("button")];
const projectCards = [...document.querySelectorAll(".project-card")];
const showMoreProjects = document.querySelector(".show-more-projects");
const featuredProjects = new Set(["sideform", "tripon", "verde", "sakyan"]);
let activeFilter = "all";
let projectsExpanded = false;
filterBar.hidden = false;

function updateProjects() {
  projectCards.forEach((card) => {
    const match = activeFilter === "all" || card.dataset.category === activeFilter;
    const visible = match && (activeFilter !== "all" || projectsExpanded || featuredProjects.has(card.dataset.project));
    card.hidden = !visible;
    if (visible) card.classList.remove("is-pending");
  });
  showMoreProjects.hidden = activeFilter !== "all";
  showMoreProjects.textContent = projectsExpanded ? "Show less" : "Show more";
  showMoreProjects.setAttribute("aria-expanded", String(projectsExpanded));
}

showMoreProjects.addEventListener("click", () => {
  projectsExpanded = !projectsExpanded;
  updateProjects();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    projectsExpanded = false;
    filterButtons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    updateProjects();
  });
});
updateProjects();

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

const sectionMenu = document.querySelector(".section-menu");
const sectionLinks = [...sectionMenu.querySelectorAll("a")];
const menuToggle = sectionMenu.querySelector(".menu-toggle");
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
const menuSections = sectionLinks.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
let sectionUpdatePending = false;

function updateCurrentSection() {
  const marker = Math.max(160, sectionMenu.getBoundingClientRect().bottom + 24);
  let current = 0;
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

function scheduleSectionUpdate() {
  if (sectionUpdatePending) return;
  sectionUpdatePending = true;
  window.requestAnimationFrame(updateCurrentSection);
}

window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
window.addEventListener("resize", scheduleSectionUpdate);
window.addEventListener("load", scheduleSectionUpdate);
updateCurrentSection();

const screenshotDialog = document.querySelector(".screenshot-dialog");
let screenshotTrigger;
let screenshotIndex = 0;
let screenshotProject;
const screenshotGalleries = {
  doneeit: Array.from({ length: 13 }, (_, index) => ({
    src: `assets/projects/doneeit/screen-${String(index + 1).padStart(2, "0")}.webp`,
    alt: `DoneeIt app screenshot ${index + 1}`,
  })),
  financify: [
    ["dashboard", "Balance and recent transactions"],
    ["analytics", "Budget allocation and analytics"],
    ["recipes", "Recipe recommendations"],
    ["currency", "Currency conversion"],
  ].map(([name, description]) => ({
    src: `assets/projects/financify/${name}.webp`,
    alt: `Financify app: ${description}`,
  })),
};

function renderScreenshot() {
  const gallery = screenshotGalleries[screenshotProject];
  const image = screenshotDialog.querySelector("img");
  image.src = gallery[screenshotIndex].src;
  image.alt = gallery[screenshotIndex].alt;
  screenshotDialog.querySelector(".screenshot-count").textContent = `${screenshotIndex + 1} / ${gallery.length}`;
}

function changeScreenshot(step) {
  const length = screenshotGalleries[screenshotProject].length;
  screenshotIndex = (screenshotIndex + step + length) % length;
  renderScreenshot();
}

screenshotDialog.querySelector(".screenshot-previous").addEventListener("click", () => changeScreenshot(-1));
screenshotDialog.querySelector(".screenshot-next").addEventListener("click", () => changeScreenshot(1));
screenshotDialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    changeScreenshot(event.key === "ArrowLeft" ? -1 : 1);
  }
});
document.querySelectorAll("[data-image-preview]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (typeof screenshotDialog.showModal !== "function") return;
    event.preventDefault();
    screenshotProject = link.closest(".project-card").dataset.project;
    screenshotIndex = 0;
    renderScreenshot();
    document.querySelector("#screenshot-title").textContent = link.closest(".project-card").querySelector("h3").textContent;
    screenshotTrigger = link;
    document.body.classList.add("modal-open");
    screenshotDialog.showModal();
  });
});
screenshotDialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  screenshotTrigger?.focus();
});
