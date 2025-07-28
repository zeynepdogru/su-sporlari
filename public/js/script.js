document.addEventListener("DOMContentLoaded", function () {
  // === SIDEBAR ===
  const sidebarContainer = document.getElementById("sidebar-container");

  if (sidebarContainer) {
    fetch("../html/sidebar.html")
      .then((res) => res.text())
      .then((data) => {
        sidebarContainer.innerHTML = data;

        const sidebar = document.getElementById("sidebar");
        const toggleButton = document.getElementById("toggleSidebar");
        const backButton = document.getElementById("backButton");
        const closeButton = document.getElementById("closeSidebar");

        toggleButton?.addEventListener("click", () => {
          sidebar?.classList.toggle("open");
        });

        backButton?.addEventListener("click", () => {
          sidebar?.classList.remove("open");
        });

        closeButton?.addEventListener("click", () => {
          sidebar?.classList.remove("open");
        });

        if (sidebar && toggleButton) {
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
        }
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

  // Lightbox işlevselliğini sadece gerekli elementler varsa ekle
  if (
    galleryItems.length > 0 &&
    lightbox &&
    lightboxImg &&
    closeBtn &&
    prevBtn &&
    nextBtn
  ) {
    let currentIndex = 0;

    function showLightbox(index) {
      if (index < 0 || index >= galleryItems.length) return;
      lightbox.style.display = "flex";
      lightboxImg.src = galleryItems[index].src;
      currentIndex = index;
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        currentIndex = index;
        updateLightbox();
        lightbox.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent scrolling when lightbox is open
      });
    });

    // Update lightbox image
    function updateLightbox() {
      const currentItem = galleryItems[currentIndex];
      const img = currentItem.querySelector("img");
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
    }

    // Close lightbox
    closeBtn.addEventListener("click", closeLightbox);

    function closeLightbox() {
      lightbox.style.display = "none";
      document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Previous image
    prevBtn.addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightbox();
    });

    // Next image
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      updateLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (lightbox.style.display === "block") {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          currentIndex =
            (currentIndex - 1 + galleryItems.length) % galleryItems.length;
          updateLightbox();
        } else if (e.key === "ArrowRight") {
          currentIndex = (currentIndex + 1) % galleryItems.length;
          updateLightbox();
        }
      }
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Sidebar işlevselliği
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const body = document.body;

  if (sidebarToggle && sidebar) {
    // Toggle butonu tıklaması
    sidebarToggle.addEventListener("click", () => toggleSidebar(sidebar, body));

    // Mobilde sidebar açıkken kapatma butonu için tıklama olayı
    sidebar.addEventListener("click", function (e) {
      // Kapatma butonuna tıklama (CSS ::before ile eklenen)
      if (
        window.innerWidth <= 992 &&
        sidebar.classList.contains("open") &&
        e.offsetX > sidebar.clientWidth - 60 &&
        e.offsetY < 60
      ) {
        toggleSidebar(sidebar, body);
      }
      // Eski kod (sidebar alanına tıklama)
      if (
        window.innerWidth <= 480 &&
        (e.target === this || e.target.matches(".sidebar.open::before"))
      ) {
        toggleSidebar(sidebar, body);
      }
    });

    // Sidebar dışına tıklandığında kapatma (mobil)
    document.addEventListener("click", function (e) {
      if (
        window.innerWidth <= 480 &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".sidebar-toggle") &&
        sidebar.classList.contains("open")
      ) {
        toggleSidebar(sidebar, body);
      }
    });
  }

  // === SCROLL TO TOP BUTTON ===
  const scrollBtn = document.getElementById("scrollToTopBtn");
  function checkScrollBtn() {
    if (!scrollBtn) return;
    // Masaüstü harici (992px ve altı) ve biraz aşağı inildiyse göster
    if (window.innerWidth <= 992 && window.scrollY > 100) {
      scrollBtn.style.display = "block";
    } else {
      scrollBtn.style.display = "none";
    }
  }
  if (scrollBtn) {
    window.addEventListener("scroll", checkScrollBtn);
    window.addEventListener("resize", checkScrollBtn);
    scrollBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    checkScrollBtn();
  }

  // === MOBİL SABİT SOSYAL İKON ===
  function handleMobileSocialFixed() {
    const el = document.querySelector(".mobile-social-fixed");
    if (!el) return;
    if (window.innerWidth <= 600) {
      el.style.display = "flex";
    } else {
      el.style.display = "none";
    }
  }
  window.addEventListener("resize", handleMobileSocialFixed);
  window.addEventListener("DOMContentLoaded", handleMobileSocialFixed);
  // Eğer sidebar dinamik yüklendiyse, tekrar kontrol et
  if (sidebarContainer) {
    const observer = new MutationObserver(handleMobileSocialFixed);
    observer.observe(sidebarContainer, { childList: true, subtree: true });
  }
});

// Sidebar toggle fonksiyonu
function toggleSidebar(sidebar, body) {
  sidebar.classList.toggle("open");
  if (window.innerWidth <= 480) {
    body.classList.toggle("sidebar-open");
  }
}

// === TELEFON GÖRÜNÜMÜ SIDEBAR DAVRANIŞI ===
// Sadece telefon görünümünde scroll ile sidebar'ı gizle/göster
function handleMobileSidebarScroll() {
  if (window.innerWidth > 992) return; // Sadece telefon görünümünde çalışsın
  
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Sayfa başında ise (50px'e kadar) sidebar'ı göster
  if (currentScrollTop <= 50) {
    document.body.classList.add('at-top');
  } else {
    // Sayfa başında değilse sidebar'ı gizle
    document.body.classList.remove('at-top');
  }
}

// Scroll event listener'ı ekle
window.addEventListener("scroll", handleMobileSidebarScroll);

// Sayfa yüklendiğinde kontrol et
document.addEventListener("DOMContentLoaded", function() {
  // Sayfa başında ise sidebar'ı göster
  if (window.pageYOffset <= 50) {
    document.body.classList.add('at-top');
  }
  
  // Scroll event'ini başlat
  handleMobileSidebarScroll();
});
