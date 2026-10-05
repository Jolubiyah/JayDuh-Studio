var categoryNames = {
  headshots: "Headshots",
  "half-body": "Half Body",
  "full-body": "Full Body",
  thumbnails: "Thumbnails"
};

var currentCategory = "headshots";
var currentIndex = 0;

var grid = document.getElementById("gallery-grid");
var emptyMessage = document.getElementById("empty-message");
var lightbox = document.getElementById("lightbox");
var lightboxImage = document.getElementById("lightbox-image");
var lightboxTitle = document.getElementById("lightbox-title");
var lightboxCategory = document.getElementById("lightbox-category");

function getGalleryData() {
  return typeof GALLERY !== "undefined" ? GALLERY : {};
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function renderGallery(category) {
  currentCategory = category;
  currentIndex = 0;
  
  if (!grid) return;
  grid.innerHTML = "";

  var galleryData = getGalleryData();
  var pieces = galleryData[category] || [];

  if (emptyMessage) {
    emptyMessage.classList.toggle("show", pieces.length === 0);
  }

  pieces.forEach(function(piece, index) {
    var card = document.createElement("article");
    card.className = "art-card";
    
    var imagePath = "assets/" + category + "/" + piece.file;
    
    card.innerHTML = 
      '<img src="' + imagePath + '" alt="' + escapeHtml(piece.title) + '" loading="lazy">' +
      '<div class="art-info">' +
        '<strong>' + escapeHtml(piece.title) + '</strong>' +
        '<span>' + (categoryNames[category] || category) + '</span>' +
      '</div>';
      
    var imgElement = card.querySelector("img");
    if (imgElement) {
      imgElement.addEventListener("error", function() {
        this.style.display = "none";
        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.justifyContent = "center";
        card.style.textAlign = "center";
        card.style.padding = "20px";
        card.style.color = "#8e919c";
        card.style.fontSize = "0.85rem";
        card.innerHTML = "<div><strong>" + escapeHtml(piece.title) + "</strong><br><small style='color:#e66;'>Image file not found<br>(" + escapeHtml(piece.file) + ")</small></div>";
      });
    }

    card.addEventListener("click", function() {
      openLightbox(index);
    });
    
    grid.appendChild(card);
  });
}

function openLightbox(index) {
  var galleryData = getGalleryData();
  var pieces = galleryData[currentCategory] || [];
  if (!pieces.length || !lightbox) return;

  currentIndex = index;
  var piece = pieces[currentIndex];
  
  if (lightboxImage) {
    lightboxImage.src = "assets/" + currentCategory + "/" + piece.file;
    lightboxImage.alt = piece.title;
  }
  if (lightboxTitle) {
    lightboxTitle.textContent = piece.title;
  }
  if (lightboxCategory) {
    lightboxCategory.textContent = categoryNames[currentCategory] || currentCategory;
  }
  
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function moveLightbox(direction) {
  var galleryData = getGalleryData();
  var pieces = galleryData[currentCategory] || [];
  if (!pieces.length) return;
  currentIndex = (currentIndex + direction + pieces.length) % pieces.length;
  openLightbox(currentIndex);
}

document.querySelectorAll(".tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    document.querySelectorAll(".tab").forEach(function(t) {
      t.classList.remove("active");
    });
    tab.classList.add("active");
    renderGallery(tab.dataset.category);
  });
});

var closeBtn = document.querySelector(".lightbox-close");
if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

var prevBtn = document.querySelector(".lightbox-prev");
if (prevBtn) prevBtn.addEventListener("click", function() { moveLightbox(-1); });

var nextBtn = document.querySelector(".lightbox-next");
if (nextBtn) nextBtn.addEventListener("click", function() { moveLightbox(1); });

if (lightbox) {
  lightbox.addEventListener("click", function(e) {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener("keydown", function(e) {
  if (!lightbox || !lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") moveLightbox(-1);
  if (e.key === "ArrowRight") moveLightbox(1);
});

if (typeof SITE_CONFIG !== "undefined") {
  document.querySelectorAll("[data-link]").forEach(function(link) {
    var type = link.dataset.link;
    link.href = SITE_CONFIG[type] || "#";
    if (SITE_CONFIG[type] && SITE_CONFIG[type] !== "#") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
}

var yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

var menuButton = document.querySelector(".menu-btn");
var nav = document.querySelector("nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", function() {
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach(function(a) {
    a.addEventListener("click", function() {
      nav.classList.remove("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", function() {
  renderGallery("headshots");
});
