// Mostrar vista previa de imagen
const inputFoto = document.getElementById('foto');
const previewImg = document.getElementById('preview-img');

inputFoto.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Cambiar texto de rol actual
const selectRol = document.getElementById('rol');
const rolActual = document.getElementById('rol-actual');
const btnGuardar = document.getElementById('guardar');

btnGuardar.addEventListener('click', () => {
  rolActual.textContent = selectRol.value.charAt(0).toUpperCase() + selectRol.value.slice(1);
  alert("Perfil actualizado correctamente 🎉");
});
