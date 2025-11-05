document.getElementById("formCotizacion").addEventListener("submit", function (e) {
  e.preventDefault();

  // Capturar datos
  const servicio = document.getElementById("modalTitulo").textContent.trim().toLowerCase();
  const tamano = document.getElementById("tamano").value;
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;

  // Precios base
  const precios = {
    "limpieza de muebles": 70000,
    "limpieza de alfombras": 60000,
    "limpieza de tapetes decorativos": 60000,
    "lavado de colchones": 60000,
    "lavado de vehículos y cojinería": 70000,
    "lavado de cortinas": 20000,
    "limpieza de sillas de comedor": 7000,
    "mantenimiento y pulido de pisos": 100000
  };

  function calcularPrecio(servicio, tamano, cantidad = 1) {
    let precioBase = precios[servicio] || 0;
    let precioFinal = precioBase;

    if (tamano === "Mediano") {
      precioFinal += 30000;
    } else if (tamano === "Grande") {
      precioFinal += 60000;
    }

    precioFinal *= cantidad;

    // Si es sillas de comedor, el cálculo depende de la cantidad
    if (servicio === "limpieza de sillas de comedor") {
      precioFinal *= cantidad;
    }

    return precioFinal;
  }

  const total = calcularPrecio(servicio, tamano, cantidad);

  // Mostrar resultados
  document.getElementById("resServicio").innerText = servicio;
  document.getElementById("resTamano").innerText = tamano;
  document.getElementById("resCantidad").innerText = cantidad;
  document.getElementById("resPrecio").innerText = total.toLocaleString("es-CO");

  abrirModal2();
});

function abrirModal2() {
  document.getElementById("modal2").style.display = "flex";
}

function cerrarModal2() {
  document.getElementById("modal2").style.display = "none";
}

window.onclick = function (e) {
  const modal = document.getElementById("modal2");
  if (e.target === modal) {
    modal.style.display = "none";
  }
};
