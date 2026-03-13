import React, { useState } from 'react';
import '../css/CrudEmpleados.css';

const CrudEmpleados = () => {
    const [empleados, setEmpleados] = useState([
        { 
            id: 1, 
            nombre: 'Edilberto González Jiménez',
            foto: '/img/empleado1.jpg',
            cargo: 'Técnico de Limpieza',
            especialidad: 'Limpieza profunda',
            descripcion: 'Es especialista en limpieza y desinfección de sofás, sillones y colchones. Maneja equipos de inyección y succión, así como productos ecológicos que eliminan manchas y olores sin dañar las fibras. Su principal habilidad es recuperar la apariencia original de los muebles, garantizando ambientes más limpios e higiénicos.',
            experiencia: '5 años',
            telefono: '+57 310 123 4567'
        }
    ]);

    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [vistaDetalle, setVistaDetalle] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        foto: '',
        cargo: '',
        especialidad: '',
        descripcion: '',
        experiencia: '',
        telefono: ''
    });

    const verDetalle = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setVistaDetalle(true);
    };

    const volverALista = () => {
        setVistaDetalle(false);
        setEmpleadoSeleccionado(null);
    };

    const abrirModal = (empleado = null) => {
        if (empleado) {
            setFormData(empleado);
        } else {
            setFormData({
                nombre: '',
                foto: '',
                cargo: '',
                especialidad: '',
                descripcion: '',
                experiencia: '',
                telefono: ''
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setFormData({
            nombre: '',
            foto: '',
            cargo: '',
            especialidad: '',
            descripcion: '',
            experiencia: '',
            telefono: ''
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const guardarEmpleado = () => {
        if (formData.id) {
            setEmpleados(empleados.map(e => 
                e.id === formData.id ? formData : e
            ));
        } else {
            const nuevoEmpleado = {
                id: empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) + 1 : 1,
                ...formData
            };
            setEmpleados([...empleados, nuevoEmpleado]);
        }
        cerrarModal();
    };

    const eliminarEmpleado = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
            setEmpleados(empleados.filter(e => e.id !== id));
            if (empleadoSeleccionado?.id === id) {
                volverALista();
            }
        }
    };

    return (
        <div className="crud-container">
            
            {/* Se ha eliminado todo el bloque <header className="crud-header">...</header> */}

            {/* Contenido */}
            <div className="crud-content">
                <h2 className="crud-title">Empleados</h2>

                {!vistaDetalle ? (
                    <>
                        <button className="btn-agregar" onClick={() => abrirModal()}>
                            ➕ Agregar Empleado
                        </button>

                        {/* Grid de empleados */}
                        <div className="empleados-grid">
                            {empleados.map((empleado) => (
                                <div key={empleado.id} className="empleado-card">
                                    <div 
                                        className="empleado-foto-container"
                                        onClick={() => verDetalle(empleado)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img 
                                            src={empleado.foto} 
                                            alt={empleado.nombre}
                                            className="empleado-foto"
                                        />
                                    </div>
                                    <div className="empleado-info">
                                        <h3 className="empleado-nombre">{empleado.nombre}</h3>
                                        <p className="empleado-cargo">{empleado.cargo}</p>
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
                    </>
                ) : (
                    /* Vista de detalle del empleado */
                    <div className="detalle-empleado">
                        <button className="btn-volver" onClick={volverALista}>
                            ← Volver a la lista
                        </button>

                        <div className="detalle-container">
                            <div className="detalle-foto-grande">
                                <img 
                                    src={empleadoSeleccionado.foto} 
                                    alt={empleadoSeleccionado.nombre}
                                />
                            </div>

                            <div className="detalle-info-card">
                                <div className="detalle-info-contenido">
                                    <p className="detalle-descripcion">
                                        {empleadoSeleccionado.descripcion}
                                    </p>
                                    
                                    <div className="detalle-datos">
                                        <div className="dato-item">
                                            <span className="dato-label">👤 Nombre:</span>
                                            <span className="dato-valor">{empleadoSeleccionado.nombre}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">💼 Cargo:</span>
                                            <span className="dato-valor">{empleadoSeleccionado.cargo}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">⭐ Especialidad:</span>
                                            <span className="dato-valor">{empleadoSeleccionado.especialidad}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📅 Experiencia:</span>
                                            <span className="dato-valor">{empleadoSeleccionado.experiencia}</span>
                                        </div>
                                        <div className="dato-item">
                                            <span className="dato-label">📞 Teléfono:</span>
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

            {/* Modal de edición */}
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
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Nombre completo del empleado"
                                />
                            </div>

                            <div className="form-group-modal">
                                <label>URL de Foto</label>
                                <input
                                    type="text"
                                    name="foto"
                                    value={formData.foto}
                                    onChange={handleInputChange}
                                    placeholder="/img/empleado.jpg"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Cargo</label>
                                    <input
                                        type="text"
                                        name="cargo"
                                        value={formData.cargo}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Técnico de Limpieza"
                                    />
                                </div>

                                <div className="form-group-modal">
                                    <label>Especialidad</label>
                                    <input
                                        type="text"
                                        name="especialidad"
                                        value={formData.especialidad}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Limpieza profunda"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Experiencia</label>
                                    <input
                                        type="text"
                                        name="experiencia"
                                        value={formData.experiencia}
                                        onChange={handleInputChange}
                                        placeholder="Ej: 5 años"
                                    />
                                </div>

                                <div className="form-group-modal">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+57 310 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="form-group-modal">
                                <label>Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Describe las habilidades y experiencia del empleado..."
                                    rows="5"
                                />
                            </div>

                            <div className="modal-botones">
                                <button className="btn-cancelar" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button className="btn-guardar" onClick={guardarEmpleado}>
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrudEmpleados;
