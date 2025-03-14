// import consultaSaldos from '../../Funciones/ExtraeSaldos/index';
// import consultaNovedades from '../../Funciones/ConsultaNovedades/index';
// import React, { useEffect, useState } from 'react';
// import extraccionManifiestos from '../../Funciones/ExtraerInfoApi/index';
// import HashLoader from 'react-spinners/HashLoader';

// import './estilos.css';

// interface PropiedadesTarjetaDetalle {
//   estadoFiltrar: string;
//   tenedor: string;
//   placaFiltrar: string; // Nueva prop para filtrar por placa
// }

// const TarjetaDetalle: React.FC<PropiedadesTarjetaDetalle> = ({ estadoFiltrar, tenedor, placaFiltrar }) => {
//   const { manifiestosTodos, loading, error } = extraccionManifiestos();
//   const [saldos, setSaldos] = useState<any[]>([]);
//   const [novedades, setNovedades] = useState<any[]>([]);
  
//   //saldos
//   useEffect(() => {
//     const fetchSaldos = async () => {
//       try {
//         const result = await consultaSaldos(tenedor);
//         setSaldos(result);
//       } catch (err) {
//         console.error("Error al obtener saldos:", err);
//       }
//     };

//     fetchSaldos();
//   }, [tenedor]);

//   //novedades
//   useEffect(() => {
//     const fetchNovedades = async () => {
//       try {
//         const result = await consultaNovedades(tenedor);
//         setNovedades(result);
//       } catch (err) {
//         console.error("Error al obtener saldos:", err);
//       }
//     };

//     fetchNovedades();
//   }, [tenedor]);



//   if (loading) {
//     return (
//       <div className="loading-container">
//         <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={true} />
//         <p>Cargando datos...</p>
//       </div>
//     );
//   }

//   if (error) return <p>Error: {error}</p>;

//   // Filtrar los manifiestos según el estado y la placa proporcionados
//   const manifiestosFiltrados = manifiestosTodos
//     .filter(item => item.Estado_mft === estadoFiltrar && (placaFiltrar === '' || item.Placa === placaFiltrar));

//   // Ordenar los manifiestos filtrados por el campo Fecha en orden descendente
//   const manifiestosOrdenados = manifiestosFiltrados.sort((a, b) => {
//     const fechaA = new Date(a.Fecha);
//     const fechaB = new Date(b.Fecha);
//     return fechaB.getTime() - fechaA.getTime();
//   });

//   return (
//     <div className="contenedorManifiestos">
//       {manifiestosOrdenados.length > 0 ? (
//         manifiestosOrdenados.map((item, index) => {
//           const saldoItem = saldos.find(saldo => saldo.Manifiesto === item.Manif_numero) || {};
//           const novedadesItem = novedades.find(novedad => novedad.Manifiesto === item.Manif_numero) || {};
//           const mostrarFechaPagoSaldo = item.Estado_mft === 'LIQUIDADO';

//           return (
//             <div key={index} className="tarjeta-detalle">
//               <h3>Manifiesto: {item.Manif_numero}</h3>
//               <p>{item.Origen} - {item.Destino}</p>
//               <p><strong>Placa:</strong> {item.Placa}</p>
//               <p><strong>Fecha:</strong> {new Date(item.Fecha).toLocaleDateString('es-CO')}</p>
//               <p><strong>Flete:</strong> {parseFloat(item.MontoTotal).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
//               <p><strong>ReteFuente:</strong> {parseFloat(item.ReteFuente).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
//               <p><strong>ReteICA:</strong> {parseFloat(item.ReteICA).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
//               <p><strong>Anticipo:</strong> {parseFloat(item.ValorAnticipado).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
//               <p><strong>Novedad:</strong> {novedadesItem.Novedad}</p>
//               {mostrarFechaPagoSaldo && (
//                 <>
//                   <p><strong>Saldo:</strong> {parseFloat(saldoItem.Saldo || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
//                   <p><strong>Fecha pago saldo:</strong> {saldoItem.Fecha_saldo ? new Date(saldoItem.Fecha_saldo).toLocaleDateString('es-CO') : 'Por definir'}</p>                  
//                 </>
//               )}
//             </div>
//           );
//         })
//       ) : (
//         <p>No hay manifiestos con el estado "{estadoFiltrar}" y la placa "{placaFiltrar}".</p>
//       )}
//     </div>
//   );
// };

// export default TarjetaDetalle;
