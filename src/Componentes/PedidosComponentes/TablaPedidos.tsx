import React, { useState, useEffect, useLayoutEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import {
  listarPedidosVehiculos,
  autorizarPorConsecutivoVehiculo,
  eliminarPedidosPorConsecutivoVehiculo,
} from '../../Funciones/ApiPedidos/apiPedidos';
import './TablaPedidos.css';

const formatoMoneda = (v: number) =>
  v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
const estadosDisponibles = ['AUTORIZADO', 'REQUIERE AUTORIZACION', 'COMPLETADO'];
const regionesDisponibles = ['FUNZA', 'KABI', 'GIRARDOTA', 'BUCARAMANGA', 'CALI', 'BARRANQUILLA'];

const TablaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandido, setExpandido] = useState<Set<string>>(new Set());
  const perfil = Cookies.get('perfilPedidosCookie') || '';
  const usuario = Cookies.get('usuarioPedidosCookie') || '';
  const regionalUsuario = Cookies.get('regionalPedidosCookie') || '';
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroRegional, setFiltroRegional] = useState('TODOS');
  const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
  const [esPantallaGrande, setEsPantallaGrande] = useState(window.innerWidth >= 900);
  

  // Detectar cambios en el tamaño de la pantalla
  useLayoutEffect(() => {
    const actualizarTamañoPantalla = () => {
      setEsPantallaGrande(window.innerWidth >= 900);
    };
    window.addEventListener('resize', actualizarTamañoPantalla);
    return () => window.removeEventListener('resize', actualizarTamañoPantalla);
  }, []);

  const obtenerPedidos = async () => {
    setCargando(true);
    const filtros: any = {
      estados: filtroEstado === 'TODOS' ? estadosDisponibles : [filtroEstado],
    };
    if (['ADMIN', 'GERENTE', 'ANALISTA'].includes(perfil)) {
      if (filtroRegional !== 'TODOS') filtros.regionales = [filtroRegional];
    } else {
      filtros.regionales = [regionalUsuario];
    }
    try {
      const res = await listarPedidosVehiculos(usuario, filtros);
      setPedidos(res);
    } catch (e: any) {
      Swal.fire('Error', e.response?.data?.detail || e.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { 
    obtenerPedidos(); 
  }, []);

  const manejarExpandir = (id: string) => {
    const copia = new Set(expandido);
    copia.has(id) ? copia.delete(id) : copia.add(id);
    setExpandido(copia);
  };

  const manejarAutorizar = async (consec: string) => {
    try {
      await autorizarPorConsecutivoVehiculo([consec], usuario);
      Swal.fire('Listo', 'Vehículo autorizado', 'success');
      obtenerPedidos();
    } catch (e: any) {
      Swal.fire('Error', e.response?.data?.detail || e.message, 'error');
    }
  };

  const manejarEliminar = async (consec: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar vehículo?',
      text: consec,
      icon: 'warning',
      showCancelButton: true,
    });
    if (isConfirmed) {
      try {
        await eliminarPedidosPorConsecutivoVehiculo(consec, usuario);
        Swal.fire('Eliminado', 'Vehículo eliminado', 'success');
        obtenerPedidos();
      } catch (e: any) {
        Swal.fire('Error', e.response?.data?.detail || e.message, 'error');
      }
    }
  };

  return (
    <div className="TablaPedidos-contenedor">
      {/* Filtros para pantalla grande */}
      {esPantallaGrande && (
        <div className="TablaPedidos-filtros">
          {['ADMIN', 'GERENTE', 'ANALISTA'].includes(perfil) && (
            <select value={filtroRegional} onChange={e => setFiltroRegional(e.target.value)}>
              <option value="TODOS">Todas regionales</option>
              {regionesDisponibles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="TODOS">Todos estados</option>
            {estadosDisponibles.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <button onClick={obtenerPedidos}>Filtrar</button>
        </div>
      )}
      
      {/* Botón para mostrar filtros en pantalla pequeña */}
      {!esPantallaGrande && (
        <button 
          className="TablaPedidos-btn-filtros-mobile"
          onClick={() => setMostrarModalFiltros(true)}
        >
          Filtros
        </button>
      )}

      {/* Modal para filtros en pantalla pequeña */}
      {mostrarModalFiltros && !esPantallaGrande && (
        <div className="TablaPedidos-modal-filtros">
          <div className="TablaPedidos-modal-contenido">
            {['ADMIN', 'GERENTE', 'ANALISTA'].includes(perfil) && (
              <select value={filtroRegional} onChange={e => setFiltroRegional(e.target.value)}>
                <option value="TODOS">Todas regionales</option>
                {regionesDisponibles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="TODOS">Todos estados</option>
              {estadosDisponibles.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <div className="TablaPedidos-modal-botones">
              <button onClick={obtenerPedidos}>Filtrar</button>
              <button onClick={() => setMostrarModalFiltros(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="TablaPedidos-tabla-container">
          <table className="TablaPedidos-table">
            <thead className='TablaPedidos-table-titulos'>
              <tr>
                <th></th>
                <th>Vehículo</th>
                <th>Acciones</th>
                <th>Tipo</th>
                <th>Destino Final</th>
                <th>Estados</th>
                <th>Puntos</th>
                <th>Kilos</th>
                <th>Flete Teorico</th>
                <th>Car/desc Teorico</th>
                <th>Pto Adic Teórico</th>                
                <th>Total Teórico</th>   
                <th>Flete Solicitado</th>
                <th>Cargue</th>
                <th>Pto Adic Solicitado</th>
                <th>Desvío</th>   
                <th>Total Solicitado</th>                             
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(g => (
                <React.Fragment key={g.consecutivo_vehiculo}>
                  <tr className={
                    `${expandido.has(g.consecutivo_vehiculo) ? 'TablaPedidos-row--expanded' : ''} ` +
                    `${g.estados.includes('REQUIERE AUTORIZACION') ? 'TablaPedidos-row--requires-auth' : ''}`
                  }>
                    <td><button onClick={() => manejarExpandir(g.consecutivo_vehiculo)}>
                      {expandido.has(g.consecutivo_vehiculo) ? '−' : '+'}
                    </button></td>
                    <td>{g.consecutivo_vehiculo}</td>
                    <td>
                      {g.estados.includes('REQUIERE AUTORIZACION') && ['ADMIN', 'GERENTE'].includes(perfil) && (
                        <button className="TablaPedidos-btn-autorizar" onClick={() => manejarAutorizar(g.consecutivo_vehiculo)}>
                          Autorizar
                        </button>
                      )}
                      {['ADMIN', 'OPERADOR'].includes(perfil) && (
                        <button className="TablaPedidos-btn-eliminar" onClick={() => manejarEliminar(g.consecutivo_vehiculo)}>
                          Eliminar
                        </button>
                      )}
                    </td>
                    <td>{g.tipo_vehiculo.split('_')[0]}</td>
                    <td>{g.destino}</td>
                    <td>{g.estados.join(', ')}</td>
                    <td>{g.total_puntos_vehiculo}</td>
                    <td>{g.total_kilos_vehiculo}</td>
                    <td>{formatoMoneda(g.valor_flete_sistema)}</td>
                    <td>{formatoMoneda(g.total_cargue_descargue_teorico)}</td>
                    <td>{formatoMoneda(g.total_punto_adicional_teorico)}</td>                    
                    <td>{formatoMoneda(g.costo_teorico_vehiculo)}</td> 
                    <td>{formatoMoneda(g.total_flete_solicitado)}</td>                                        
                    <td>{formatoMoneda(g.total_cargue_descargue)}</td>                                   
                    <td>{formatoMoneda(g.total_punto_adicional)}</td>                    
                    <td>{formatoMoneda(g.total_desvio_vehiculo || 0)}</td>
                    <td>{formatoMoneda(g.costo_real_vehiculo)}</td>                    
                    <td className={g.diferencia_flete > 0 ? 'TablaPedidos-cell--error' : ''}>
                      {formatoMoneda(g.diferencia_flete)}
                    </td>
                  </tr>
                  {expandido.has(g.consecutivo_vehiculo) && (
                    <tr className="TablaPedidos-details">
                      <td colSpan={19}>
                        <table className="TablaPedidos-subtable">
                          <thead>
                            <tr>
                              <th>Pedido</th><th>Origen</th><th>Destino Real</th><th>Cliente</th>
                              <th>Destinatario</th><th>Kilos</th><th>Entregas</th><th>Observaciones</th><th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.pedidos.map((p: any) => (
                              <tr key={p.id}>
                                <td>{p.consecutivo_integrapp}</td>
                                <td>{p.origen}</td>
                                <td>{p.destino_real}</td>
                                <td>{p.cliente_nombre}</td>
                                <td>{p.ubicacion_descargue}</td>                                
                                <td>{p.num_kilos}</td>
                                <td>{p.planilla_siscore}</td>
                                <td>{p.observaciones}</td>
                                <td>{p.estado}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaPedidos;