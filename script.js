document.addEventListener("DOMContentLoaded", function () {
  // === SIDEBAR ===
  const sidebarContainer = document.getElementById("sidebar-container");

  if (sidebarContainer) {
    fetch("sidebar.html")
      .then((res) => res.text())
      .then((data) => {
        sidebarContainer.innerHTML = data;

        const sidebar = document.getElementById("sidebar");
        const toggleButton = document.getElementById("toggleSidebar");
        const backButton = document.getElementById("backButton");

        toggleButton?.addEventListener("click", () => {
          sidebar.classList.toggle("open");
        });

        backButton?.addEventListener("click", () => {
          sidebar.classList.remove("open");
        });
        document.addEventListener("click", function (event) {
          // Sidebar açıksa ve tıklanan alan sidebar veya toggleButton değilse
          if (
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !toggleButton.contains(event.target)
          ) {
            sidebar.classList.remove("open");
          }
        });
      })
      .catch((err) => console.error("Sidebar yüklenemedi:", err));
  }

  // === LIGHTBOX ===
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".close");
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");

  let currentIndex = 0;

  function showLightbox(index) {
    if (index < 0 || index >= galleryItems.length) return;
    lightbox.style.display = "flex";
    lightboxImg.src = galleryItems[index].src;
    currentIndex = index;
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      showLightbox(index);
    });
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  prevBtn.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    showLightbox(currentIndex);
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    showLightbox(currentIndex);
  });

  window.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "flex") {
      if (e.key === "Escape") {
        lightbox.style.display = "none";
      } else if (e.key === "ArrowRight") {
        nextBtn.click();
      } else if (e.key === "ArrowLeft") {
        prevBtn.click();
      }
    }
  });
});
