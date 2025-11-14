 // =================================================================
        // DATOS SIMULADOS
        // =================================================================
        
        let tareas = [];
        let tareasFiltradas = [];

        // Función para generar tareas simuladas a partir de pedidos
        function generarTareasSimuladas() {
            const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
            const trabajadorEmail = session.email;
            
            // Convertir pedidos en tareas
            const tareasGeneradas = pedidos.map((pedido, index) => {
                // Asignar estado basado en la fecha
                let estado = 'pendiente';
                const fechaPedido = new Date(pedido.fecha);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                
                if (fechaPedido < hoy) {
                    estado = 'completada';
                } else if (fechaPedido.getTime() === hoy.getTime()) {
                    estado = Math.random() > 0.5 ? 'en-progreso' : 'pendiente';
                }
                
                return {
                    id: pedido.id,
                    titulo: `Servicio - ${pedido.servicios[0].nombre}`,
                    cliente: `Cliente #${index + 1}`,
                    direccion: pedido.direccion,
                    ciudad: pedido.ciudad,
                    telefono: pedido.telefono,
                    fecha: pedido.fecha,
                    hora: pedido.hora,
                    servicios: pedido.servicios,
                    observaciones: pedido.observaciones || 'Sin observaciones',
                    total: pedido.total,
                    estado: estado,
                    trabajadorAsignado: trabajadorEmail,
                    prioridad: Math.random() > 0.7 ? 'alta' : 'normal'
                };
            });
            
            // Si no hay pedidos, generar tareas de ejemplo
            if (tareasGeneradas.length === 0) {
                const hoy = new Date();
                const manana = new Date(hoy);
                manana.setDate(manana.getDate() + 1);
                
                tareasGeneradas.push(
                    {
                        id: 'TAREA-001',
                        titulo: 'Lavado de Muebles - Casa Residencial',
                        cliente: 'María González',
                        direccion: 'Calle 123 #45-67, Apto 501',
                        ciudad: 'Bogotá',
                        telefono: '3001234567',
                        fecha: hoy.toISOString().split('T')[0],
                        hora: '09:00',
                        servicios: [
                            {
                                nombre: 'Lavado de muebles',
                                cantidad: 1,
                                tamano: 'Grande',
                                tipoLavado: 'Profundo',
                                precio: 90000
                            }
                        ],
                        observaciones: 'Oficina cerrada. Coordinar ingreso con recepción',
                        total: 150000,
                        estado: 'pendiente',
                        trabajadorAsignado: trabajadorEmail,
                        prioridad: 'alta'
                    }
                );
            }
            
            return tareasGeneradas;
        }

        // =================================================================
        // FUNCIONES DE CARGA Y RENDERIZADO
        // =================================================================
        
        function cargarTareas() {
            tareas = generarTareasSimuladas();
            tareasFiltradas = [...tareas];
            actualizarEstadisticas();
            renderizarTareas();
            mostrarNotificacion('Tareas actualizadas correctamente', 'success');
        }

        function actualizarEstadisticas() {
            const total = tareas.length;
            const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
            const enProgreso = tareas.filter(t => t.estado === 'en-progreso').length;
            
            // Completadas hoy
            const hoy = new Date().toISOString().split('T')[0];
            const completadasHoy = tareas.filter(t => 
                t.estado === 'completada' && t.fecha === hoy
            ).length;
            
            document.getElementById('statTotal').textContent = total;
            document.getElementById('statPendientes').textContent = pendientes;
            document.getElementById('statEnProgreso').textContent = enProgreso;
            document.getElementById('statCompletadas').textContent = completadasHoy;
        }

        function renderizarTareas() {
            const grid = document.getElementById('tasksGrid');
            const count = document.getElementById('tasksCount');
            
            count.textContent = `${tareasFiltradas.length} tarea${tareasFiltradas.length !== 1 ? 's' : ''}`;
            
            if (tareasFiltradas.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <div class="empty-state-text">No hay tareas que mostrar</div>
                    </div>
                `;
                return;
            }
            
            grid.innerHTML = tareasFiltradas.map(tarea => {
                const estadoClass = tarea.estado.replace(' ', '-');
                const estadoTexto = tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1);
                
                return `
                    <div class="task-card ${estadoClass}">
                        <div class="task-header">
                            <div>
                                <div class="task-title">${tarea.titulo}</div>
                                <div class="task-id">${tarea.id}</div>
                            </div>
                            <div class="task-status ${estadoClass}">
                                ${estadoTexto}
                            </div>
                        </div>
                        
                        <div class="task-body">
                            <div class="task-info-row">
                                <span class="task-icon">👤</span>
                                <strong>Cliente:</strong>
                                ${tarea.cliente}
                            </div>
                            <div class="task-info-row">
                                <span class="task-icon">📍</span>
                                <strong>Dirección:</strong>
                                ${tarea.direccion}, ${tarea.ciudad}
                            </div>
                            <div class="task-info-row">
                                <span class="task-icon">📞</span>
                                <strong>Teléfono:</strong>
                                ${tarea.telefono}
                            </div>
                            <div class="task-info-row">
                                <span class="task-icon">📅</span>
                                <strong>Fecha/Hora:</strong>
                                ${formatearFecha(tarea.fecha)} - ${tarea.hora}
                            </div>
                            <div class="task-info-row">
                                <span class="task-icon">💰</span>
                                <strong>Valor Total:</strong>
                                ${tarea.total.toLocaleString('es-CO')}
                            </div>
                            
                            <div class="task-servicios">
                                <strong>📦 Servicios:</strong>
                                ${tarea.servicios.map(s => `
                                    <div class="servicio-item">
                                        <div>
                                            <div class="servicio-nombre">${s.nombre}</div>
                                            <div class="servicio-detalles">
                                                ${s.cantidad}x - ${s.tamano || 'N/A'} - ${s.tipoLavado || 'N/A'}
                                            </div>
                                        </div>
                                        <div class="servicio-nombre">
                                            ${(s.precio * s.cantidad).toLocaleString('es-CO')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="task-footer">
                            ${tarea.estado === 'pendiente' ? `
                                <button class="btn-task btn-iniciar" onclick="cambiarEstado('${tarea.id}', 'en-progreso')">
                                    ▶️ Iniciar Tarea
                                </button>
                            ` : ''}
                            
                            ${tarea.estado === 'en-progreso' ? `
                                <button class="btn-task btn-completar" onclick="cambiarEstado('${tarea.id}', 'completada')">
                                    ✅ Completar
                                </button>
                            ` : ''}
                            
                            <button class="btn-task btn-ver-detalles" onclick="verDetalles('${tarea.id}')">
                                👁️ Ver Detalles
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // =================================================================
        // FUNCIONES DE ACCIONES
        // =================================================================
        
        function cambiarEstado(tareaId, nuevoEstado) {
            const tarea = tareas.find(t => t.id === tareaId);
            if (!tarea) return;
            
            const estadoAnterior = tarea.estado;
            tarea.estado = nuevoEstado;
            
            // Actualizar en localStorage si la tarea vino de un pedido
            const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
            const pedidoIndex = pedidos.findIndex(p => p.id === tareaId);
            
            if (pedidoIndex !== -1) {
                pedidos[pedidoIndex].estado = nuevoEstado;
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
            }
            
            // Actualizar UI
            filtrarTareas();
            actualizarEstadisticas();
            
            // Mostrar notificación
            const mensajes = {
                'en-progreso': '⏳ Tarea iniciada correctamente',
                'completada': '✅ ¡Tarea completada! Excelente trabajo'
            };
            
            mostrarNotificacion(mensajes[nuevoEstado] || 'Estado actualizado', 'success');
            
            console.log(`Tarea ${tareaId}: ${estadoAnterior} → ${nuevoEstado}`);
        }

        function verDetalles(tareaId) {
            const tarea = tareas.find(t => t.id === tareaId);
            if (!tarea) return;
            
            const modal = document.getElementById('modalDetalles');
            const modalBody = document.getElementById('modalBody');
            
            modalBody.innerHTML = `
                <div class="detalle-item">
                    <div class="detalle-label">🆔 ID de Tarea</div>
                    <div class="detalle-value">${tarea.id}</div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📋 Título</div>
                    <div class="detalle-value">${tarea.titulo}</div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">👤 Cliente</div>
                    <div class="detalle-value">${tarea.cliente}</div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📍 Dirección Completa</div>
                    <div class="detalle-value">${tarea.direccion}<br>${tarea.ciudad}</div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📞 Teléfono de Contacto</div>
                    <div class="detalle-value">
                        ${tarea.telefono}
                        <br>
                        <a href="tel:${tarea.telefono}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                            📱 Llamar ahora
                        </a>
                    </div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📅 Fecha y Hora Programada</div>
                    <div class="detalle-value">${formatearFechaCompleta(tarea.fecha)} a las ${tarea.hora}</div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📦 Servicios Solicitados</div>
                    <div class="detalle-value">
                        ${tarea.servicios.map(s => `
                            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 8px;">
                                <strong>${s.nombre}</strong><br>
                                • Cantidad: ${s.cantidad}<br>
                                • Tamaño: ${s.tamano || 'N/A'}<br>
                                • Tipo: ${s.tipoLavado || 'N/A'}<br>
                                • Precio: ${(s.precio * s.cantidad).toLocaleString('es-CO')}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📝 Observaciones del Cliente</div>
                    <div class="detalle-value">${tarea.observaciones}</div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">💰 Valor Total</div>
                    <div class="detalle-value" style="font-size: 24px; font-weight: 900; color: #667eea;">
                        ${tarea.total.toLocaleString('es-CO')}
                    </div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">📊 Estado Actual</div>
                    <div class="detalle-value">
                        <span class="task-status ${tarea.estado.replace(' ', '-')}" style="display: inline-block;">
                            ${tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                        </span>
                    </div>
                </div>
                
                <div class="detalle-item">
                    <div class="detalle-label">🎯 Prioridad</div>
                    <div class="detalle-value">
                        ${tarea.prioridad === 'alta' ? '🔴 Alta' : '🟢 Normal'}
                    </div>
                </div>
            `;
            
            modal.classList.add('show');
        }

        function cerrarModal() {
            document.getElementById('modalDetalles').classList.remove('show');
        }

        // =================================================================
        // FUNCIONES DE FILTRADO
        // =================================================================
        
        function filtrarTareas() {
            const filterEstado = document.getElementById('filterEstado').value;
            const filterFecha = document.getElementById('filterFecha').value;
            
            tareasFiltradas = tareas.filter(tarea => {
                // Filtro por estado
                let cumpleEstado = filterEstado === 'todos' || tarea.estado === filterEstado;
                
                // Filtro por fecha
                let cumpleFecha = true;
                if (filterFecha !== 'todos') {
                    const fechaTarea = new Date(tarea.fecha);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    
                    if (filterFecha === 'hoy') {
                        cumpleFecha = fechaTarea.toDateString() === hoy.toDateString();
                    } else if (filterFecha === 'manana') {
                        const manana = new Date(hoy);
                        manana.setDate(manana.getDate() + 1);
                        cumpleFecha = fechaTarea.toDateString() === manana.toDateString();
                    } else if (filterFecha === 'semana') {
                        const finSemana = new Date(hoy);
                        finSemana.setDate(finSemana.getDate() + 7);
                        cumpleFecha = fechaTarea >= hoy && fechaTarea <= finSemana;
                    }
                }
                
                return cumpleEstado && cumpleFecha;
            });
            
            renderizarTareas();
        }

        // =================================================================
        // FUNCIONES AUXILIARES
        // =================================================================
        
        function formatearFecha(fecha) {
            const date = new Date(fecha + 'T00:00:00');
            return date.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        function formatearFechaCompleta(fecha) {
            const date = new Date(fecha + 'T00:00:00');
            return date.toLocaleDateString('es-CO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        function mostrarNotificacion(mensaje, tipo = 'info') {
            const container = document.getElementById('notificacionContainer');
            
            const notificacion = document.createElement('div');
            notificacion.className = `notificacion ${tipo}`;
            
            const iconos = {
                'success': '✅',
                'info': 'ℹ️',
                'warning': '⚠️',
                'error': '❌'
            };
            
            notificacion.innerHTML = `
                <span class="notificacion-icono">${iconos[tipo] || iconos['info']}</span>
                <span class="notificacion-mensaje">${mensaje}</span>
            `;
            
            container.appendChild(notificacion);
            
            setTimeout(() => notificacion.classList.add('show'), 10);
            
            setTimeout(() => {
                notificacion.classList.remove('show');
                setTimeout(() => notificacion.remove(), 400);
            }, 4000);
        }

        // =================================================================
        // EVENTOS
        // =================================================================
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modalDetalles');
            if (e.target === modal) {
                cerrarModal();
            }
        });

        // Tecla ESC para cerrar modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cerrarModal();
            }
        });

        // =================================================================
        // INICIALIZACIÓN
        // =================================================================
        
        document.addEventListener('DOMContentLoaded', () => {
            console.log('✅ Panel de tareas inicializado');
            cargarTareas();
            
            // Actualizar automáticamente cada 30 segundos
            setInterval(() => {
                const totalAntes = tareas.length;
                cargarTareas();
                const totalDespues = tareas.length;
                
                if (totalDespues > totalAntes) {
                    mostrarNotificacion(`🔔 ${totalDespues - totalAntes} nueva(s) tarea(s) asignada(s)`, 'info');
                }
            }, 30000);
            
            // Mensaje de bienvenida
            setTimeout(() => {
                mostrarNotificacion(`¡Bienvenido, ${session.email}!`, 'success');
            }, 500);
        });

        console.log('📊 Sistema de tareas cargado correctamente');