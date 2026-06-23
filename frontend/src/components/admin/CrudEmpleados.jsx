// =============================================================================
// ARCHIVO  : CrudEmpleados.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/CrudEmpleados.jsx
// AUTOR    : Cristian Andrés Criollo Tovar (Actualizado por Antigravity)
// FECHA    : 09-06-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   CRUD completo de empleados con persistencia en base de datos.
//   Diseño: tarjetas con flip al hacer clic en la foto.
// =============================================================================

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const TIPOS_DOCUMENTO = [
  { id: 1, nombre: 'Cédula de Ciudadanía' },
  { id: 3, nombre: 'Cédula de Extranjería' },
  { id: 4, nombre: 'Pasaporte' },
  { id: 5, nombre: 'NIT' },
  { id: 6, nombre: 'RUT' },
  { id: 7, nombre: 'Registro Civil' },
  { id: 2, nombre: 'Tarjeta de Identidad' },
];

const CrudEmpleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flippedId, setFlippedId] = useState(null);

    const loadEmpleados = () => {
        setIsLoading(true);
        api.get('/empleados')
            .then(res => {
                const data = res.data?.data || [];
                setEmpleados(data.map(e => {
                    const emp = e.empleado?.[0] || {};
                    return {
                        id:           e.Id_Usuario,
                        nombre:       e.Nombre    || '—',
                        foto:         e.foto_perfil
                                        ? (e.foto_perfil.startsWith('http') ? e.foto_perfil : `${API_BASE_URL}${e.foto_perfil}`)
                                        : '/img/empleado1.jpg',
                        cargo:        emp.cargo || '—',
                        especialidad: emp.especialidades || '—',
                        certificaciones: emp.certificaciones || '—',
                        dias_laborales: emp.dias_laborales || '—',
                        horario:      emp.horario || '—',
                        fecha_nacimiento: emp.fecha_nacimiento ? emp.fecha_nacimiento.split('T')[0] : '',
                        fecha_ingreso: emp.fecha_ingreso ? emp.fecha_ingreso.split('T')[0] : '',
                        direccion:    e.Direccion || '—',
                        cedula:       e.N_Documento || '—',
                        tipoDocId:    e.tipo_de_documento?.idTipo_de_Documento || 1,
                        tipoDocNombre: e.tipo_de_documento?.nombre_del_documento || '—',
                        descripcion:  emp.certificaciones || '—',
                        experiencia:  emp.cargo || '—',
                        telefono:     e.Telefono  || '—',
                        correo:       e.Correo    || '—',
                        estado:       e.estado,
                    };
                }));
            })
            .catch(err => console.error('Error cargando empleados:', err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadEmpleados();
    }, []);

    const [vistaDetalle, setVistaDetalle] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: '', foto: '', cargo: '', especialidad: '',
        certificaciones: '', telefono: '', direccion: '', cedula: '', tipoDocId: 1,
        fecha_nacimiento: '', fecha_ingreso: '', dias_laborales: '', horario: '', descripcion: ''
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
        if (empleado) {
            setFormData({
                id: empleado.id,
                nombre: empleado.nombre,
                foto: empleado.foto,
                cargo: empleado.cargo !== '—' ? empleado.cargo : '',
                especialidad: empleado.especialidad !== '—' ? empleado.especialidad : '',
                certificaciones: empleado.certificaciones !== '—' ? empleado.certificaciones : '',
                telefono: empleado.telefono !== '—' ? empleado.telefono : '',
                direccion: empleado.direccion !== '—' ? empleado.direccion : '',
                cedula: empleado.cedula !== '—' ? empleado.cedula : '',
                tipoDocId: empleado.tipoDocId || 1,
                fecha_nacimiento: empleado.fecha_nacimiento || '',
                fecha_ingreso: empleado.fecha_ingreso || '',
                dias_laborales: empleado.dias_laborales !== '—' ? empleado.dias_laborales : '',
                horario: empleado.horario !== '—' ? empleado.horario : '',
                descripcion: empleado.descripcion !== '—' ? empleado.descripcion : ''
            });
        } else {
            setFormData({
                nombre: '', foto: '', cargo: '', especialidad: '',
                certificaciones: '', telefono: '', direccion: '', cedula: '', tipoDocId: 1,
                fecha_nacimiento: '', fecha_ingreso: '', dias_laborales: '', horario: '', descripcion: ''
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const guardarEmpleado = async () => {
        try {
            if (formData.id) {
                await api.put(`/usuarios/${formData.id}`, {
                    Nombre:      formData.nombre,
                    Telefono:    formData.telefono,
                    Direccion:   formData.direccion || null,
                    N_Documento: formData.cedula || null,
                    tipo_de_documento_id_tipo_de_documento: formData.tipoDocId ? Number(formData.tipoDocId) : null,
                    cargo:       formData.cargo || null,
                    fecha_nacimiento: formData.fecha_nacimiento ? formData.fecha_nacimiento : null,
                    fecha_ingreso:    formData.fecha_ingreso ? formData.fecha_ingreso : null,
                    dias_laborales:   formData.dias_laborales || null,
                    horario:          formData.horario || null,
                    especialidades:   formData.especialidad || null,
                    certificaciones:  formData.certificaciones || formData.descripcion || null,
                });
                
                // Si el empleado editado es el seleccionado en el detalle, actualizar detalle
                if (empleadoSeleccionado && empleadoSeleccionado.id === formData.id) {
                    setEmpleadoSeleccionado({
                        ...empleadoSeleccionado,
                        nombre: formData.nombre,
                        telefono: formData.telefono,
                        direccion: formData.direccion || '—',
                        cedula: formData.cedula || '—',
                        tipoDocId: formData.tipoDocId,
                        tipoDocNombre: TIPOS_DOCUMENTO.find(t => t.id === Number(formData.tipoDocId))?.nombre || '—',
                        cargo: formData.cargo || '—',
                        especialidad: formData.especialidad || '—',
                        certificaciones: formData.certificaciones || '—',
                        dias_laborales: formData.dias_laborales || '—',
                        horario: formData.horario || '—',
                        fecha_nacimiento: formData.fecha_nacimiento || '',
                        fecha_ingreso: formData.fecha_ingreso || '',
                        descripcion: formData.certificaciones || '—',
                    });
                }
                
                loadEmpleados();
            } else {
                alert('La creación de nuevos usuarios debe realizarse desde el proceso de registro para asignación correcta de credenciales.');
            }
            cerrarModal();
        } catch (err) {
            console.error('Error guardando empleado:', err);
            alert('Error al guardar los cambios: ' + (err.response?.data?.error?.message || err.message));
        }
    };

    const eliminarEmpleado = async (id) => {
        if (window.confirm('¿Estás seguro de desactivar este empleado?')) {
            try {
                await api.delete(`/usuarios/${id}`);
                loadEmpleados();
                if (empleadoSeleccionado?.id === id) volverALista();
            } catch (err) {
                console.error('Error eliminando empleado:', err);
                alert('Error al desactivar el empleado');
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
                                                <button className="btn-detalle-front" onClick={(e) => { e.stopPropagation(); verDetalle(empleado); }}>
                                                    🔍 Ver Ficha Detallada
                                                </button>
                                                <p className="flip-hint">Clic en la foto para girar →</p>
                                            </div>
                                        </div>

                                        {/* ── CARA TRASERA ── */}
                                        <div className="empleado-back" onClick={(e) => e.stopPropagation()}>
                                            <div>
                                                <p className="empleado-back-nombre">{empleado.nombre}</p>
                                                <p className="empleado-back-cargo" style={{ fontSize: '12px', color: '#1a56ff', fontWeight: 600, marginBottom: '8px' }}>
                                                    {empleado.cargo !== '—' ? empleado.cargo : 'Técnico de Limpieza'}
                                                </p>
                                                <p className="empleado-back-descripcion" style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                                                    <strong>Certificaciones:</strong> {empleado.certificaciones !== '—' ? empleado.certificaciones : 'Sin certificaciones registradas.'}
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
                                                <div className="empleado-back-dato">
                                                    <span>⏰</span>
                                                    <span>{empleado.horario}</span>
                                                </div>
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
                                                    🗑️ Desactivar
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
                                            <span className="dato-label">💳 Documento</span>
                                            <span className="dato-valor">({empleadoSeleccionado.tipoDocNombre}) {empleadoSeleccionado.cedula}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📍 Dirección</span>
                                            <span className="dato-valor">{empleadoSeleccionado.direccion}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📅 F. Ingreso</span>
                                            <span className="dato-valor">{empleadoSeleccionado.fecha_ingreso || '—'}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">⏰ Horario</span>
                                            <span className="dato-valor">{empleadoSeleccionado.horario}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">🗓️ Días Laborados</span>
                                            <span className="dato-valor">{empleadoSeleccionado.dias_laborales}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">⭐ Especialidades</span>
                                            <span className="dato-valor">{empleadoSeleccionado.especialidad}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">🏆 Certificaciones</span>
                                            <span className="dato-valor">{empleadoSeleccionado.certificaciones}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📞 Teléfono</span>
                                            <span className="dato-valor">{empleadoSeleccionado.telefono}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📧 Correo</span>
                                            <span className="dato-valor">{empleadoSeleccionado.correo}</span>
                                        </div>
                                    </div>
                                    <div className="detalle-acciones">
                                        <button className="btn-editar-detalle" onClick={() => abrirModal(empleadoSeleccionado)}>
                                            ✏️ Editar Ficha
                                        </button>
                                        <button className="btn-eliminar-detalle" onClick={() => eliminarEmpleado(empleadoSeleccionado.id)}>
                                            🗑️ Desactivar
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
                                {formData.id ? 'Editar Ficha de Empleado' : 'Nuevo Empleado'}
                            </h3>
                            <div className="form-group-modal">
                                <label>Nombre Completo</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre completo del empleado" />
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Tipo de Documento</label>
                                    <select name="tipoDocId" value={formData.tipoDocId || 1} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'Kanit' }}>
                                        {TIPOS_DOCUMENTO.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group-modal">
                                    <label>Número de Documento</label>
                                    <input type="text" name="cedula" value={formData.cedula || ''} onChange={handleInputChange} placeholder="Número de cédula/pasaporte" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Teléfono</label>
                                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="+57 310 123 4567" />
                                </div>
                                <div className="form-group-modal">
                                    <label>Dirección</label>
                                    <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleInputChange} placeholder="Dirección de residencia" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Cargo</label>
                                    <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} placeholder="Ej: Técnico de Limpieza" />
                                </div>
                                <div className="form-group-modal">
                                    <label>Especialidades</label>
                                    <input type="text" name="especialidad" value={formData.especialidad} onChange={handleInputChange} placeholder="Ej: sofas, colchones" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Fecha de Nacimiento</label>
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange} />
                                </div>
                                <div className="form-group-modal">
                                    <label>Fecha de Ingreso</label>
                                    <input type="date" name="fecha_ingreso" value={formData.fecha_ingreso || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Días Laborales</label>
                                    <input type="text" name="dias_laborales" value={formData.dias_laborales || ''} onChange={handleInputChange} placeholder="Ej: lunes, martes, viernes" />
                                </div>
                                <div className="form-group-modal">
                                    <label>Horario</label>
                                    <input type="text" name="horario" value={formData.horario || ''} onChange={handleInputChange} placeholder="Ej: 08:00 - 17:00" />
                                </div>
                            </div>
                            <div className="form-group-modal">
                                <label>Certificaciones y Capacitaciones</label>
                                <textarea name="certificaciones" value={formData.certificaciones} onChange={handleInputChange} placeholder="Detalla las certificaciones del empleado..." rows="3" />
                            </div>
                            <div className="modal-botones">
                                <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                                <button className="btn-guardar" onClick={guardarEmpleado}>Guardar Ficha</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrudEmpleados;