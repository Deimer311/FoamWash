import React, { useState } from "react";
import FooterAdmin from './FooterAdmin';

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const hours = Array.from({ length: 13 }, (_, i) => `${6 + i}:00`);

const ordersMock = [
  {
    id: 1,
    day: "Lunes",
    hour: "08:00",
    service: "Lavado de muebles",
    employee: "Edilberto González",
    employeeId: "emp1",
    client: "María Rodríguez",
    address: "Cra 10 #20-30",
    date: "2026-01-27"
  },
  {
    id: 2,
    day: "Lunes",
    hour: "09:00",
    service: "Limpieza sillas de comedor",
    employee: "Juan Andrés",
    employeeId: "emp2",
    client: "Carlos Pérez",
    address: "Av 68 #45-12",
    date: "2026-01-27"
  },
  {
    id: 3,
    day: "Martes",
    hour: "11:00",
    service: "Lavado de cortinas",
    employee: "Edilberto González",
    employeeId: "emp1",
    client: "Ana López",
    address: "Cl 80 #15-50",
    date: "2026-01-28"
  },
];

const availableEmployees = [
  { id: "emp1", name: "Edilberto González" },
  { id: "emp2", name: "Juan Andrés" },
  { id: "emp3", name: "Pedro Martínez" },
];

