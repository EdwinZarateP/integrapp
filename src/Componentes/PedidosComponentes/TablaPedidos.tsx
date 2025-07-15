// src/Componentes/TablaPedidos.tsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import {
  listarPedidosVehiculos,
  autorizarPorConsecutivoVehiculo,
  eliminarPedidosPorConsecutivoVehiculo,
  ListarVehiculosResponse
} from '../../Funciones/ApiPedidos/apiPedidos';
import './TablaPedidos.css';

const regionalOptions = ['FUNZA', 'GIRARDOTA', 'BUCARAMANGA', 'CALI', 'BARRANQUILLA'];
const estadoOptions = ['AUTORIZADO', 'REQUIERE AUTORIZACION', 'COMPLETADO'];

const TablaPedidos: React.FC = () => {
  const [data, setData] = useState<ListarVehiculosResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [regionalFiltro, setRegionalFiltro] = useState<string>(Cookies.get('regionalPedidosCookie') || '');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');

  const perfil = Cookies.get('perfilPedidosCookie') || '';
  const usuario = Cookies.get('usuarioPedidosCookie') || '';
  const usuarioRegional = Cookies.get('regionalPedidosCookie') || '';

  const buildFiltros = () => {
    const filtros: any = {};
    // Estado
    if (estadoFiltro !== 'TODOS') filtros.estados = [estadoFiltro];
    else filtros.estados = [...estadoOptions];
    // Regional
    if (['ADMIN', 'GERENTE', 'ANALISTA'].includes(perfil)) {
      if (regionalFiltro !== 'TODOS') filtros.regionales = [regionalFiltro];
    } else {
      filtros.regionales = [usuarioRegional];
    }
    return filtros;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const filtros = buildFiltros();
      const res = await listarPedidosVehiculos(usuario, filtros);
      setData(res);
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleExpand = (id: string) => {
    const copy = new Set(expanded);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setExpanded(copy);
  };

  const handleAutorizar = async (consec: string) => {
    try {
      await autorizarPorConsecutivoVehiculo([consec], usuario);
      Swal.fire('Listo', 'Vehículo autorizado', 'success');
      fetchData();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.detail || err.message, 'error');
    }
  };

  const handleEliminar = async (consec: string) => {
    const confirm = await Swal.fire({
      title: '¿Confirmar eliminación?',
      text: `Vehículo ${consec}`,
      icon: 'warning',
      showCancelButton: true
    });
    if (confirm.isConfirmed) {
      try {
        await eliminarPedidosPorConsecutivoVehiculo(consec, usuario);
        Swal.fire('Eliminado', 'Vehículo eliminado', 'success');
        fetchData();
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.detail || err.message, 'error');
      }
    }
  };

  return (
    <div className="TablaPedidos-contenedor">
      <div className="TablaPedidos-filtros">
        {['ADMIN','GERENTE','ANALISTA'].includes(perfil) && (
          <select value={regionalFiltro} onChange={e => setRegionalFiltro(e.target.value)}>
            <option value="TODOS">Todas las regionales</option>
            {regionalOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
        <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
          <option value="TODOS">Todos los estados</option>
          {estadoOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="TablaPedidos-button" onClick={fetchData}>Filtrar</button>
      </div>

      {loading ? (
        <p className="TablaPedidos-loading">Cargando...</p>
      ) : (
        <div className="TablaPedidos-wrapper">
          <table className="TablaPedidos-table">
            <thead>
              <tr>
                <th></th>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Estados</th>
                <th>Total Cajas</th>
                <th>Total Kilos</th>
                <th>Total Flete</th>
                <th>Vlr. Flete Sistema</th>
                <th>Diferencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(group => (
                <React.Fragment key={group.consecutivo_vehiculo}>
                  <tr className={
                    `${expanded.has(group.consecutivo_vehiculo)? 'TablaPedidos-row--expanded':''} ` +
                    `${group.diferencia_flete>0&&group.estados.includes('REQUIERE AUTORIZACION')? 'TablaPedidos-row--alert':''}`
                  }>
                    <td>
                      <button
                        className="TablaPedidos-expand"
                        onClick={() => toggleExpand(group.consecutivo_vehiculo)}
                      >{expanded.has(group.consecutivo_vehiculo) ? '−' : '+'}</button>
                    </td>
                    <td>{group.consecutivo_vehiculo}</td>
                    <td>{group.tipo_vehiculo}</td>
                    <td>{group.estados.join(', ')}</td>
                    <td>{group.total_cajas_vehiculo}</td>
                    <td>{group.total_kilos_vehiculo}</td>
                    <td>{group.total_flete_vehiculo?.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0})}</td>
                    <td>{group.valor_flete_sistema?.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0})}</td>
                    <td className={group.diferencia_flete>0?'TablaPedidos-cell--error':''}>
                      {group.diferencia_flete?.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0})}
                    </td>
                    <td>
                      {group.estados.includes('REQUIERE AUTORIZACION') && ['ADMIN','GERENTE'].includes(perfil) && (
                        <button className="TablaPedidos-button" onClick={()=>handleAutorizar(group.consecutivo_vehiculo)}>
                          Autorizar
                        </button>
                      )}
                      {['ADMIN','OPERADOR'].includes(perfil) && (
                        <button className="TablaPedidos-button TablaPedidos-button--eliminar" onClick={()=>handleEliminar(group.consecutivo_vehiculo)}>
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded.has(group.consecutivo_vehiculo) && (
                    <tr className="TablaPedidos-details">
                      <td colSpan={10}>
                        <table className="TablaPedidos-subtable">
                          <thead>
                            <tr>
                              <th>Pedido</th><th>Origen</th><th>Destino</th><th>Punto</th>
                              <th>Cliente</th><th>Cajas</th><th>Kilos</th>
                              <th>Desvíos</th><th>Pto. Adicional</th><th>Cargue/Desc.</th>
                              <th>Obs.</th><th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.pedidos.map(p=>(
                              <tr key={p.id}>
                                <td>{p.consecutivo_integrapp}</td>
                                <td>{p.origen}</td>
                                <td>{p.destino}</td>
                                <td>{p.ubicacion_descargue}</td>
                                <td>{p.cliente_nombre}</td>
                                <td>{p.num_cajas}</td>
                                <td>{p.num_kilos}</td>
                                <td>{p.desvio}</td>
                                <td>{p.punto_adicional}</td>
                                <td>{p.cargue_descargue}</td>
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
