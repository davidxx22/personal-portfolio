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

const workGallery = document.querySelector(".work-gallery");
if (workGallery) {
  const projects = [...workGallery.querySelectorAll(".gallery-project")];
  const previews = [...workGallery.querySelectorAll(".gallery-preview")];
  const status = workGallery.querySelector(".gallery-status");
  const projectAt = (index) => (index + projects.length) % projects.length;
  let activeProject = 0;
  let galleryAnimations = [];
  const previewSlots = () => [
    previews[0],
    projects[activeProject].querySelector(".project-image"),
    previews[1],
  ];

  function showProject(index, direction = 0) {
    galleryAnimations.forEach((animation) => animation.cancel());
    const animate = direction !== 0 && !motionPreference.matches;
    const previousRects = animate ? previewSlots().map((slot) => slot.getBoundingClientRect()) : [];

    activeProject = projectAt(index);
    projects.forEach((project, position) => {
      project.hidden = position !== activeProject;
    });
    previews.forEach((preview, position) => {
      const neighbor = projects[projectAt(activeProject + (position === 0 ? -1 : 1))];
      preview.querySelector("img").src = neighbor.querySelector("img").src;
      preview.setAttribute("aria-label", "Show " + neighbor.querySelector("h2").textContent);
    });
    const project = projects[activeProject];
    const title = project.querySelector("h2");
    status.textContent = `Project ${activeProject + 1} of ${projects.length}: ${title.textContent}`;

    if (animate) {
      galleryAnimations = previewSlots().map((slot, position) => {
        const previous = previousRects[position + direction];
        const current = slot.getBoundingClientRect();
        const x = previous ? previous.left - current.left : direction * 12;
        const y = previous ? previous.top - current.top : 0;
        const scaleX = previous ? previous.width / current.width : 1;
        const scaleY = previous ? previous.height / current.height : 1;

        return slot.animate(
          [
            { transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`, opacity: previous ? 1 : 0 },
            { transform: "none", opacity: 1 },
          ],
          { duration: 320, easing: "ease-out" },
        );
      });
      [title, project.querySelector("p")].forEach((element, position) => {
        galleryAnimations.push(element.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 500, delay: 60 + position * 65, easing: "ease-out", fill: "backwards" },
        ));
      });
    }
  }

  if (projects.length > 1) {
    previews.forEach((preview, position) => {
      const offset = position === 0 ? -1 : 1;
      preview.addEventListener("click", () => showProject(activeProject + offset, offset));
      preview.hidden = false;
    });
    workGallery.classList.add("is-interactive");
    status.hidden = false;
    showProject(0);

    let touchStart;
    let suppressClick = false;
    workGallery.addEventListener("pointerdown", (event) => {
      suppressClick = false;
      if (event.pointerType === "touch" && event.isPrimary) {
        touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
      }
    });
    workGallery.addEventListener("pointercancel", (event) => {
      if (touchStart?.id === event.pointerId) touchStart = undefined;
    });
    workGallery.addEventListener("pointerup", (event) => {
      if (touchStart?.id !== event.pointerId) return;
      const x = event.clientX - touchStart.x;
      const y = event.clientY - touchStart.y;
      touchStart = undefined;
      if (Math.abs(x) < 40 || Math.abs(x) <= Math.abs(y)) return;
      const direction = x < 0 ? 1 : -1;
      suppressClick = true;
      showProject(activeProject + direction, direction);
    });
    workGallery.addEventListener("click", (event) => {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, { capture: true });
  }
}

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
