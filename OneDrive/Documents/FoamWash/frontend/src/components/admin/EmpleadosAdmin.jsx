// =============================================================================
// ARCHIVO  : EmpleadosAdmin.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/EmpleadosAdmin.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// REVISADO : Deimer — Tarea 4 (Ajuste de diseño frontend)
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Vista de empleados para el panel admin con información de productividad.
//   Correcciones: centrado del grid, animaciones de entrada, contraste visual,
//   avatares con iniciales como fallback, badges de cargo.
// =============================================================================

import React, { useState, useEffect } from 'react';
import './estilos_admin/CrudEmpleados.css';
import api from '../../services/api';

const CrudEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/empleados')
            .then(res => {
                const data = res.data?.data || [];
                setEmpleados(data.map(e => ({
                    id:           e.Id_Usuario    || e.id,
                    nombre:       e.Nombre        || e.nombre        || '',
                    foto:         e.foto_perfil   ? 'http://localhost:5000' + e.foto_perfil : null,
                    cargo:        e.cargo         || '—',
                    especialidad: e.especialidades|| '—',
                    descripcion:  e.descripcion   || '',
                    experiencia:  e.fecha_ingreso  || '—',
                    telefono:     e.Telefono       || e.telefono || '—',
                })));
            })
            .catch(err => console.error('Error cargando empleados:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [vistaDetalle, setVistaDetalle]                 = useState(false);
    const [modalAbierto, setModalAbierto]                 = useState(false);
    const [formData, setFormData] = useState({
        nombre: '', foto: '', cargo: '', especialidad: '',
        descripcion: '', experiencia: '', telefono: '',
    });

    /* ── helpers ─────────────────────────────────────────────── */
    const getInitials = (nombre = '') =>
        nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

    /* ── handlers ────────────────────────────────────────────── */
    const verDetalle = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setVistaDetalle(true);
    };

    const volverALista = () => {
        setVistaDetalle(false);
        setEmpleadoSeleccionado(null);
    };

    const abrirModal = (empleado = null) => {
        setFormData(empleado ?? {
            nombre: '', foto: '', cargo: '', especialidad: '',
            descripcion: '', experiencia: '', telefono: '',
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormData({ nombre: '', foto: '', cargo: '', especialidad: '', descripcion: '', experiencia: '', telefono: '' });
    };

    const handleInputChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const guardarEmpleado = async () => {
        try {
            const payload = {
                Nombre:         formData.nombre,
                Telefono:       formData.telefono,
                cargo:          formData.cargo,
                especialidades: formData.especialidad,
                descripcion:    formData.descripcion,
            };
            if (formData.id) {
                await api.put('/empleados/' + formData.id, payload);
                setEmpleados(empleados.map(e =>
                    e.id === formData.id ? { ...e, ...formData } : e
                ));
            }
        } catch (err) {
            console.error('Error guardando empleado:', err);
        } finally {
            cerrarModal();
        }
    };

    const eliminarEmpleado = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;
        try {
            await api.put('/usuarios/' + id + '/estado', { estado: 'inactivo' });
        } catch (err) {
            console.error('Error:', err);
        }
        setEmpleados(empleados.filter(e => e.id !== id));
        if (empleadoSeleccionado?.id === id) volverALista();
    };

    /* ── sub-componente: avatar con fallback de iniciales ──────── */
    const Avatar = ({ foto, nombre, className }) => {
        const [imgError, setImgError] = useState(false);
        if (foto && !imgError) {
            return (
                <img
                    src={foto}
                    alt={nombre}
                    className={className}
                    onError={() => setImgError(true)}
                />
            );
        }
        return (
            <div className={`${className} avatar-initials`}>
                {getInitials(nombre)}
            </div>
        );
    };

    /* ── render ──────────────────────────────────────────────── */
    return (
        <div className="crud-container">

            <div className="crud-content">
                <h2 className="crud-title">Empleados</h2>
                {!isLoading && (
                    <p className="crud-subtitle">
                        {empleados.length} colaborador{empleados.length !== 1 ? 'es' : ''} activo{empleados.length !== 1 ? 's' : ''}
                    </p>
                )}

                {!vistaDetalle ? (
                    <>
                        <button className="btn-agregar" onClick={() => abrirModal()}>
                            + Agregar Empleado
                        </button>

                        {isLoading ? (
                            <div className="loading-grid">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="empleado-card skeleton" />
                                ))}
                            </div>
                        ) : (
                            <div className="empleados-grid">
                                {empleados.map((empleado, idx) => (
                                    <div
                                        key={empleado.id}
                                        className="empleado-card"
                                        style={{ animationDelay: `${idx * 0.07}s` }}
                                    >
                                        <div
                                            className="empleado-foto-container"
                                            onClick={() => verDetalle(empleado)}
                                        >
                                            <Avatar
                                                foto={empleado.foto}
                                                nombre={empleado.nombre}
                                                className="empleado-foto"
                                            />
                                            <span className="cargo-badge">{empleado.cargo}</span>
                                        </div>

                                        <div className="empleado-info">
                                            <h3 className="empleado-nombre">{empleado.nombre}</h3>
                                            <p className="empleado-especialidad">{empleado.especialidad}</p>
                                        </div>

                                        <div className="empleado-acciones">
                                            <button
                                                className="btn-editar"
                                                onClick={() => abrirModal(empleado)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-eliminar"
                                                onClick={() => eliminarEmpleado(empleado.id)}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* ── Vista detalle ── */
                    <div className="detalle-empleado">
                        <button className="btn-volver" onClick={volverALista}>
                            ← Volver a la lista
                        </button>

                        <div className="detalle-container">
                            <div className="detalle-banner">
                                <Avatar
                                    foto={empleadoSeleccionado.foto}
                                    nombre={empleadoSeleccionado.nombre}
                                    className="detalle-avatar"
                                />
                            </div>

                            <div className="detalle-info-card">
                                <div className="detalle-info-contenido">
                                    <h3 className="detalle-nombre">{empleadoSeleccionado.nombre}</h3>
                                    <span className="detalle-cargo-badge">{empleadoSeleccionado.cargo}</span>

                                    {empleadoSeleccionado.descripcion && (
                                        <p className="detalle-descripcion">
                                            {empleadoSeleccionado.descripcion}
                                        </p>
                                    )}

                                    <div className="detalle-datos">
                                        <div className="dato-item">
                                            <span className="dato-label">Especialidad</span>
                                            <span className="dato-valor">{empleadoSeleccionado.especialidad}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">Experiencia</span>
                                            <span className="dato-valor">{empleadoSeleccionado.experiencia}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">Teléfono</span>
                                            <span className="dato-valor">{empleadoSeleccionado.telefono}</span>
                                        </div>
                                    </div>

                                    <div className="detalle-acciones">
                                        <button
                                            className="btn-editar-detalle"
                                            onClick={() => abrirModal(empleadoSeleccionado)}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn-eliminar-detalle"
                                            onClick={() => eliminarEmpleado(empleadoSeleccionado.id)}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal de edición ── */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content-empleado" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={cerrarModal}>✕</button>

                        <div className="modal-body-empleado">
                            <h3 className="modal-titulo">
                                {formData.id ? 'Editar Empleado' : 'Nuevo Empleado'}
                            </h3>

                            <div className="form-group-modal">
                                <label>Nombre Completo</label>
                                <input
                                    type="text" name="nombre" value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Nombre completo del empleado"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Cargo</label>
                                    <input
                                        type="text" name="cargo" value={formData.cargo}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Técnico de Limpieza"
                                    />
                                </div>
                                <div className="form-group-modal">
                                    <label>Especialidad</label>
                                    <input
                                        type="text" name="especialidad" value={formData.especialidad}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Limpieza profunda"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Experiencia</label>
                                    <input
                                        type="text" name="experiencia" value={formData.experiencia}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 5 años"
                                    />
                                </div>
                                <div className="form-group-modal">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel" name="telefono" value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+57 310 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="form-group-modal">
                                <label>Descripción</label>
                                <textarea
                                    name="descripcion" value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Describe las habilidades y experiencia del empleado..."
                                    rows="4"
                                />
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