import React from 'react';
import Cotizar from './components/cotizar'; // Asegúrate que la ruta sea correcta
import CotizacionesCliente from './components/CotizacionesCliente';

function App() {
  return (
    <div className="App">
      {/* El componente Cotizaciones renderiza todo el contenido de la página:
        Header, Barra de búsqueda y la Cuadrícula de Servicios.
      */}
      <Cotizar/>

      
      
      
    </div>
  );
}

export default App;
