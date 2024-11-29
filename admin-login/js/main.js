const sidebar = document.querySelector(".sidebar");
const openNavBtn = document.querySelector("#open_nav-btn");
const closeNavBtn = document.querySelector("#close_nav-btn");
const logoutBtn = document.querySelector("#logoutBtn");

// Open sidebar
const openNav = () => {
  sidebar.classList.add("visible"); // Tambahkan class "visible" untuk menampilkan sidebar
  openNavBtn.style.display = "none"; // Sembunyikan tombol open
  closeNavBtn.style.display = "inline-block"; // Tampilkan tombol close
};

// Close sidebar
const closeNav = () => {
  sidebar.classList.remove("visible"); // Hapus class "visible" untuk menyembunyikan sidebar
  openNavBtn.style.display = "inline-block"; // Tampilkan tombol open
  closeNavBtn.style.display = "none"; // Sembunyikan tombol close
};

// Add event listeners
openNavBtn.addEventListener("click", openNav);
closeNavBtn.addEventListener("click", closeNav);

function handleLogout() {
  if (authService && typeof authService.logout === "function") {
    authService.logout();
  } else {
    console.error("AuthService not found");
  }
}
