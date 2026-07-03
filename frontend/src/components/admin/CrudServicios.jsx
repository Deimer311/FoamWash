// =============================================================================
// ARCHIVO  : CrudServicios.jsx — PREMIUM FINAL
// PROYECTO : FoamWash
// NOTA     : Todos los emojis → SVG. Lógica API 100% intacta.
// =============================================================================

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcPlus  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcEdit  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcBroom = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19l4-4"/><path d="M9.5 9.5L15 4l5 5-5.5 5.5"/><path d="M3 21l6-6"/><path d="M9 15l3-3"/></svg>;

const CrudServicios = ({ onBackToProfile }) => {
    const [servicios,  setServicios]  = useState([]);
    const [isLoading,  setIsLoading]  = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [servicioEditando, setServicioEditando] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        api.get('/servicios')
            .then(res => {
                const data = res.data?.data || [];
                setServicios(data.map(s => ({
                    id:          s.id || s.Id_Servicio,
                    nombre:      s.nombre || s.Nombre_Servicio,
                    descripcion: s.descripcion,
                    imagen:      s.imagen_url || '/img/imag1.jpg',
                    precio:      s.precio || s.Precio,
                })));
            })
            .catch(err => console.error('Error cargando servicios:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const getImageUrl = (url) => {
        if (!url) return '/img/imag1.jpg';
        if (url.startsWith('http')) return url;
        const baseUrl = api.defaults.baseURL.replace(/\/api\/?$/, '');
        return `${baseUrl}${url}`;
    };

    const abrirModal = (servicio = null) => {
        if (servicio) {
            setServicioEditando(servicio);
            setFormData({ nombre: servicio.nombre, descripcion: servicio.descripcion, precio: servicio.precio || '' });
            setImagePreview(getImageUrl(servicio.imagen));
        } else {
            setServicioEditando(null);
            setFormData({ nombre: '', descripcion: '', precio: '' });
            setImagePreview(null);
        }
        setImageFile(null);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setServicioEditando(null);
        setFormData({ nombre: '', descripcion: '', precio: '' });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const guardarServicio = async () => {
        try {
            const payload = {
                Nombre_Servicio: formData.nombre,
                Precio:          formData.precio || 0,
                descripcion:     formData.descripcion
            };
            
            let servicioId = null;
            let currentServicio = null;

            if (servicioEditando) {
                servicioId = servicioEditando.id;
                await api.put('/servicios/' + servicioId, payload);
                currentServicio = { ...servicioEditando, ...formData };
            } else {
                const res = await api.post('/servicios', payload);
                servicioId = res.data.data?.id || res.data.data?.Id_Servicio;
                currentServicio = { id: servicioId, ...formData, imagen: '' };
            }

            // Subir imagen si se seleccionó una nueva
            if (imageFile && servicioId) {
                const formDataImg = new FormData();
                formDataImg.append('imagen', imageFile);
                const imgRes = await api.post(`/servicios/${servicioId}/imagen`, formDataImg, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (imgRes.data?.data?.imagen_url) {
                    currentServicio.imagen = imgRes.data.data.imagen_url;
                }
            }

            if (servicioEditando) {
                setServicios(servicios.map(s => s.id === servicioId ? currentServicio : s));
            } else {
                setServicios([...servicios, currentServicio]);
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
        <>
            <style>{`
                .cs-page { min-height: 100vh; background: var(--ad-bg, #f0f4f8); }
                .cs-wrap { max-width: 1400px; margin: 0 auto; padding: 40px 32px; }

                .cs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 14px; }
                .cs-title-row { display: flex; align-items: center; gap: 12px; }
                .cs-page-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(0,102,255,0.10);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .cs-title { font-size: 26px; font-weight: 800; color: #1a2540; letter-spacing: -0.5px; margin: 0; }
                .cs-subtitle { font-size: 13px; color: #8898b3; margin: 2px 0 0; }

                .cs-btn-add {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 11px 22px;
                    background: linear-gradient(135deg, #00b8ff, #0066ff);
                    color: #fff; border: none; border-radius: 50px;
                    font-size: 14px; font-weight: 700; font-family: inherit;
                    cursor: pointer;
                    box-shadow: 0 4px 18px rgba(0,102,255,0.30);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .cs-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,102,255,0.40); }

                .cs-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 22px;
                }

                .cs-card {
                    background: #fff; border-radius: 18px; overflow: hidden;
                    border: 1px solid #e0e8f5;
                    box-shadow: 0 2px 12px rgba(10,30,80,0.06);
                    transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
                    display: flex; flex-direction: column;
                }
                .cs-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 32px rgba(0,102,255,0.13);
                    border-color: rgba(0,102,255,0.18);
                }

                .cs-img-wrap { width: 100%; height: 185px; overflow: hidden; flex-shrink: 0; background: #e8f0ff; }
                .cs-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s ease; }
                .cs-card:hover .cs-img { transform: scale(1.06); }

                .cs-info { padding: 14px 16px 8px; flex: 1; }
                .cs-nombre {
                    font-size: 14px; font-weight: 700; color: #1a2540;
                    margin: 0 0 4px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .cs-precio {
                    font-size: 13px; font-weight: 700;
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }

                .cs-actions {
                    display: flex; gap: 6px; padding: 10px 14px 14px;
                    border-top: 1px solid #f0f4f8; justify-content: flex-end;
                }
                .cs-btn-icon {
                    width: 34px; height: 34px; border-radius: 9px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s ease;
                }
                .cs-btn-edit { background: rgba(0,102,255,0.08); color: #0052cc; }
                .cs-btn-edit:hover { background: rgba(0,102,255,0.16); transform: scale(1.1); }
                .cs-btn-del  { background: rgba(239,68,68,0.08); color: #b91c1c; }
                .cs-btn-del:hover  { background: rgba(239,68,68,0.14); transform: scale(1.1); }

                .cs-empty { grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #8898b3; font-size: 15px; }

                /* ── Modal ── */
                .cs-modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(5,8,25,0.60); backdrop-filter: blur(10px);
                    z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;
                    animation: csOverlayIn 0.2s ease;
                }
                @keyframes csOverlayIn { from { opacity: 0; } to { opacity: 1; } }

                .cs-modal {
                    background: #fff; border-radius: 22px; width: 100%; max-width: 520px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.28);
                    animation: csModalIn 0.3s cubic-bezier(.34,1.56,.64,1);
                }
                @keyframes csModalIn {
                    from { opacity: 0; transform: translateY(18px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .cs-modal-head {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid #e0e8f5;
                    background: linear-gradient(135deg, rgba(0,102,255,0.04), rgba(0,184,255,0.04));
                    position: sticky; top: 0; background: #fff; z-index: 1;
                }
                .cs-modal-title { font-size: 17px; font-weight: 700; color: #1a2540; }
                .cs-modal-close {
                    width: 30px; height: 30px; border-radius: 50%; border: none;
                    background: #f0f4f8; color: #8898b3; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .cs-modal-close:hover { background: #fee2e2; color: #b91c1c; transform: rotate(90deg); }

                .cs-modal-body { padding: 22px 24px 24px; }

                .cs-fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
                .cs-fg label {
                    font-size: 11px; font-weight: 700; color: #8898b3;
                    text-transform: uppercase; letter-spacing: 0.5px;
                }
                .cs-fg input, .cs-fg textarea {
                    padding: 11px 14px; font-size: 14px; font-family: inherit;
                    color: #1a2540; background: #f8faff;
                    border: 1.5px solid #e0e8f5; border-radius: 10px;
                    outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    width: 100%; box-sizing: border-box;
                }
                .cs-fg input:focus, .cs-fg textarea:focus {
                    border-color: #0066ff; background: #fff;
                    box-shadow: 0 0 0 3px rgba(0,102,255,0.09);
                }
                .cs-fg textarea { resize: vertical; min-height: 90px; }

                .cs-modal-foot { display: flex; gap: 10px; padding: 16px 24px 20px; border-top: 1px solid #e0e8f5; }
                .cs-btn-cancel {
                    flex: 1; padding: 12px; border: 1.5px solid #e0e8f5; border-radius: 12px;
                    background: #f8faff; color: #4a5a80; font-size: 14px; font-weight: 600;
                    font-family: inherit; cursor: pointer; transition: background 0.2s;
                }
                .cs-btn-cancel:hover { background: #e8f0ff; }
                .cs-btn-save {
                    flex: 1; padding: 12px; border: none; border-radius: 12px;
                    background: linear-gradient(135deg, #00b8ff, #0066ff);
                    color: #fff; font-size: 14px; font-weight: 700;
                    font-family: inherit; cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0,102,255,0.28);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .cs-btn-save:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,102,255,0.38); }

                @media (max-width: 1100px) { .cs-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (max-width: 768px)  { .cs-grid { grid-template-columns: repeat(2, 1fr); } .cs-wrap { padding: 28px 16px; } }
                @media (max-width: 480px)  { .cs-grid { grid-template-columns: 1fr; } }
            `}</style>

            <div className="cs-page">
                <div className="cs-wrap">

                    {/* Header */}
                    <div className="cs-header">
                        <div className="cs-title-row">
                            <div className="cs-page-icon"><IcBroom /></div>
                            <div>
                                <h1 className="cs-title">Servicios</h1>
                                <p className="cs-subtitle">Gestiona el catálogo de servicios</p>
                            </div>
                        </div>
                        <button className="cs-btn-add" onClick={() => abrirModal()}>
                            <IcPlus /> Agregar Servicio
                        </button>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="cs-grid">
                            {[1,2,3,4].map(i => (
                                <div key={i} style={{ height: 280, borderRadius: 18, background: 'linear-gradient(90deg,#e0e8f8 25%,#eef3ff 50%,#e0e8f8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                            ))}
                        </div>
                    ) : (
                        <div className="cs-grid">
                            {servicios.length === 0 ? (
                                <div className="cs-empty">No hay servicios registrados aún.</div>
                            ) : servicios.map(s => (
                                <div key={s.id} className="cs-card">
                                    <div className="cs-img-wrap">
                                        <img src={getImageUrl(s.imagen)} alt={s.nombre} className="cs-img"
                                            onError={e => { e.target.src = '/img/imag1.jpg'; }} />
                                    </div>
                                    <div className="cs-info">
                                        <div className="cs-nombre">{s.nombre}</div>
                                        {s.precio && (
                                            <div className="cs-precio">
                                                ${Number(s.precio).toLocaleString('es-CO')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="cs-actions">
                                        <button className="cs-btn-icon cs-btn-edit" title="Editar" onClick={() => abrirModal(s)}>
                                            <IcEdit />
                                        </button>
                                        <button className="cs-btn-icon cs-btn-del" title="Eliminar" onClick={() => eliminarServicio(s.id)}>
                                            <IcTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="cs-modal-overlay" onClick={cerrarModal}>
                    <div className="cs-modal" onClick={e => e.stopPropagation()}>
                        <div className="cs-modal-head">
                            <span className="cs-modal-title">
                                {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </span>
                            <button className="cs-modal-close" onClick={cerrarModal}><IcX /></button>
                        </div>
                        <div className="cs-modal-body">
                            <div className="cs-fg">
                                <label>Nombre del Servicio</label>
                                <input type="text" name="nombre" value={formData.nombre}
                                    onChange={handleInputChange} placeholder="Ej: Limpieza de muebles" />
                            </div>
                            <div className="cs-fg">
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion}
                                    onChange={handleInputChange} placeholder="Describe el servicio..." />
                            </div>
                            <div className="cs-fg">
                                <label>Precio</label>
                                <input type="number" name="precio" value={formData.precio}
                                    onChange={handleInputChange} placeholder="90000" />
                            </div>
                            <div className="cs-fg">
                                <label>Imagen del Servicio</label>
                                {imagePreview && (
                                    <div style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden', height: 120, background: '#f0f4f8' }}>
                                        <img src={imagePreview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>
                        <div className="cs-modal-foot">
                            <button className="cs-btn-cancel" onClick={cerrarModal}>Cancelar</button>
                            <button className="cs-btn-save" onClick={guardarServicio}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CrudServicios;