const Agenda = ({
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,
  onLogout,
  onOpenReportes
}) => {
  const [view, setView] = useState("semana");
  const [orders, setOrders] = useState(ordersMock);
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("¿Estás seguro de eliminar esta orden?")) {
      try {
        await api.put(`/reservas/${orderId}`, { Estado: 'Cancelado' });
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (err) {
        console.error('Error cancelando orden:', err);
        alert('No se pudo cancelar la orden');
      }
    }
  };

  const handleSaveEdit = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditingOrder(null);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getOrdersForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return orders.filter(o => o.date === dateStr);
  };

  // KPI snapshot para el footer (datos reales)
  const hoyStr = new Date().toISOString().split('T')[0];
  const kpiSnapshot = {
    ordeneHoy:        orders.filter(o => o.date === hoyStr).length,
    ordensPendientes: orders.filter(o => o.estado === 'Pendiente').length,
    empleadosActivos: availableEmployees.length,
    ingresosMes:      `${orders.filter(o => o.estado === 'Completado').length} completadas`
  };

  return (
    <>
      <style>{`
        :root {
          --primary: #0066FF;
          --primary-dark: #0052CC;
          --primary-light: #E6F2FF;
          --success: #00C853;
          --warning: #FF9800;
          --danger: #F44336;
          --text-primary: #1a1a1a;
          --text-secondary: #666666;
          --bg-primary: #FFFFFF;
          --bg-secondary: #F8F9FA;
          --border-color: #E0E0E0;
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
        }

        .agenda-wrapper {
          min-height: 100vh;
          padding: 2rem 1rem;
          background: var(--bg-secondary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .agenda-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .agenda-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .agenda-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .agenda-controls {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .view-button {
          padding: 0.75rem 2rem;
          border-radius: var(--radius-lg);
          border: 2px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .view-button:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .view-button.active {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border-color: transparent;
          box-shadow: var(--shadow-md);
        }

        /* Vista HOY */
        .today-view {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-md);
        }

        .hour-row {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 1.5rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .hour-row:last-child {
          border-bottom: none;
        }

        .hour-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .hour-orders {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Vista SEMANA */
        .week-view {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          overflow-x: auto;
        }

        .agenda-grid {
          display: grid;
          grid-template-columns: 80px repeat(7, minmax(140px, 1fr));
          gap: 8px;
          min-width: 1100px;
        }

        .hours-column,
        .day-column {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .hour-header,
        .day-header {
          text-align: center;
          padding: 1rem 0.5rem;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--primary-light);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }

        .hour-cell {
          min-height: 60px;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
          border-bottom: 1px solid var(--border-color);
        }

        .day-cell {
          min-height: 60px;
          padding: 4px;
          border-bottom: 1px solid var(--border-color);
          position: relative;
        }

        /* Vista MES - Calendario Real */
        .month-view {
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .month-header {
          margin-bottom: 1.5rem;
        }

        .month-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .month-nav button {
          padding: 0.5rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .month-nav button:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .month-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: capitalize;
          margin: 0;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }

        .calendar-day-header {
          text-align: center;
          font-weight: 700;
          color: var(--text-primary);
          padding: 1rem 0.5rem;
          background: var(--primary-light);
          border-radius: var(--radius-sm);
        }

        .calendar-day {
          min-height: 100px;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 2px solid var(--border-color);
          position: relative;
          transition: all 0.3s ease;
        }

        .calendar-day:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .calendar-day.empty {
          background: transparent;
          border-color: transparent;
        }

        .calendar-day.today {
          background: var(--primary-light);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .day-number {
          display: inline-block;
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .day-orders-count {
          display: block;
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 600;
          margin-top: 0.5rem;
        }

        /* Order Card */
        .order-card {
          background: white;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          border-left: 4px solid var(--primary);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .order-card-title {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .order-card-employee {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .order-card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .order-action-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--warning);
          color: white;
        }

        .order-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .order-action-btn.delete {
          background: var(--danger);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: var(--radius-lg);
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: var(--shadow-lg);
        }

        .modal h2 {
          margin: 0 0 1.5rem 0;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .info-text {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-btn,
        .save-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .save-btn {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
        }

        .cancel-btn:hover,
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 768px) {
          .agenda-grid {
            grid-template-columns: 60px repeat(7, minmax(100px, 1fr));
          }

          .calendar-day {
            min-height: 80px;
          }
        }
      `}</style>

      <div className="agenda-wrapper">
        <div className="agenda-container">
          
          <div className="agenda-header">
            <h1 className="agenda-title">Agenda de Servicios</h1>
          </div>

          <div className="agenda-controls">
            <button
              className={`view-button ${view === "hoy" ? "active" : ""}`}
              onClick={() => setView("hoy")}
            >
              Hoy
            </button>
            <button
              className={`view-button ${view === "semana" ? "active" : ""}`}
              onClick={() => setView("semana")}
            >
              Semana
            </button>
            <button
              className={`view-button ${view === "mes" ? "active" : ""}`}
              onClick={() => setView("mes")}
            >
              Mes
            </button>
          </div>

          {/* VISTA HOY */}
          {view === "hoy" && (
            <div className="today-view">
              {hours.map((hour) => (
                <div key={hour} className="hour-row">
                  <span className="hour-label">{hour}</span>
                  <div className="hour-orders">
                    {orders
                      .filter((o) => o.hour === hour)
                      .map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onEdit={setEditingOrder}
                          onDelete={handleDeleteOrder}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA SEMANA */}
          {view === "semana" && (
            <div className="week-view">
              <div className="agenda-grid">
                <div className="hours-column">
                  <div className="hour-header">Hora</div>
                  {hours.map((hour) => (
                    <div key={hour} className="hour-cell">
                      {hour}
                    </div>
                  ))}
                </div>

                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
                  <div key={day} className="day-column">
                    <div className="day-header">{day}</div>
                    {hours.map((hour) => (
                      <div key={hour} className="day-cell">
                        {orders
                          .filter((o) => o.day === day && o.hour === hour)
                          .map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              onEdit={setEditingOrder}
                              onDelete={handleDeleteOrder}
                            />
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA MES - Calendario */}
          {view === "mes" && (
            <div className="month-view">
              <div className="month-header">
                <div className="month-nav">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                    ← Anterior
                  </button>
                  <h2 className="month-title">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                    Siguiente →
                  </button>
                </div>
              </div>

              <div className="calendar-grid">
                {daysOfWeek.map((day) => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {(() => {
                  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                  const days = [];
                  
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
                  }
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dayOrders = getOrdersForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    days.push(
                      <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                        <span className="day-number">{day}</span>
                        {dayOrders.length > 0 && (
                          <span className="day-orders-count">
                            📋 {dayOrders.length} {dayOrders.length === 1 ? 'orden' : 'órdenes'}
                          </span>
                        )}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Admin integrado */}
      <FooterAdmin
        onGoDashboard={onGoDashboard}
        onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados}
        onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil}
        onOpenReportes={onOpenReportes}
        kpiSnapshot={kpiSnapshot}
      />

      {/* MODAL DE EDICIÓN */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          employees={availableEmployees}
          onSave={handleSaveEdit}
          onCancel={() => setEditingOrder(null)}
        />
      )}
    </>
  );
};

const OrderCard = ({ order, onEdit, onDelete }) => {
  return (
    <div className="order-card">
      <div className="order-card-title">{order.service}</div>
      <div className="order-card-employee">👤 {order.employee}</div>
      <div className="order-card-actions">
        <button className="order-action-btn" onClick={() => onEdit(order)}>
          ✏️ Editar
        </button>
        <button className="order-action-btn delete" onClick={() => onDelete(order.id)}>
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

const EditOrderModal = ({ order, employees, onSave, onCancel }) => {
  const [editedOrder, setEditedOrder] = useState({ ...order });

  const handleSave = () => {
    const selectedEmployee = employees.find(emp => emp.id === editedOrder.employeeId);
    if (selectedEmployee) {
      editedOrder.employee = selectedEmployee.name;
    }
    onSave(editedOrder);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>✏️ Editar Orden</h2>
        
        <div className="form-group">
          <label>Servicio</label>
          <input
            type="text"
            value={editedOrder.service}
            disabled
            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
          />
          <span className="info-text">El servicio no se puede modificar</span>
        </div>

        <div className="form-group">
          <label>Cliente</label>
          <input
            type="text"
            value={editedOrder.client}
            disabled
            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
          />
          <span className="info-text">El cliente no se puede modificar</span>
        </div>

        <div className="form-group">
          <label>Empleado Asignado</label>
          <select
            value={editedOrder.employeeId}
            onChange={(e) => setEditedOrder({ ...editedOrder, employeeId: e.target.value })}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Hora</label>
          <input
            type="time"
            value={editedOrder.hour}
            onChange={(e) => setEditedOrder({ ...editedOrder, hour: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button className="save-btn" onClick={handleSave}>
            💾 Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Agenda;