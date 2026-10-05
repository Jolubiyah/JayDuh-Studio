const categoryNames = {
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

function renderGallery(category) {
  currentCategory = category;
  currentIndex = 0;
  grid.innerHTML = "";

  const pieces = GALLERY[category] || [];
  emptyMessage.classList.toggle("show", pieces.length === 0);

  pieces.forEach((piece, index) => {
    const card = document.createElement("article");
    card.className = "art-card";
    card.innerHTML = `
      <img src="assets/${category}/${piece.file}" alt="${escapeHtml(piece.title)}" loading="lazy">
      <div class="art-info">
        <strong>${escapeHtml(piece.title)}</strong>
        <span>${categoryNames[category]}</span>
      </div>
    `;
    card.addEventListener("click", () => openLightbox(index));
    grid.appendChild(card);
  });
}

function openLightbox(index) {
  const pieces = GALLERY[currentCategory] || [];
  if (!pieces.length) return;

  currentIndex = index;
  const piece = pieces[currentIndex];
  lightboxImage.src = `assets/${currentCategory}/${piece.file}`;
  lightboxImage.alt = piece.title;
  lightboxTitle.textContent = piece.title;
  lightboxCategory.textContent = categoryNames[currentCategory];
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function moveLightbox(direction) {
  const pieces = GALLERY[currentCategory] || [];
  if (!pieces.length) return;
  currentIndex = (currentIndex + direction + pieces.length) % pieces.length;
  openLightbox(currentIndex);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderGallery(tab.dataset.category);
  });
});

document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
document.querySelector(".lightbox-prev").addEventListener("click", () => moveLightbox(-1));
document.querySelector(".lightbox-next").addEventListener("click", () => moveLightbox(1));

lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") moveLightbox(-1);
  if (e.key === "ArrowRight") moveLightbox(1);
});

document.querySelectorAll("[data-link]").forEach(link => {
  const type = link.dataset.link;
  link.href = SITE_CONFIG[type] || "#";
  if (SITE_CONFIG[type] && SITE_CONFIG[type] !== "#") {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const menuButton = document.querySelector(".menu-btn");
const nav = document.querySelector("nav");
menuButton.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

renderGallery("headshots");
