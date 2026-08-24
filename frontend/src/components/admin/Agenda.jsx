// =============================================================================
// ARCHIVO  : Agenda.jsx — PREMIUM FIX
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Fix: padding-top para header fijo + SVG icons.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import FooterAdmin from './FooterAdmin';
import api from '../../services/api';

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const hours = Array.from({ length: 13 }, (_, i) => `${String(6 + i).padStart(2, '0')}:00`);

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcEdit  = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IcSave  = () => <svg height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcUser  = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcClock = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcCalDot= () => <svg height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>;

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseFecha = (isoString) => { if (!isoString) return ""; return isoString.split("T")[0]; };
const parseHora  = (isoString) => {
  if (!isoString) return "";
  const time = isoString.split("T")[1] || "";
  const [h, m] = time.split(":");
  return h && m ? `${h}:00` : "";
};
const getDayName = (dateStr) => {
  const names = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const date = new Date(dateStr + "T12:00:00");
  return names[date.getDay()];
};
const normalizeReserva = (r) => ({
  id:         r.ID_Reserva,
  date:       parseFecha(r.fecha),
  day:        getDayName(parseFecha(r.fecha)),
  hour:       parseHora(r.Hora),
  service:    Array.isArray(r.servicios)
                ? (r.servicios.map((s) => s.Nombre_Servicio).join(", ") || "Sin servicio")
                : (r.servicios?.Nombre_Servicio || "Sin servicio"),
  employee:   r.empleado?.Nombre || "Sin asignar",
  employeeId: r.empleado_Id_Usuario ?? null,
  client:     r.cliente?.Nombre || "Sin cliente",
  address:    r.cliente?.Direccion || "",
  estado:     r.Estado || "Pendiente",
});

// ── Status color ──────────────────────────────────────────────────────────────
const statusColor = (estado) => {
  const map = {
    'Completado': '#00c853', 'Completada': '#00c853',
    'Pendiente':  '#f59e0b',
    'Cancelado':  '#ef4444', 'Cancelada':  '#ef4444',
    'En proceso': '#0066ff', 'En Proceso': '#0066ff',
  };
  return map[estado] || '#8898b3';
};

