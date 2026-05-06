// =============================================================================
// ARCHIVO  : CrudEmpleados.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/CrudEmpleados.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   CRUD completo de empleados: listar, ver detalle, editar y desactivar.
//   Diseño: tarjetas con flip al hacer clic en la foto.
// =============================================================================

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const CrudEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Guarda qué tarjeta está "volteada" por click
    const [flippedId, setFlippedId] = useState(null);

    useEffect(() => {
        api.get('/empleados')
            .then(res => {
                const data = res.data?.data || [];
                setEmpleados(data.map(e => ({
                    id:           e.Id_Usuario,
                    nombre:       e.Nombre    || '—',
                    foto:         e.foto_perfil
                                    ? (e.foto_perfil.startsWith('http') ? e.foto_perfil : `${API_BASE_URL}${e.foto_perfil}`)
                                    : '/img/empleado1.jpg',
                    cargo:        '—',
                    especialidad: '—',
                    descripcion:  '—',
                    experiencia:  '—',
                    telefono:     e.Telefono  || '—',
                    correo:       e.Correo    || '—',
                    estado:       e.estado,
                })));
            })
            .catch(err => console.error('Error cargando empleados:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const [vistaDetalle, setVistaDetalle] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '', foto: '', cargo: '', especialidad: '',
        descripcion: '', experiencia: '', telefono: ''
    });

    const toggleFlip = (id) => {
        setFlippedId(prev => (prev === id ? null : id));
    };

    const verDetalle = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setVistaDetalle(true);
    };

    const volverALista = () => {
        setVistaDetalle(false);
        setEmpleadoSeleccionado(null);
        setFlippedId(null);
    };

    const abrirModal = (empleado = null) => {
        setFormData(empleado || {
            nombre: '', foto: '', cargo: '', especialidad: '',
            descripcion: '', experiencia: '', telefono: ''
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormData({ nombre: '', foto: '', cargo: '', especialidad: '', descripcion: '', experiencia: '', telefono: '' });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const guardarEmpleado = async () => {
        try {
            if (formData.id) {
                await api.put(`/usuarios/${formData.id}`, {
                    Nombre:   formData.nombre,
                    Telefono: formData.telefono,
                });
                setEmpleados(empleados.map(e =>
                    e.id === formData.id ? { ...e, nombre: formData.nombre, telefono: formData.telefono } : e
                ));
            } else {
                const nuevoEmpleado = {
                    id: empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) + 1 : 1,
                    ...formData
                };
                setEmpleados([...empleados, nuevoEmpleado]);
            }
            cerrarModal();
        } catch (err) {
            console.error('Error guardando empleado:', err);
            alert('Error al guardar los cambios');
        }
    };

    const eliminarEmpleado = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
            try {
                await api.delete(`/usuarios/${id}`);
                setEmpleados(empleados.filter(e => e.id !== id));
                if (empleadoSeleccionado?.id === id) volverALista();
            } catch (err) {
                console.error('Error eliminando empleado:', err);
                setEmpleados(empleados.filter(e => e.id !== id));
                if (empleadoSeleccionado?.id === id) volverALista();
            }
        }
    };

    return (
        <div className="crud-container">
            <div className="crud-content">
                <h2 className="crud-title">Empleados</h2>

                {isLoading ? (
                    <p style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 15 }}>
                        ⏳ Cargando empleados...
                    </p>
                ) : !vistaDetalle ? (
                    <>
                        <button className="btn-agregar" onClick={() => abrirModal()}>
                            ➕ Agregar Empleado
                        </button>

                        <p className="crud-subtitle">
                            {empleados.length} colaborador{empleados.length !== 1 ? 'es' : ''} activo{empleados.length !== 1 ? 's' : ''} · Haz clic en la tarjeta para ver más
                        </p>

                        {/* Grid de tarjetas con flip */}
                        <div className="empleados-grid">
                            {empleados.map((empleado) => (
                                <div
                                    key={empleado.id}
                                    className={`empleado-flip-wrapper${flippedId === empleado.id ? ' flipped' : ''}`}
                                    onClick={() => toggleFlip(empleado.id)}
                                >
                                    <div className="empleado-card">

                                        {/* ── CARA FRONTAL ── */}
                                        <div className="empleado-front">
                                            <div className="empleado-foto-container">
                                                <img
                                                    src={empleado.foto}
                                                    alt={empleado.nombre}
                                                    className="empleado-foto"
                                                    onError={(e) => { e.target.src = '/img/ima9.jpg'; }}
                                                />
                                            </div>
                                            <div className="empleado-front-info">
                                                <p className="empleado-nombre">{empleado.nombre}</p>
                                                <p className="empleado-cargo">{empleado.cargo !== '—' ? empleado.cargo : 'Técnico de Limpieza'}</p>
                                                <p className="flip-hint">Clic para ver info →</p>
                                            </div>
                                        </div>

                                        {/* ── CARA TRASERA ── */}
                                        <div className="empleado-back" onClick={(e) => e.stopPropagation()}>
                                            <div>
                                                <p className="empleado-back-nombre">{empleado.nombre}</p>
                                                <p className="empleado-back-descripcion">
                                                    {empleado.descripcion !== '—' ? empleado.descripcion : 'Sin descripción disponible.'}
                                                </p>
                                            </div>

                                            <div className="empleado-back-datos">
                                                <div className="empleado-back-dato">
                                                    <span>📞</span>
                                                    <span>{empleado.telefono}</span>
                                                </div>
                                                <div className="empleado-back-dato">
                                                    <span>✉️</span>
                                                    <span>{empleado.correo}</span>
                                                </div>
                                                {empleado.experiencia !== '—' && (
                                                    <div className="empleado-back-dato">
                                                        <span>⭐</span>
                                                        <span>{empleado.experiencia}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="empleado-back-acciones">
                                                <button
                                                    className="btn-editar-back"
                                                    onClick={(e) => { e.stopPropagation(); abrirModal(empleado); }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn-eliminar-back"
                                                    onClick={(e) => { e.stopPropagation(); eliminarEmpleado(empleado.id); }}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Vista de detalle */
                    <div className="detalle-empleado">
                        <button className="btn-volver" onClick={volverALista}>
                            ← Volver a la lista
                        </button>
                        <div className="detalle-container">
                            <div className="detalle-foto-grande">
                                <img
                                    src={empleadoSeleccionado.foto}
                                    alt={empleadoSeleccionado.nombre}
                                    onError={(e) => { e.target.src = '/img/ima9.jpg'; }}
                                />
                            </div>
                            <div className="detalle-info-card">
                                <div className="detalle-info-contenido">
                                    <p className="detalle-descripcion">{empleadoSeleccionado.descripcion}</p>
                                    <div className="detalle-datos">
                                        <div className="dato-item">
                                            <span className="dato-label">👤 Nombre</span>
                                            <span className="dato-valor">{empleadoSeleccionado.nombre}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">💼 Cargo</span>
                                            <span className="dato-valor">{empleadoSeleccionado.cargo}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">⭐ Especialidad</span>
                                            <span className="dato-valor">{empleadoSeleccionado.especialidad}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📅 Experiencia</span>
                                            <span className="dato-valor">{empleadoSeleccionado.experiencia}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📞 Teléfono</span>
                                            <span className="dato-valor">{empleadoSeleccionado.telefono}</span>
                                        </div>
                                    </div>
                                    <div className="detalle-acciones">
                                        <button className="btn-editar-detalle" onClick={() => abrirModal(empleadoSeleccionado)}>
                                            ✏️ Editar
                                        </button>
                                        <button className="btn-eliminar-detalle" onClick={() => eliminarEmpleado(empleadoSeleccionado.id)}>
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content-empleado" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={cerrarModal}>✕</button>
                        <div className="modal-body-empleado">
                            <h3 className="modal-titulo">
                                {formData.id ? 'Editar Empleado' : 'Nuevo Empleado'}
                            </h3>
                            <div className="form-group-modal">
                                <label>Nombre Completo</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre completo del empleado" />
                            </div>
                            <div className="form-group-modal">
                                <label>URL de Foto</label>
                                <input type="text" name="foto" value={formData.foto} onChange={handleInputChange} placeholder="/img/empleado.jpg" />
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Cargo</label>
                                    <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} placeholder="Ej: Técnico de Limpieza" />
                                </div>
                                <div className="form-group-modal">
                                    <label>Especialidad</label>
                                    <input type="text" name="especialidad" value={formData.especialidad} onChange={handleInputChange} placeholder="Ej: Limpieza profunda" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Experiencia</label>
                                    <input type="text" name="experiencia" value={formData.experiencia} onChange={handleInputChange} placeholder="Ej: 5 años" />
                                </div>
                                <div className="form-group-modal">
                                    <label>Teléfono</label>
                                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="+57 310 123 4567" />
                                </div>
                            </div>
                            <div className="form-group-modal">
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Describe las habilidades y experiencia del empleado..." rows="5" />
                            </div>
                            <div className="modal-botones">
                                <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                                <button className="btn-guardar" onClick={guardarEmpleado}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrudEmpleados;