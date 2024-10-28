import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import BotonSencillo from '../../Componentes/BotonSencillo';
import './estilos.css';
import TarjetaDetalle from '../../Componentes/TarjetaDetalle/index';
import { ContextoApp } from '../../Contexto/index';
import extraccionManifiestos from '../../Funciones/ExtraerInfoApi/index';

const DetalleManifiestos = () => {
  const almacenVariables = useContext(ContextoApp);
  const { manifiestosTodos, loading, error } = extraccionManifiestos();
  const [placaSeleccionada, setPlacaSeleccionada] = useState(''); // Estado para la placa seleccionada

  // Obtiene la primera palabra del nombre en mayúscula
  const obtenerPrimeraPalabra = (nombre = '') => 
    nombre ? nombre.split(' ')[0].charAt(0).toUpperCase() + nombre.split(' ')[0].slice(1) : 'Usuario';

  // Extrae las placas únicas cuando los datos están cargados y no hay errores
  const placasUnicas = !loading && !error 
    ? [...new Set(manifiestosTodos.map(manifiesto => manifiesto.Placa))] 
    : [];

  return (
    <div className='detalle-manifiestos'>
      <header className='detalle-manifiestos__cabecera'>
        <h5>{obtenerPrimeraPalabra(almacenVariables?.estado)}S</h5>
      </header>

      {error ? (
        <p className="detalle-manifiestos__error">Error: {error}</p>
      ) : (
        <section className="detalle-manifiestos__contenido">
          {/* Selector de placas (muestra solo cuando los datos están listos) */}
          {!loading && (
            <div className="detalle-manifiestos__selector-placas">
              <label htmlFor="placas">Placa:</label>
              <select 
                id="placas" 
                name="placas" 
                value={placaSeleccionada} 
                onChange={(e) => setPlacaSeleccionada(e.target.value)} // Actualiza la placa seleccionada
              >
                <option value="">Todas</option>
                {placasUnicas.map((placa, index) => (
                  <option key={index} value={placa}>
                    {placa}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Componente de detalle, pasa la placa seleccionada como prop */}
          <div className="detalle-manifiestos__tarjeta">
            <TarjetaDetalle 
              estadoFiltrar={almacenVariables?.estado || ''}
              tenedor={almacenVariables?.tenedor || ''} 
              placaFiltrar={placaSeleccionada} // Nueva prop para filtrar por placa
            />
          </div>

          {/* Mensaje de carga */}
          {loading && <p className="detalle-manifiestos__loading">Cargando datos...</p>}

          <Link to="/SeleccionEstados" className='detalle-manifiestos__link'>
            <BotonSencillo type="button" texto="Volver" colorClass="rojo"/>            
          </Link>
        </section>
      )}
    </div>
  );
};

export default DetalleManifiestos;