// ── Componente principal ──────────────────────────────────────────────────────
const Agenda = ({
  onGoDashboard, onGoAgenda, onGoEmpleados,
  onGoReportes,  onGoPerfil, onLogout, onOpenReportes,
}) => {
  const [view,          setView]          = useState("semana");
  const [orders,        setOrders]        = useState([]);
  const [employees,     setEmployees]     = useState([]);
  const [editingOrder,  setEditingOrder]  = useState(null);
  const [currentMonth,  setCurrentMonth]  = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [resReservas, resEmpleados] = await Promise.all([
        api.get("/reservas"),
        api.get("/empleados"),
      ]);
      const reservasRaw  = resReservas.data?.data  ?? resReservas.data  ?? [];
      const empleadosRaw = resEmpleados.data?.data ?? resEmpleados.data ?? [];
      setOrders(reservasRaw.map(normalizeReserva));
      setEmployees(empleadosRaw.map((e) => ({ id: e.Id_Usuario, name: e.Nombre })));
    } catch (err) {
      console.error("Error cargando datos de agenda:", err);
      setError("No se pudieron cargar los datos. Verifica tu conexión.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de cancelar esta orden?")) return;
    try {
      await api.put(`/reservas/${orderId}`, { Estado: "Cancelado" });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, estado: "Cancelado" } : o)));
    } catch (err) {
      console.error("Error cancelando orden:", err);
      alert("No se pudo cancelar la orden");
    }
  };

  const handleSaveEdit = async (updatedOrder) => {
    try {
      const payload = {
        empleado_Id_Usuario: updatedOrder.employeeId ? Number(updatedOrder.employeeId) : undefined,
      };
      if (updatedOrder.hour) {
        const soloFecha = updatedOrder.date || new Date().toISOString().split("T")[0];
        payload.Hora = new Date(`${soloFecha}T${updatedOrder.hour}:00.000Z`);
      }
      await api.put(`/reservas/${updatedOrder.id}`, payload);
      const selectedEmployee = employees.find((e) => e.id === Number(updatedOrder.employeeId));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updatedOrder.id
            ? { ...updatedOrder, employee: selectedEmployee?.name || updatedOrder.employee }
            : o
        )
      );
      setEditingOrder(null);
    } catch (err) {
      console.error("Error actualizando orden:", err);
      alert("No se pudo guardar el cambio");
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek };
  };

  const getOrdersForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return orders.filter((o) => o.date === dateStr && o.estado !== "Cancelado");
  };

  const hoyStr = new Date().toISOString().split("T")[0];
  const kpiSnapshot = {
    ordeneHoy:        orders.filter((o) => o.date === hoyStr && o.estado !== "Cancelado").length,
    ordensPendientes: orders.filter((o) => o.estado === "Pendiente").length,
    empleadosActivos: employees.length,
    ingresosMes:      `${orders.filter((o) => o.estado === "Completado").length} completadas`,
  };

  const activeOrders = orders.filter((o) => o.estado !== "Cancelado");

  return (
    <>
      <style>{`
        /* ── Variables ── */
        :root {
          --ag-primary:     #0066FF;
          --ag-primary-dk:  #0052CC;
          --ag-primary-lt:  #E6F2FF;
          --ag-success:     #00C853;
          --ag-warning:     #FF9800;
          --ag-danger:      #EF4444;
          --ag-text:        #1a2540;
          --ag-muted:       #8898b3;
          --ag-border:      #e0e8f5;
          --ag-bg:          #f0f4f8;
          --ag-surface:     #ffffff;
          --ag-shadow-sm:   0 2px 10px rgba(10,30,80,0.07);
          --ag-shadow-md:   0 6px 22px rgba(10,30,80,0.11);
          --ag-shadow-blue: 0 4px 20px rgba(0,102,255,0.18);
          --ag-header-h:    64px;
          --ag-r-sm:        8px;
          --ag-r-md:        12px;
          --ag-r-lg:        16px;
        }

        /* ── Page wrapper — respiro bajo el header fijo ── */
        .ag-page {
          min-height: 100vh;
          background: var(--ag-bg);
          padding-top: calc(var(--ag-header-h) + 32px);
          padding-bottom: 60px;
          font-family: 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .ag-wrap { max-width: 1560px; margin: 0 auto; padding: 0 28px; }

        /* ── Page header ── */
        .ag-page-head {
          text-align: center;
          margin-bottom: 28px;
        }

        .ag-page-title-row {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .ag-page-icon {
          width: 44px; height: 44px;
          background: var(--ag-primary-lt);
          border-radius: var(--ag-r-md);
          display: flex; align-items: center; justify-content: center;
          color: var(--ag-primary);
        }

        .ag-page-title {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--ag-primary), var(--ag-primary-dk));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
          margin: 0;
        }

        /* ── View controls ── */
        .ag-controls {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 28px;
          background: var(--ag-surface);
          border: 1px solid var(--ag-border);
          border-radius: var(--ag-r-lg);
          padding: 5px;
          box-shadow: var(--ag-shadow-sm);
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }

        .ag-view-btn {
          padding: 9px 24px;
          border-radius: var(--ag-r-md);
          border: none;
          background: transparent;
          color: var(--ag-muted);
          font-weight: 600;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .ag-view-btn:hover { color: var(--ag-text); background: var(--ag-bg); }
        .ag-view-btn.active {
          background: linear-gradient(135deg, var(--ag-primary), var(--ag-primary-dk));
          color: #fff;
          box-shadow: 0 2px 10px rgba(0,102,255,0.28);
        }

        /* ── State boxes ── */
        .ag-state {
          text-align: center; padding: 52px 20px;
          background: var(--ag-surface); border-radius: var(--ag-r-lg);
          border: 1px solid var(--ag-border); box-shadow: var(--ag-shadow-sm);
          color: var(--ag-muted); font-size: 14px;
        }
        .ag-state.error { color: var(--ag-danger); }
        .ag-retry-btn {
          margin-top: 14px; padding: 9px 22px;
          background: var(--ag-primary); color: #fff;
          border: none; border-radius: var(--ag-r-md);
          font-weight: 600; font-size: 13px; cursor: pointer;
          font-family: inherit; transition: all 0.2s;
        }
        .ag-retry-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

        /* ── HOY view ── */
        .ag-today {
          background: var(--ag-surface);
          border-radius: var(--ag-r-lg);
          border: 1px solid var(--ag-border);
          box-shadow: var(--ag-shadow-sm);
          overflow: hidden;
        }

        .ag-hour-row {
          display: grid;
          grid-template-columns: 80px 1fr;
          border-bottom: 1px solid var(--ag-border);
          min-height: 64px;
          transition: background 0.15s;
        }
        .ag-hour-row:last-child { border-bottom: none; }
        .ag-hour-row:hover { background: var(--ag-bg); }

        .ag-hour-label {
          display: flex; align-items: flex-start; justify-content: center;
          padding: 12px 6px 0;
          font-size: 12px; font-weight: 700; color: var(--ag-muted);
          border-right: 1px solid var(--ag-border);
          background: var(--ag-bg);
          letter-spacing: 0.3px;
        }

        .ag-hour-orders {
          padding: 6px 12px;
          display: flex; flex-direction: column; gap: 6px;
        }

        /* ── SEMANA view ── */
        .ag-week {
          background: var(--ag-surface);
          border-radius: var(--ag-r-lg);
          border: 1px solid var(--ag-border);
          box-shadow: var(--ag-shadow-sm);
          overflow: auto;
        }

        .ag-grid {
          display: grid;
          grid-template-columns: 72px repeat(7, minmax(130px, 1fr));
          min-width: 1040px;
        }

        .ag-col-head {
          padding: 14px 8px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--ag-text);
          background: var(--ag-primary-lt);
          border-bottom: 1px solid var(--ag-border);
          border-right: 1px solid var(--ag-border);
          position: sticky; top: 0; z-index: 2;
        }
        .ag-col-head:last-child { border-right: none; }

        .ag-time-cell {
          height: 64px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: var(--ag-muted);
          border-bottom: 1px solid var(--ag-border);
          border-right: 1px solid var(--ag-border);
          background: var(--ag-bg); letter-spacing: 0.3px;
        }

        .ag-day-cell {
          height: 64px;
          padding: 4px 5px;
          border-bottom: 1px solid var(--ag-border);
          border-right: 1px solid var(--ag-border);
          display: flex; flex-direction: column; gap: 3px;
          transition: background 0.15s;
        }
        .ag-day-cell:last-child { border-right: none; }
        .ag-day-cell:hover { background: rgba(0,102,255,0.03); }

        /* ── MES view ── */
        .ag-month {
          background: var(--ag-surface);
          border-radius: var(--ag-r-lg);
          border: 1px solid var(--ag-border);
          box-shadow: var(--ag-shadow-sm);
          overflow: hidden;
        }

        .ag-month-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--ag-border);
          background: linear-gradient(135deg, rgba(0,102,255,0.04), rgba(0,184,255,0.04));
        }

        .ag-month-btn {
          padding: 8px 18px;
          background: var(--ag-primary-lt);
          color: var(--ag-primary);
          border: none; border-radius: var(--ag-r-md);
          font-weight: 700; font-size: 13px; cursor: pointer;
          font-family: inherit; transition: all 0.2s;
        }
        .ag-month-btn:hover { background: var(--ag-primary); color: #fff; }

        .ag-month-title {
          font-size: 18px; font-weight: 800;
          color: var(--ag-text);
          text-transform: capitalize; margin: 0;
        }

        .ag-cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0;
        }

        .ag-cal-day-header {
          padding: 11px 8px;
          text-align: center;
          font-size: 11px; font-weight: 800;
          color: var(--ag-muted);
          text-transform: uppercase; letter-spacing: 0.8px;
          background: var(--ag-bg);
          border-bottom: 1px solid var(--ag-border);
          border-right: 1px solid var(--ag-border);
        }
        .ag-cal-day-header:last-child { border-right: none; }

        .ag-cal-day {
          min-height: 96px;
          padding: 10px;
          border-bottom: 1px solid var(--ag-border);
          border-right: 1px solid var(--ag-border);
          transition: background 0.18s;
          cursor: default;
        }
        .ag-cal-day:nth-child(7n) { border-right: none; }
        .ag-cal-day:hover { background: rgba(0,102,255,0.03); }
        .ag-cal-day.empty { background: transparent; }
        .ag-cal-day.today {
          background: linear-gradient(135deg, rgba(0,102,255,0.06), rgba(0,184,255,0.04));
        }

        .ag-day-num {
          font-size: 13px; font-weight: 700;
          color: var(--ag-text); display: block; margin-bottom: 5px;
        }
        .ag-cal-day.today .ag-day-num {
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--ag-primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
        }

        .ag-day-orders-count {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700; color: var(--ag-primary);
          background: var(--ag-primary-lt);
          padding: 2px 8px; border-radius: 20px;
        }

        /* ── Order Card ── */
        .ag-order-card {
          background: var(--ag-surface);
          border: 1px solid var(--ag-border);
          border-left: 3px solid var(--ag-primary);
          border-radius: var(--ag-r-sm);
          padding: 10px 12px;
          box-shadow: var(--ag-shadow-sm);
          transition: all 0.22s ease;
        }
        .ag-order-card:hover {
          box-shadow: var(--ag-shadow-blue);
          transform: translateY(-1px);
          border-color: var(--ag-primary);
        }

        .ag-order-service {
          font-weight: 700; font-size: 13px; color: var(--ag-text);
          margin-bottom: 5px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }

        .ag-order-meta {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; color: var(--ag-muted);
          margin-bottom: 8px;
        }

        .ag-order-actions { display: flex; gap: 6px; }

        .ag-action-btn {
          flex: 1; padding: 6px 8px;
          border: none; border-radius: var(--ag-r-sm);
          font-size: 11.5px; font-weight: 600;
          cursor: pointer; transition: all 0.18s;
          font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }

        .ag-action-btn.edit {
          background: rgba(0,102,255,0.10); color: var(--ag-primary);
          border: 1px solid rgba(0,102,255,0.2);
        }
        .ag-action-btn.edit:hover { background: var(--ag-primary); color: #fff; }

        .ag-action-btn.del {
          background: rgba(239,68,68,0.08); color: var(--ag-danger);
          border: 1px solid rgba(239,68,68,0.2);
        }
        .ag-action-btn.del:hover { background: var(--ag-danger); color: #fff; }

        /* ── Compact order pill (semana grid) ── */
        .ag-order-pill {
          font-size: 10.5px; font-weight: 600;
          padding: 2px 6px; border-radius: 4px;
          background: rgba(0,102,255,0.10);
          color: var(--ag-primary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          cursor: pointer; transition: background 0.15s;
          border-left: 2px solid var(--ag-primary);
        }
        .ag-order-pill:hover { background: rgba(0,102,255,0.18); }

        /* ── Modal ── */
        .ag-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(5,8,25,0.55); backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: agFadeIn 0.2s ease;
        }
        @keyframes agFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .ag-modal {
          background: var(--ag-surface);
          border-radius: 20px;
          width: 100%; max-width: 480px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28);
          overflow: hidden;
          animation: agModalIn 0.3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes agModalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ag-modal-head {
          background: linear-gradient(135deg, var(--ag-primary), var(--ag-primary-dk));
          padding: 22px 26px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ag-modal-title { font-size: 17px; font-weight: 700; color: #fff; }
        .ag-modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          background: transparent; color: rgba(255,255,255,0.8);
          cursor: pointer; font-size: 18px; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.2s; font-family: inherit; line-height: 1;
        }
        .ag-modal-close:hover {
          background: rgba(255,255,255,0.2); color: #fff;
          transform: rotate(90deg);
        }

        .ag-modal-body { padding: 24px 26px 0; }

        .ag-fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .ag-fg label {
          font-size: 11px; font-weight: 700; color: var(--ag-muted);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .ag-fg input, .ag-fg select {
          padding: 11px 14px; font-size: 14px; font-family: inherit;
          color: var(--ag-text); background: #f8faff;
          border: 1.5px solid var(--ag-border); border-radius: var(--ag-r-md);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%; box-sizing: border-box;
        }
        .ag-fg input:focus, .ag-fg select:focus {
          border-color: var(--ag-primary); background: #fff;
          box-shadow: 0 0 0 3px rgba(0,102,255,0.09);
        }
        .ag-fg input:disabled {
          background: var(--ag-bg); color: var(--ag-muted); cursor: not-allowed;
        }
        .ag-fg-hint {
          font-size: 11px; color: var(--ag-muted); margin-top: 3px;
        }

        .ag-modal-foot {
          display: flex; gap: 10px;
          padding: 16px 26px 24px;
        }
        .ag-cancel-btn {
          flex: 1; padding: 12px; border: 1.5px solid var(--ag-border); border-radius: var(--ag-r-md);
          background: #f8faff; color: var(--ag-muted); font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .ag-cancel-btn:hover { background: var(--ag-primary-lt); color: var(--ag-primary); }
        .ag-save-btn {
          flex: 1; padding: 12px; border: none; border-radius: var(--ag-r-md);
          background: linear-gradient(135deg, var(--ag-primary), var(--ag-primary-dk));
          color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: inherit; box-shadow: 0 3px 12px rgba(0,102,255,0.28);
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .ag-save-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .ag-wrap { padding: 0 16px; }
          .ag-page-title { font-size: 22px; }
        }
      `}</style>

      <div className="ag-page">
        <div className="ag-wrap">

          {/* Page header */}
          <div className="ag-page-head">
            <div className="ag-page-title-row">
              <div className="ag-page-icon"><IcCalDot /></div>
              <h1 className="ag-page-title">Agenda de Servicios</h1>
            </div>
          </div>

          {/* Controls */}
          <div className="ag-controls">
            {["hoy", "semana", "mes"].map((v) => (
              <button key={v} className={`ag-view-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading / Error */}
          {loading && <div className="ag-state">Cargando agenda...</div>}
          {!loading && error && (
            <div className="ag-state error">
              {error}
              <br/>
              <button className="ag-retry-btn" onClick={fetchData}>Reintentar</button>
            </div>
          )}

          {/* ── VISTA HOY ── */}
          {!loading && !error && view === "hoy" && (
            <div className="ag-today">
              {hours.map((hour) => (
                <div key={hour} className="ag-hour-row">
                  <div className="ag-hour-label">{hour}</div>
                  <div className="ag-hour-orders">
                    {activeOrders
                      .filter((o) => o.hour === hour && o.date === hoyStr)
                      .map((order) => (
                        <OrderCard key={order.id} order={order} onEdit={setEditingOrder} onDelete={handleDeleteOrder} compact={false} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── VISTA SEMANA ── */}
          {!loading && !error && view === "semana" && (
            <div className="ag-week">
              <div className="ag-grid">
                {/* Header row */}
                <div className="ag-col-head" style={{ background: '#fff' }}>Hora</div>
                {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((day) => (
                  <div key={day} className="ag-col-head">{day}</div>
                ))}

                {/* Time + day cells */}
                {hours.map((hour) => (
                  <React.Fragment key={hour}>
                    <div className="ag-time-cell">{hour}</div>
                    {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((day) => {
                      const dayOrders = activeOrders.filter((o) => o.day === day && o.hour === hour);
                      return (
                        <div key={day} className="ag-day-cell">
                          {dayOrders.map((order) => (
                            <div key={order.id} className="ag-order-pill" onClick={() => setEditingOrder(order)}>
                              {order.service}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* ── VISTA MES ── */}
          {!loading && !error && view === "mes" && (
            <div className="ag-month">
              <div className="ag-month-nav">
                <button className="ag-month-btn"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                  ← Anterior
                </button>
                <h2 className="ag-month-title">
                  {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </h2>
                <button className="ag-month-btn"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                  Siguiente →
                </button>
              </div>

              <div className="ag-cal-grid">
                {daysOfWeek.map((d) => (
                  <div key={d} className="ag-cal-day-header">{d}</div>
                ))}
                {(() => {
                  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                  const cells = [];
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    cells.push(<div key={`e-${i}`} className="ag-cal-day empty" />);
                  }
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date      = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dayOrders = getOrdersForDate(date);
                    const isToday   = date.toDateString() === new Date().toDateString();
                    cells.push(
                      <div key={day} className={`ag-cal-day${isToday ? " today" : ""}`}>
                        <span className="ag-day-num">{day}</span>
                        {dayOrders.length > 0 && (
                          <span className="ag-day-orders-count">
                            {dayOrders.length} {dayOrders.length === 1 ? "orden" : "órdenes"}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>
          )}

        </div>
      </div>

      <FooterAdmin
        onGoDashboard={onGoDashboard} onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados} onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil}       onOpenReportes={onOpenReportes}
        kpiSnapshot={kpiSnapshot}
      />

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          employees={employees}
          onSave={handleSaveEdit}
          onCancel={() => setEditingOrder(null)}
        />
      )}
    </>
  );
};

// ── Subcomponents ─────────────────────────────────────────────────────────────
const OrderCard = ({ order, onEdit, onDelete, compact = false }) => {
  const sc = statusColor(order.estado);
  return (
    <div className="ag-order-card" style={{ borderLeftColor: sc }}>
      <div className="ag-order-service">{order.service}</div>
      <div className="ag-order-meta">
        <IcUser /> {order.employee}
        {!compact && <><span style={{ color: '#e0e8f5' }}>·</span><IcClock /> {order.hour}</>}
      </div>
      <div className="ag-order-actions">
        <button className="ag-action-btn edit" onClick={() => onEdit(order)}>
          <IcEdit /> Editar
        </button>
        <button className="ag-action-btn del" onClick={() => onDelete(order.id)}>
          <IcTrash /> Cancelar
        </button>
      </div>
    </div>
  );
};

const EditOrderModal = ({ order, employees, onSave, onCancel }) => {
  const [editedOrder, setEditedOrder] = useState({ ...order });
  return (
    <div className="ag-modal-overlay" onClick={onCancel}>
      <div className="ag-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ag-modal-head">
          <span className="ag-modal-title">Editar Orden</span>
          <button className="ag-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="ag-modal-body">
          <div className="ag-fg">
            <label>Servicio</label>
            <input type="text" value={editedOrder.service} disabled />
            <span className="ag-fg-hint">El servicio no se puede modificar</span>
          </div>
          <div className="ag-fg">
            <label>Cliente</label>
            <input type="text" value={editedOrder.client} disabled />
            <span className="ag-fg-hint">El cliente no se puede modificar</span>
          </div>
          <div className="ag-fg">
            <label>Empleado Asignado</label>
            <select value={editedOrder.employeeId ?? ""} onChange={(e) => setEditedOrder({ ...editedOrder, employeeId: e.target.value })}>
              <option value="">— Sin asignar —</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="ag-fg">
            <label>Hora</label>
            <input type="time" value={editedOrder.hour} onChange={(e) => setEditedOrder({ ...editedOrder, hour: e.target.value })} />
          </div>
        </div>
        <div className="ag-modal-foot">
          <button className="ag-cancel-btn" onClick={onCancel}>Cancelar</button>
          <button className="ag-save-btn" onClick={() => onSave(editedOrder)}>
            <IcSave /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Agenda;