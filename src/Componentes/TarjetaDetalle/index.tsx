import consultaSaldos from '../../Funciones/ExtraeSaldos/index'; // Asegúrate de que la ruta sea correcta
import React, { useEffect, useState } from 'react';
import extraccionManifiestos from '../../Funciones/ExtraerInfoApi/index';
import HashLoader from 'react-spinners/HashLoader';

import './estilos.css';

// Define las propiedades que el componente va a recibir
interface PropiedadesTarjetaDetalle {
  estadoFiltrar: string; // Parámetro para filtrar el estado
  tenedor: string; // Agregamos el parámetro tenedor
}

const TarjetaDetalle: React.FC<PropiedadesTarjetaDetalle> = ({ estadoFiltrar, tenedor }) => {
  const { manifiestosTodos, loading, error } = extraccionManifiestos();
  const [saldos, setSaldos] = useState<any[]>([]); // Estado para almacenar los saldos

  useEffect(() => {
    const fetchSaldos = async () => {
      try {
        // console.log("Consultando saldos para tenedor:", tenedor);
        const result = await consultaSaldos(tenedor);
        // console.log("Saldos obtenidos:", result);
        setSaldos(result); // Guardamos los saldos en el estado
      } catch (err) {
        console.error("Error al obtener saldos:", err);
      }
    };

    fetchSaldos();
  }, [tenedor]); // Solo se ejecuta cuando el tenedor cambia

  if (loading) {
    return (
      <div className="loading-container">    
        <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={true} />
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  // Filtrar los manifiestos según el estado proporcionado
  const manifiestosFiltrados = manifiestosTodos.filter(item => item.Estado_mft === estadoFiltrar);

  // Ordenar los manifiestos filtrados por el campo Fecha en orden descendente
  const manifiestosOrdenados = manifiestosFiltrados.sort((a, b) => {
    const fechaA = new Date(a.Fecha); // Convertir a objeto Date
    const fechaB = new Date(b.Fecha); // Convertir a objeto Date
    return fechaB.getTime() - fechaA.getTime(); // Comparar las fechas para orden descendente
  });

  return (
    <div className="contenedorManifiestos">
      {manifiestosOrdenados.length > 0 ? (
        manifiestosOrdenados.map((item, index) => {
          // Busca el saldo correspondiente al manifiesto
          const saldoItem = saldos.find(saldo => saldo.Manifiesto === item.Manif_numero) || {}; // Si no encuentra, usa un objeto vacío
          
          // Establece mostrarFechaPagoSaldo según el estado del manifiesto
          const mostrarFechaPagoSaldo = item.Estado_mft === 'LIQUIDADO';

          return (
            <div key={index} className="tarjeta-detalle">
              <h3>Manifiesto: {item.Manif_numero}</h3>
              <p>{item.Origen} - {item.Destino}</p>
              <p><strong>Placa:</strong> {item.Placa}</p>
              <p><strong>Fecha:</strong> {new Date(item.Fecha).toLocaleDateString('es-CO')}</p>
              <p><strong>Flete:</strong> {parseFloat(item.MontoTotal).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p><strong>ReteFuente:</strong> {parseFloat(item.ReteFuente).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p><strong>ReteICA:</strong> {parseFloat(item.ReteICA).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p><strong>Anticipo:</strong> {parseFloat(item.ValorAnticipado).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>                        
              {mostrarFechaPagoSaldo && (
                <>
                  <p><strong>Saldo:</strong> {parseFloat(saldoItem.Saldo || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p><strong>Fecha pago saldo:</strong> {saldoItem.Fecha_saldo ? new Date(saldoItem.Fecha_saldo).toLocaleDateString('es-CO') : 'Por definir'}</p>
                  <p><strong>Deducciones:</strong> {parseFloat(saldoItem.Deducciones || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p><strong>Causal:</strong> {saldoItem.causal || 'N/A'}</p>
                </>
              )}
            </div>
          );
        })
      ) : (
        <p>No hay manifiestos con el estado "{estadoFiltrar}".</p>
      )}
    </div>
  );
};

export default TarjetaDetalle;
