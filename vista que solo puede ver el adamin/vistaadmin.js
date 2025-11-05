// Datos simulados
const usuarios = [
  { id: "001", username: "Carlos105", name: "Carlos Montenegro", email: "Carlos8767@gmail.com", role: "cliente" },
  { id: "002", username: "Saniago20Ollo", name: "Santiago Criollo", email: "Santiago3456@gmail.com", role: "cliente" },
];

const empleados = [
  { id: "E01", username: "Sofia505", name: "Sofia Lopez", email: "Sofia0987@foamwash.com", role: "empleado" },
  { id: "E02", username: "JuanPerez", name: "Juan Pérez", email: "juan@foamwash.com", role: "empleado" },
];

// Variables
const userList = document.getElementById("userList");
const titulo = document.getElementById("titulo");
const usuariosTab = document.getElementById("usuariosTab");
const empleadosTab = document.getElementById("empleadosTab");
const modal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const cancelEdit = document.getElementById("cancelEdit");

let modoActual = "usuarios";

// Renderizado
function renderData() {
  userList.innerHTML = "";
  const data = modoActual === "usuarios" ? usuarios : empleados;
  data.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <div class="user-info">
        <span><b>ID:</b> ${item.id}</span>
        <span><b>Usuario:</b> ${item.username}</span>
        <span><b>Nombre:</b> ${item.name}</span>
        <span><b>Correo:</b> ${item.email}</span>
        <span><b>Rol:</b> ${item.role}</span>
      </div>
      <div class="user-actions">
        <button class="edit" onclick="editUser(${index})"><i class='fas fa-edit'></i> Editar</button>
        <button class="delete" onclick="deleteUser(${index})"><i class='fas fa-trash'></i> Eliminar</button>
      </div>
    `;
    userList.appendChild(card);
  });
}

// Editar
function editUser(index) {
  const data = modoActual === "usuarios" ? usuarios : empleados;
  const item = data[index];
  document.getElementById("editId").value = item.id;
  document.getElementById("editUsername").value = item.username;
  document.getElementById("editName").value = item.name;
  document.getElementById("editEmail").value = item.email;
  document.getElementById("editRole").value = item.role;
  modal.style.display = "flex";

  editForm.onsubmit = (e) => {
    e.preventDefault();
    item.username = document.getElementById("editUsername").value;
    item.name = document.getElementById("editName").value;
    item.email = document.getElementById("editEmail").value;
    item.role = document.getElementById("editRole").value;
    modal.style.display = "none";
    renderData();
  };
}

// Eliminar
function deleteUser(index) {
  if (confirm("¿Seguro que deseas eliminar este registro?")) {
    const data = modoActual === "usuarios" ? usuarios : empleados;
    data.splice(index, 1);
    renderData();
  }
}

// Cambiar pestañas
usuariosTab.onclick = () => {
  modoActual = "usuarios";
  usuariosTab.classList.add("active");
  empleadosTab.classList.remove("active");
  titulo.textContent = "Usuarios Registrados";
  renderData();
};

empleadosTab.onclick = () => {
  modoActual = "empleados";
  empleadosTab.classList.add("active");
  usuariosTab.classList.remove("active");
  titulo.textContent = "Empleados Registrados";
  renderData();
};

// Cerrar modal
cancelEdit.onclick = () => (modal.style.display = "none");

// Inicializar
renderData();


