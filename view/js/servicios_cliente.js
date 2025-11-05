// DATOS DE SERVICIOS
        const SERVICIOS = [
            {
                id: 1,
                nombre: "Lavado de muebles",
                precio: 90000,
                imagen: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop",
                duracion: "2-3 horas",
                tamanos: ["Pequeño", "Mediano", "Grande"],
                tiposLavado: ["Básico", "Profundo", "Premium"]
            },
            {
                id: 2,
                nombre: "Lavado de alfombras",
                precio: 50000,
                imagen: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=500&h=300&fit=crop",
                duracion: "1-2 horas",
                tamanos: ["Pequeña", "Mediana", "Grande"],
                tiposLavado: ["Básico", "Profundo", "Premium"]
            },
            {
                id: 3,
                nombre: "Tapicería de carros",
                precio: 140000,
                imagen: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&h=300&fit=crop",
                duracion: "3-4 horas",
                tamanos: ["Sedan", "SUV", "Camioneta"],
                tiposLavado: ["Básico", "Completo", "Premium"]
            },
            {
                id: 4,
                nombre: "Lavado de cortinas",
                precio: 80000,
                imagen: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&h=300&fit=crop",
                duracion: "2 horas",
                tamanos: ["Por metro", "Juego completo"],
                tiposLavado: ["Básico", "Con planchado"]
            },
            {
                id: 5,
                nombre: "Lavado de colchones",
                precio: 90000,
                imagen: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500&h=300&fit=crop",
                duracion: "2-3 horas",
                tamanos: ["Sencillo", "Semi-doble", "Doble", "Queen", "King"],
                tiposLavado: ["Básico", "Profundo", "Sanitización"]
            },
            {
                id: 6,
                nombre: "Desinfección y sanitización",
                precio: 150000,
                imagen: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&h=300&fit=crop",
                duracion: "1-2 horas",
                tamanos: ["Pequeño (hasta 50m²)", "Mediano (50-100m²)", "Grande (más de 100m²)"],
                tiposLavado: ["Básica", "Profunda", "Completa"]
            }
        ];

        let carrito = [];

        function agregarAlCarrito(servicioId) {
            const servicio = SERVICIOS.find(s => s.id === servicioId);
            if (!servicio) return;
            
            const servicioExistente = carrito.find(item => item.id === servicioId);
            
            if (servicioExistente) {
                servicioExistente.cantidad++;
            } else {
                carrito.push({
                    ...servicio,
                    cantidad: 1,
                    tamano: '',
                    tipoLavado: ''
                });
            }
            
            actualizarCarrito();
            mostrarNotificacion(`${servicio.nombre} agregado al carrito`);
        }

        function eliminarDelCarrito(servicioId) {
            carrito = carrito.filter(item => item.id !== servicioId);
            actualizarCarrito();
            mostrarNotificacion('Servicio eliminado del carrito');
        }

        function actualizarCantidad(servicioId, nuevaCantidad) {
            const item = carrito.find(item => item.id === servicioId);
            
            if (item && nuevaCantidad > 0) {
                item.cantidad = nuevaCantidad;
                actualizarCarrito();
            } else if (nuevaCantidad <= 0) {
                eliminarDelCarrito(servicioId);
            }
        }

        function calcularTotal() {
            return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        }

        function actualizarCarrito() {
            const badge = document.getElementById('carritoBadge');
            const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'flex' : 'none';
            }
            
            actualizarModalCarrito();
        }

        function actualizarModalCarrito() {
            const carritoItems = document.getElementById('carritoItems');
            const carritoTotal = document.getElementById('carritoTotal');
            
            if (!carritoItems) return;
            
            if (carrito.length === 0) {
                carritoItems.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
                if (carritoTotal) carritoTotal.textContent = '$0';
                return;
            }
            
            carritoItems.innerHTML = carrito.map(item => `
                <div class="carrito-item">
                    <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
                    <div class="carrito-item-info">
                        <h4>${item.nombre}</h4>
                        <p class="carrito-item-duracion">⏱️ ${item.duracion}</p>
                        <p class="carrito-item-precio">${item.precio.toLocaleString('es-CO')}</p>
                    </div>
                    <div class="carrito-item-actions">
                        <div class="cantidad-control">
                            <button onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                            <span>${item.cantidad}</span>
                            <button onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                        </div>
                        <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
            
            if (carritoTotal) {
                carritoTotal.textContent = `${calcularTotal().toLocaleString('es-CO')}`;
            }
        }

        function abrirModalCarrito() {
            document.getElementById('modalCarrito').classList.add('show');
            actualizarModalCarrito();
        }

        function cerrarModalCarrito() {
            document.getElementById('modalCarrito').classList.remove('show');
        }

        function finalizarCompra() {
            if (carrito.length === 0) {
                mostrarNotificacion('El carrito está vacío');
                return;
            }
            
            cerrarModalCarrito();
            abrirModalConfirmacion();
        }

        function abrirModalConfirmacion() {
            const modal = document.getElementById('modalConfirmacion');
            const serviciosConfirmacion = document.getElementById('serviciosConfirmacion');
            
            const fechaInput = document.getElementById('fecha');
            const hoy = new Date();
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            fechaInput.min = manana.toISOString().split('T')[0];
            
            serviciosConfirmacion.innerHTML = carrito.map((item, index) => `
                <div class="servicio-detalle">
                    <h4>${item.nombre}</h4>
                    <img src="${item.imagen}" alt="${item.nombre}" class="servicio-imagen-detalle">
                    
                    <div class="form-group">
                        <label for="tamano-${index}">Tamaño *</label>
                        <select id="tamano-${index}" required onchange="actualizarDetalleServicio(${item.id}, 'tamano', this.value)">
                            <option value="">Seleccionar tamaño</option>
                            ${item.tamanos.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="cantidad-${index}">Cantidad *</label>
                        <input type="number" id="cantidad-${index}" min="1" value="${item.cantidad}" 
                               onchange="actualizarCantidad(${item.id}, parseInt(this.value))" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="tipo-${index}">Tipo de Lavado *</label>
                        <select id="tipo-${index}" required onchange="actualizarDetalleServicio(${item.id}, 'tipoLavado', this.value)">
                            <option value="">Seleccionar tipo</option>
                            ${item.tiposLavado.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `).join('');
            
            actualizarResumenPedido();
            modal.classList.add('show');
        }

        function cerrarModalConfirmacion() {
            const modal = document.getElementById('modalConfirmacion');
            const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
            modal.classList.remove('show');
            mensajeConfirmacion.style.display = 'none';
            document.getElementById('formConfirmacion').reset();
            document.getElementById('serviciosConfirmacion').style.display = 'block';
            document.getElementById('formConfirmacion').style.display = 'flex';
            document.getElementById('modalFooterConfirm').style.display = 'flex';
        }

        function actualizarDetalleServicio(servicioId, campo, valor) {
            const item = carrito.find(i => i.id === servicioId);
            if (item) {
                item[campo] = valor;
                actualizarResumenPedido();
            }
        }

        function actualizarResumenPedido() {
            const resumenPedido = document.getElementById('resumenPedido');
            const totalFinal = document.getElementById('totalFinal');
            
            resumenPedido.innerHTML = carrito.map(item => `
                <div class="resumen-item">
                    <span>${item.nombre} x${item.cantidad}${item.tamano ? ` (${item.tamano})` : ''}${item.tipoLavado ? ` - ${item.tipoLavado}` : ''}</span>
                    <span>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
            `).join('');
            
            totalFinal.textContent = `${calcularTotal().toLocaleString('es-CO')}`;
        }

        function confirmarPedido() {
            const form = document.getElementById('formConfirmacion');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const serviciosSinDetalles = carrito.filter(item => !item.tamano || !item.tipoLavado);
            if (serviciosSinDetalles.length > 0) {
                mostrarNotificacion('Por favor completa los detalles de todos los servicios');
                return;
            }
            
            const pedido = {
                id: `PED-${Date.now()}`,
                servicios: carrito.map(item => ({
                    ...item,
                    tamano: item.tamano,
                    cantidad: item.cantidad,
                    tipoLavado: item.tipoLavado
                })),
                direccion: document.getElementById('direccion').value,
                ciudad: document.getElementById('ciudad').value,
                telefono: document.getElementById('telefono').value,
                fecha: document.getElementById('fecha').value,
                hora: document.getElementById('hora').value,
                observaciones: document.getElementById('observaciones').value,
                total: calcularTotal(),
                estado: 'Pendiente',
                fechaCreacion: new Date().toISOString()
            };
            
            let pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
            pedidos.push(pedido);
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            
            mostrarConfirmacionExitosa(pedido);
        }

        function mostrarConfirmacionExitosa(pedido) {
            const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
            const modalFooter = document.getElementById('modalFooterConfirm');
            
            document.getElementById('serviciosConfirmacion').style.display = 'none';
            document.getElementById('formConfirmacion').style.display = 'none';
            modalFooter.style.display = 'none';
            
            mensajeConfirmacion.innerHTML = `
                <div class="confirmacion-exitosa">
                    <div class="icono-exito">✓</div>
                    <h3>¡Pedido confirmado!</h3>
                    <p>Tu código de pedido es:</p>
                    <p><strong>${pedido.id}</strong></p>
                    <p>📅 Fecha: ${formatearFecha(pedido.fecha)} a las ${pedido.hora}</p>
                    <p>📍 Dirección: ${pedido.direccion}, ${pedido.ciudad}</p>
                    <p>💰 Total: <strong>${pedido.total.toLocaleString('es-CO')}</strong></p>
                    <p style="margin-top: 20px; font-size: 14px; opacity: 0.9;">
                        Recibirás una confirmación por WhatsApp al ${pedido.telefono}
                    </p>
                </div>
            `;
            mensajeConfirmacion.style.display = 'block';
            
            carrito = [];
            actualizarCarrito();
            
            setTimeout(() => {
                cerrarModalConfirmacion();
            }, 5000);
        }

        function formatearFecha(fecha) {
            const date = new Date(fecha + 'T00:00:00');
            return date.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        function configurarBusqueda() {
            const searchInput = document.getElementById('searchInput');
            
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    filtrarServicios(e.target.value);
                });
            }
        }

        function filtrarServicios(termino) {
            const cards = document.querySelectorAll('.service-card');
            const terminoLower = termino.toLowerCase();
            
            cards.forEach(card => {
                const titulo = card.querySelector('.service-title').textContent.toLowerCase();
                const descripcion = card.querySelector('.service-desc').textContent.toLowerCase();
                
                if (titulo.includes(terminoLower) || descripcion.includes(terminoLower)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        function mostrarNotificacion(mensaje) {
            const container = document.getElementById('notificacionContainer');
            
            const notificacion = document.createElement('div');
            notificacion.className = 'notificacion';
            
            notificacion.innerHTML = `
                <span class="notificacion-icono">✓</span>
                <span class="notificacion-mensaje">${mensaje}</span>
            `;
            
            container.appendChild(notificacion);
            setTimeout(() => notificacion.classList.add('show'), 10);
            
            setTimeout(() => {
                notificacion.classList.remove('show');
                setTimeout(() => notificacion.remove(), 400);
            }, 3000);
        }

        function cerrarSesion(e) {
            e.preventDefault();
            if (confirm('¿Deseas cerrar sesión?')) {
                mostrarNotificacion('Sesión cerrada exitosamente');
                setTimeout(() => {
                    console.log('Cerrando sesión...');
                }, 1000);
            }
        }

        window.addEventListener('click', (e) => {
            const modalCarrito = document.getElementById('modalCarrito');
            const modalConfirmacion = document.getElementById('modalConfirmacion');
            
            if (e.target === modalCarrito) {
                cerrarModalCarrito();
            }
            if (e.target === modalConfirmacion) {
                cerrarModalConfirmacion();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            console.log('✅ Sistema de carrito inicializado');
            configurarBusqueda();
            actualizarCarrito();
            
            setTimeout(() => {
                mostrarNotificacion('¡Bienvenido a FoamWash!');
            }, 500);
        });