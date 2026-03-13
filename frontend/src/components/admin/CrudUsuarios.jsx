import React, { useState, useEffect } from 'react';
import '../css/CrudUsuarios.css';
import api from '../../services/api';

const CrudUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/usuarios')
            .then(res => {
                const data = res.data?.data || res.data || [];
                setUsuarios(Array.isArray(data) ? data.map(u => ({
                    id:      u.Id_Usuario || u.id,
                    nombre:  u.Nombre     || u.nombre,
                    usuario: u.Correo     || u.correo,
                    correo:  u.Correo     || u.correo,
                    estado:  u.estado,
                    rol:     u.rol_Id_Rol
                })) : []);
            })
            .catch(err => console.error('Error cargando usuarios:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        usuario: '',
        correo: ''
    });

    const abrirModal = (usuario = null) => {
        if (usuario) {
            setUsuarioEditando(usuario);
            setFormData({
                nombre: usuario.nombre,
                usuario: usuario.usuario,
                correo: usuario.correo
            });
        } else {
            setUsuarioEditando(null);
            setFormData({ nombre: '', usuario: '', correo: '' });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setUsuarioEditando(null);
        setFormData({ nombre: '', usuario: '', correo: '' });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const guardarUsuario = async () => {
        try {
            if (usuarioEditando) {
                await api.put('/usuarios/' + usuarioEditando.id, {
                    Nombre: formData.nombre,
                    Correo: formData.correo
                });
                setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? { ...u, ...formData } : u));
            }
            cerrarModal();
        } catch (err) {
            console.error('Error guardando usuario:', err);
            alert('Error al guardar el usuario');
        }
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await api.put('/usuarios/' + id + '/estado', { estado: 'inactivo' });
                setUsuarios(usuarios.filter(u => u.id !== id));
            } catch (err) {
                console.error('Error eliminando usuario:', err);
                setUsuarios(usuarios.filter(u => u.id !== id)); // igual actualizar UI
            }
        }
    };

    return (
        <div className="crud-container">
            {/* Contenido */}
            <div className="crud-content">
                <h2 className="crud-title">Usuarios</h2>

                <button className="btn-agregar" onClick={() => abrirModal()}>
                    ➕ Agregar Usuario
                </button>

                {/* Lista de usuarios */}
                <div className="usuarios-lista">
                    {usuarios.map((usuario) => (
                        <div key={usuario.id} className="usuario-card">
                            <div className="usuario-info">
                                <span className="usuario-id">{String(usuario.id).padStart(3, '0')}</span>
                                <span className="usuario-nombre">{usuario.usuario}</span>
                                <span className="usuario-nombre-completo">{usuario.nombre}</span>
                                <span className="usuario-correo">{usuario.correo}</span>
                            </div>
                            <div className="usuario-acciones">
                                <button 
                                    className="btn-editar"
                                    onClick={() => abrirModal(usuario)}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="btn-eliminar"
                                    onClick={() => eliminarUsuario(usuario.id)}
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-avatar">👤</div>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group-modal">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Delmer jesus"
                                />
                            </div>

                            <div className="form-group-modal">
                                <label>Usuario</label>
                                <input
                                    type="text"
                                    name="usuario"
                                    value={formData.usuario}
                                    onChange={handleInputChange}
                                    placeholder="Delmer105"
                                />
                            </div>

                            <div className="form-group-modal">
                                <label>Correo</label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleInputChange}
                                    placeholder="delmer@gmail.com"
                                />
                            </div>

                            <div className="modal-botones">
                                <button className="btn-cancelar" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button className="btn-guardar" onClick={guardarUsuario}>
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

export default CrudUsuarios;