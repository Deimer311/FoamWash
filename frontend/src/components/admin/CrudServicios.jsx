// =============================================================================
// ARCHIVO  : CrudServicios.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/CrudServicios.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   CRUD completo de servicios: crear, editar y eliminar los servicios ofrecidos.
// =============================================================================

import React, { useState, useEffect } from 'react';
import './estilos_admin/CrudServicios.css';
import api from '../../services/api';

const CrudServicios = ({onBackToProfile}) => {
    const [servicios, setServicios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/servicios')
            .then(res => {
                const data = res.data?.data || [];
                setServicios(data.map(s => ({
                    id:          s.id || s.Id_Servicio,
                    nombre:      s.nombre || s.Nombre_Servicio,
                    descripcion: s.descripcion,
                    imagen:      s.imagen_url || '/img/imag1.jpg',
                    precio:      s.precio || s.Precio
                })));
            })
            .catch(err => console.error('Error cargando servicios:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [servicioEditando, setServicioEditando] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        imagen: ''
    });

    const abrirModal = (servicio = null) => {
        if (servicio) {
            setServicioEditando(servicio);
            setFormData({
                nombre: servicio.nombre,
                descripcion: servicio.descripcion,
                imagen: servicio.imagen
            });
        } else {
            setServicioEditando(null);
            setFormData({ nombre: '', descripcion: '', imagen: '' });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setServicioEditando(null);
        setFormData({ nombre: '', descripcion: '', imagen: '' });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const guardarServicio = async () => {
        try {
            const payload = {
                Nombre_Servicio: formData.nombre,
                Precio:          formData.precio || 0,
                descripcion:     formData.descripcion,
                imagen_url:      formData.imagen
            };
            if (servicioEditando) {
                await api.put('/servicios/' + servicioEditando.id, payload);
                setServicios(servicios.map(s => s.id === servicioEditando.id ? { ...s, ...formData } : s));
            } else {
                const res = await api.post('/servicios', payload);
                const nuevo = { id: res.data.data?.id || Date.now(), ...formData };
                setServicios([...servicios, nuevo]);
            }
            cerrarModal();
        } catch (err) {
            console.error('Error guardando servicio:', err);
            alert('Error al guardar el servicio');
        }
    };

    const eliminarServicio = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
            try {
                await api.delete('/servicios/' + id);
                setServicios(servicios.filter(s => s.id !== id));
            } catch (err) {
                console.error('Error eliminando servicio:', err);
                alert('No se pudo eliminar el servicio');
            }
        }
    };

    return (
        <div className="crud-container">
                {/* Contenido */}
            <div className="crud-content">
                <h2 className="crud-title">Servicios</h2>

                <button className="btn-agregar" onClick={() => abrirModal()}>
                    ➕ Agregar Servicio
                </button>

                {/* Grid de servicios */}
                <div className="servicios-grid">
                    {servicios.map((servicio) => (
                        <div key={servicio.id} className="servicio-card">
                            <div className="servicio-imagen-container">
                                <img 
                                    src={servicio.imagen} 
                                    alt={servicio.nombre}
                                    className="servicio-imagen"
                                />
                            </div>
                            <div className="servicio-info">
                                <h3 className="servicio-nombre">{servicio.nombre}</h3>
                            </div>
                            <div className="servicio-acciones">
                                <button 
                                    className="btn-editar"
                                    onClick={() => abrirModal(servicio)}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="btn-eliminar"
                                    onClick={() => eliminarServicio(servicio.id)}
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de edición */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content-servicio" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={cerrarModal}>✕</button>
                        
                        <div className="modal-body-servicio">
                            <h3 className="modal-titulo">
                                {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h3>

                            <div className="form-group-modal">
                                <label>Nombre del Servicio</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Limpieza de muebles"
                                />
                            </div>

                            <div className="form-group-modal">
                                <label>Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Describe el servicio..."
                                    rows="4"
                                />
                            </div>

                            <div className="form-group-modal">
                                <label>Precio</label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio || ''}
                                    onChange={handleInputChange}
                                    placeholder="90000"
                                />
                            </div>
                            <div className="form-group-modal">
                                <label>URL de Imagen</label>
                                <input
                                    type="text"
                                    name="imagen"
                                    value={formData.imagen}
                                    onChange={handleInputChange}
                                    placeholder="/img/servicio.jpg"
                                />
                            </div>

                            <div className="modal-botones">
                                <button className="btn-cancelar" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button className="btn-guardar" onClick={guardarServicio}>
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

export default CrudServicios;