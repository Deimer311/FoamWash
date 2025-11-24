import React from "react";
import "./styles.css";

const App = () => {
  return (
    <div>
      <header>
        <h1>Sistema de Gestión de Servicios</h1>
        <nav>
          <label htmlFor="ordenes">Gestión de Órdenes</label>
          <label htmlFor="reportes">Reportes y Desempeño</label>
        </nav>
      </header>

      <input type="radio" name="menu" id="ordenes" defaultChecked />
      <input type="radio" name="menu" id="reportes" />

      {/* Sección Gestión de Órdenes */}
      <section id="gestion-ordenes" className="content">
        <div className="ordenes-container">
          <h2>Órdenes de Servicio</h2>
          <p>Gestiona y da seguimiento a todas las órdenes</p>

          <div className="columns">
            {/* Pendiente */}
            <div className="col pendiente">
              <h3>Pendiente</h3>
              <div className="card">
                <h4>Empresa ABC</h4>
                <span className="badge alta">Alta</span>
                <span className="badge tipo">Mantenimiento</span>
                <p className="fecha">📅 19/10/2025</p>
                <p className="desc">Revisión completa del sistema eléctrico</p>

                <label htmlFor="abrir-modal" className="btn-asignar">
                  👤 Asignar Personal
                  <input type="checkbox" id="abrir-modal" />
                  <div className="modal">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>Asignar Personal</h3>
                        <span className="cerrar">✖</span>
                      </div>
                      <p className="subtitulo">
                        Orden #1 - Empresa ABC (Mantenimiento)
                      </p>

                      <label className="label-buscar" htmlFor="buscar">
                        Buscar Personal
                      </label>
                      <input
                        type="text"
                        id="buscar"
                        placeholder="Buscar por nombre o ubicación..."
                      />

                      <div className="filtros">
                        <div>
                          <p>Disponibilidad</p>
                          <button className="activo">Todos</button>
                          <button>Disponibles</button>
                        </div>
                        <div>
                          <p>Especialidad</p>
                          <button className="activo">Todas</button>
                          <button>Mantenimiento</button>
                        </div>
                      </div>

                      <div className="personal-lista">
                        <div className="card">
                          <div className="info">
                            <p className="nombre">
                              👤 Juan Pérez{" "}
                              <span className="disponible">Disponible</span>
                            </p>
                            <p className="detalle">
                              🛠️ Mantenimiento · 📍 Zona Norte
                            </p>
                            <p className="tareas">Tareas activas: 2</p>
                          </div>
                          <button className="btn-asignar">Asignar</button>
                        </div>

                        <div className="card">
                          <div className="info">
                            <p className="nombre">
                              👤 María González{" "}
                              <span className="disponible">Disponible</span>
                            </p>
                            <p className="detalle">
                              ⚙️ Instalación · 📍 Zona Sur
                            </p>
                            <p className="tareas">Tareas activas: 1</p>
                          </div>
                          <button className="btn-asignar">Asignar</button>
                        </div>

                        <div className="card no-disponible">
                          <div className="info">
                            <p className="nombre">👤 Carlos Ruiz</p>
                            <p className="detalle">
                              🔧 Reparación · 📍 Zona Centro
                            </p>
                            <p className="tareas">Tareas activas: 5</p>
                          </div>
                          <button className="btn-asignar deshabilitado">
                            Asignar
                          </button>
                        </div>

                        <div className="card">
                          <div className="info">
                            <p className="nombre">
                              👤 Ana López{" "}
                              <span className="disponible">Disponible</span>
                            </p>
                            <p className="detalle">
                              💼 Consultoría · 📍 Zona Este
                            </p>
                            <p className="tareas">Tareas activas: 0</p>
                          </div>
                          <button className="btn-asignar">Asignar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* En Proceso */}
            <div className="col proceso">
              <h3>En Proceso</h3>
              <div className="card">
                <h4>Corporación XYZ</h4>
                <span className="badge media">Media</span>
                <span className="badge tipo">Instalación</span>
                <p className="fecha">📅 20/10/2025</p>
                <p className="personal">👤 Juan Pérez</p>
                <div className="progreso">
                  <div className="barra" style={{ width: "45%" }}></div>
                </div>
                <p className="desc">Instalación de nuevos equipos</p>
                <button className="btn-completar">Completar</button>
              </div>
            </div>

            {/* Finalizada */}
            <div className="col finalizada">
              <h3>Finalizada</h3>
              <div className="card">
                <h4>Tienda Local</h4>
                <span className="badge baja">Baja</span>
                <span className="badge tipo">Reparación</span>
                <p className="fecha">📅 21/10/2025</p>
                <p className="personal">👤 María González</p>
                <p className="desc">Reparación menor</p>
              </div>
            </div>
          </div>

          {/* Historial */}
          <div className="historial">
            <h3>Historial de Órdenes</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Prioridad</th>
                  <th>Fecha</th>
                  <th>Personal</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#1</td>
                  <td>Empresa ABC</td>
                  <td>Mantenimiento</td>
                  <td>
                    <span className="badge alta">Alta</span>
                  </td>
                  <td>19/10/2025</td>
                  <td>Sin asignar</td>
                  <td>
                    <span className="estado pendiente">Pendiente</span>
                  </td>
                </tr>
                <tr>
                  <td>#4</td>
                  <td>Hotel Premium</td>
                  <td>Consultoría</td>
                  <td>
                    <span className="badge alta">Alta</span>
                  </td>
                  <td>19/10/2025</td>
                  <td>Carlos Ruiz</td>
                  <td>
                    <span className="estado proceso">En Proceso</span>
                  </td>
                </tr>
                <tr>
                  <td>#2</td>
                  <td>Corporación XYZ</td>
                  <td>Instalación</td>
                  <td>
                    <span className="badge media">Media</span>
                  </td>
                  <td>20/10/2025</td>
                  <td>Juan Pérez</td>
                  <td>
                    <span className="estado proceso">En Proceso</span>
                  </td>
                </tr>
                <tr>
                  <td>#3</td>
                  <td>Tienda Local</td>
                  <td>Reparación</td>
                  <td>
                    <span className="badge baja">Baja</span>
                  </td>
                  <td>21/10/2025</td>
                  <td>María González</td>
                  <td>
                    <span className="estado finalizada">Finalizada</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sección Reportes y Desempeño */}
      <section id="reportes-desempeno" className="content">
        <h2>Reportes y Desempeño</h2>
        <p>Análisis y métricas del negocio</p>

        <div className="metrics">
          <div className="metric">
            Total Reservas<br />
            <strong>156</strong>
            <br />
            <small>+12.5% vs mes anterior</small>
          </div>
          <div className="metric">
            Servicios Completados<br />
            <strong>98</strong>
            <br />
            <small>+8.3% vs mes anterior</small>
          </div>
          <div className="metric">
            Ingresos Totales<br />
            <strong>$45.780</strong>
            <br />
            <small>+15.2% vs mes anterior</small>
          </div>
          <div className="metric">
            Desempeño Promedio<br />
            <strong>87.5%</strong>
            <br />
            <small>-2.1% vs mes anterior</small>
          </div>
        </div>

        <div className="charts">
          <div className="chart">
            <h4>Ingresos y Servicios</h4>
            <img
              src="https://dummyimage.com/400x200/ddd/555&text=Gráfica+Ingresos+vs+Servicios"
              alt="Gráfica ingresos"
            />
          </div>
          <div className="chart">
            <h4>Distribución por Tipo de Servicio</h4>
            <img
              src="https://dummyimage.com/300x200/ddd/555&text=Gráfico+de+Pastel"
              alt="Gráfico pastel"
            />
          </div>
        </div>

        <div className="chart">
          <h4>Desempeño por Empleado</h4>
          <img
            src="https://dummyimage.com/500x200/ddd/555&text=Gráfico+Barras"
            alt="Gráfico barras"
          />
        </div>

        <div className="insights">
          <div className="alert alerta">
            ⚠ La productividad del personal ha disminuido 2.1% este mes
          </div>
          <div className="alert verde">
            📈 Los ingresos han aumentado 15.2% comparado con el mes anterior
          </div>
          <div className="alert azul">
            🔍 Alta demanda de servicios de mantenimiento en Zona Norte
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;