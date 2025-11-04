// Esperar a que cargue todo el DOM
document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".btn-cotizar");
  const modal = document.getElementById("modalCotizar");
  const modalTitulo = document.getElementById("modalTitulo");
  const modalImg = document.getElementById("modalImg");

  // Abrir modal dinámicamente
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      const titulo = btn.getAttribute("data-titulo");
      const img = btn.getAttribute("data-img");

      modalTitulo.textContent = titulo;
      modalImg.src = img;
      modal.style.display = "flex";
    });
  });
});

// Cerrar modal
function cerrarModal() {
  document.getElementById("modalCotizar").style.display = "none";
}

// Cerrar si se hace clic fuera del contenido
window.onclick = function(e) {
  const modal = document.getElementById("modalCotizar");
  if (e.target === modal) {
    modal.style.display = "none";
  }
};
