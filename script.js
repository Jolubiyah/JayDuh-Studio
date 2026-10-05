const CATEGORY_NAMES = {
  headshots: "Headshots",
  "half-body": "Half Body",
  "full-body": "Full Body",
  thumbnails: "Thumbnails"
};

let currentCategory = "headshots";
let currentIndex = 0;

const grid = document.getElementById("gallery-grid");
const emptyMessage = document.getElementById("empty-message");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCategory = document.getElementById("lightbox-category");

function getGalleryData() {
  return typeof GALLERY !== "undefined" ? GALLERY : {};
}

function renderGallery(category) {
  currentCategory = category;
  currentIndex = 0;

  if (!grid) return;
  grid.replaceChildren();

  const galleryData = getGalleryData();
  const pieces = galleryData[category] ?? [];

  if (emptyMessage) {
    emptyMessage.classList.toggle("show", pieces.length === 0);
  }

  const fragment = document.createDocumentFragment();

  pieces.forEach((piece, index) => {
    const card = document.createElement("article");
    card.className = "art-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${piece.title}`);

    const imagePath = `assets/${category}/${piece.file}`;

    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = piece.title || "";
    img.loading = "lazy";

    const info = document.createElement("div");
    info.className = "art-info";

    const titleEl = document.createElement("strong");
    titleEl.textContent = piece.title;

    const categoryEl = document.createElement("span");
    categoryEl.textContent = CATEGORY_NAMES[category] ?? category;

    info.append(titleEl, categoryEl);
    card.append(img, info);

    img.addEventListener("error", () => {
      card.className = "art-card art-card-error";
      card.replaceChildren();

      const errorContainer = document.createElement("div");
      const errTitle = document.createElement("strong");
      errTitle.textContent = piece.title;

      const errDetail = document.createElement("small");
      errDetail.style.color = "#e66";
      errDetail.replaceChildren(
        document.createTextNode("Image file not found"),
        document.createElement("br"),
        document.createTextNode(`(${piece.file})`)
      );

      errorContainer.append(errTitle, document.createElement("br"), errDetail);
      card.appendChild(errorContainer);
    });

    const openAction = () => openLightbox(index);
    card.addEventListener("click", openAction);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAction();
      }
    });

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function openLightbox(index) {
  const galleryData = getGalleryData();
  const pieces = galleryData[currentCategory] ?? [];
  if (!pieces.length || !lightbox) return;

  currentIndex = index;
  const piece = pieces[currentIndex];

  if (lightboxImage) {
    lightboxImage.src = `assets/${currentCategory}/${piece.file}`;
    lightboxImage.alt = piece.title;
  }
  if (lightboxTitle) {
    lightboxTitle.textContent = piece.title;
  }
  if (lightboxCategory) {
    lightboxCategory.textContent = CATEGORY_NAMES[currentCategory] ?? currentCategory;
  }

  if (typeof lightbox.showModal === "function") {
    if (!lightbox.open) lightbox.showModal();
  } else {
    lightbox.classList.add("open");
  }

  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;

  if (typeof lightbox.close === "function" && lightbox.open) {
    lightbox.close();
  } else {
    lightbox.classList.remove("open");
  }

  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function moveLightbox(direction) {
  const galleryData = getGalleryData();
  const pieces = galleryData[currentCategory] ?? [];
  if (!pieces.length) return;

  currentIndex = (currentIndex + direction + pieces.length) % pieces.length;
  openLightbox(currentIndex);
}

function initTabs() {
  const tabs = document.querySelectorAll('.category-tabs [role="tab"]');
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      renderGallery(tab.dataset.category);
    });
  });
}

function initLightboxControls() {
  document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  document.querySelector(".lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
  document.querySelector(".lightbox-next")?.addEventListener("click", () => moveLightbox(1));

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    const isOpen = lightbox?.open || lightbox?.classList.contains("open");
    if (!isOpen) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") moveLightbox(-1);
    if (e.key === "ArrowRight") moveLightbox(1);
  });
}

function initConfigLinks() {
  if (typeof SITE_CONFIG === "undefined") return;

  document.querySelectorAll("[data-link]").forEach((link) => {
    const type = link.dataset.link;
    const url = SITE_CONFIG[type];

    if (url && url !== "#") {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.href = "#";
    }
  });
}

function initMobileMenu() {
  const menuButton = document.querySelector(".menu-btn");
  const nav = document.querySelector("nav");

  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

function initApp() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initTabs();
  initLightboxControls();
  initConfigLinks();
  initMobileMenu();
  renderGallery("headshots");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
