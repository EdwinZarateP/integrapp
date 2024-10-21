import React from 'react';
import extraccionManifiestos from '../../Funciones/ExtraerInfoApi/index';
import './estilos.css';

// Define las propiedades que el componente va a recibir
interface PropiedadesTarjetaDetalle {
  estadoFiltrar: string; // Parámetro para filtrar el estado
}

const TarjetaDetalle: React.FC<PropiedadesTarjetaDetalle> = ({ estadoFiltrar }) => {
  const { manifiestosTodos, loading, error } = extraccionManifiestos();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Filtrar los manifiestos según el estado proporcionado
  const manifiestosFiltrados = manifiestosTodos.filter(item => item.Estado_mft === estadoFiltrar);

  return (
    <div className="contenedorManifiestos">
      {manifiestosFiltrados.length > 0 ? (
        manifiestosFiltrados.map((item, index) => (
          <div key={index} className="tarjeta-detalle">
            <h3>Manifiesto: {item.Manif_numero}</h3>
            <p><strong>Placa:</strong> {item.Placa}</p>
            <p><strong>Estado_mft:</strong> {item.Estado_mft}</p>
            <p><strong>Fecha:</strong> {item.Fecha}</p>
            <p><strong>Origen:</strong> {item.Origen}</p>
            <p><strong>Destino:</strong> {item.Destino}</p>
            <p><strong>MontoTotal:</strong> {item.MontoTotal}</p>
            <p><strong>ReteFuente:</strong> {item.ReteFuente}</p>
            <p><strong>ReteICA:</strong> {item.ReteICA}</p>
            <p><strong>ValorAnticipado:</strong> {item.ValorAnticipado}</p>
          </div>
        ))
      ) : (
        <p>No hay manifiestos con el estado "{estadoFiltrar}".</p>
      )}
    </div>
  );
};

export default TarjetaDetalle;
