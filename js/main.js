//landing page button
const menuButton = document.getElementById("menu-button");
const closeButton = document.getElementById("close-button");
const mobileMenu = document.getElementById("mobile-menu");

menuButton.addEventListener("click", function () {
  mobileMenu.style.display = "block";
  menuButton.style.display = "none";
  closeButton.style.display = "block";
});

closeButton.addEventListener("click", function () {
  mobileMenu.style.display = "none";
  menuButton.style.display = "block";
  closeButton.style.display = "none";
});

// Menambahkan event listener untuk menangani resize window
window.addEventListener("resize", function () {
  // Cek jika lebar layar lebih besar dari 768px (untuk desktop)
  if (window.innerWidth >= 768) {
    mobileMenu.style.display = "none"; // Sembunyikan mobile menu
    menuButton.style.display = "none"; // Sembunyikan tombol menu
    closeButton.style.display = "none"; // Sembunyikan tombol close
  } else {
    // Pastikan tombol menu ditampilkan kembali di mobile view
    menuButton.style.display = "block";
  }
});

//Animasi scrolling dan fade in di landing page
document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll("[data-scroll]");
  const headerHeight = document.querySelector("header").offsetHeight;

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("data-scroll"));
      if (target) {
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Intersection Observer for fade-in effect
  const faders = document.querySelectorAll(".fade-in");
  const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const appearOnScroll = new IntersectionObserver(function (
    entries,
    appearOnScroll
  ) {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) {
        return;
      } else {
        setTimeout(() => {
          entry.target.classList.add("show");
        }, index * 150); // Delay each item by 150ms
        appearOnScroll.unobserve(entry.target);
      }
    });
  },
  appearOptions);

  faders.forEach((fader) => {
    appearOnScroll.observe(fader);
  });
});

// Mendapatkan referensi tombol
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Menampilkan tombol saat menggulir halaman
window.onscroll = function () {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    scrollToTopBtn.style.display = "block"; // Menampilkan tombol
  } else {
    scrollToTopBtn.style.display = "none"; // Menyembunyikan tombol
  }
};

// Fungsi untuk menggulir ke atas halaman saat tombol diklik
scrollToTopBtn.onclick = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
