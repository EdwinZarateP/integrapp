// src/Componentes/TablaPedidosCompletados.tsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import {
  listarVehiculosCompletados,
  exportarCompletados,
  ListarCompletadosResponse
} from '../../Funciones/ApiPedidos/apiPedidos';
import './TablaPedidosCompletados.css';

const formatoMoneda = (v?: number | string | null) => {
  const n = Number(v ?? 0);            // convierte strings y maneja null/undefined
  if (!Number.isFinite(n)) return '—'; // fallback si viene algo raro
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });
};

// (opcional) helper para números "crudos" que muestras sin $:
const numeroSeguro = (v?: number | string | null) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const regionesDisponibles = [
  'FUNZA',
  'CELTA',
  'GIRARDOTA',
  'BUCARAMANGA',
  'CALI',
  'BARRANQUILLA'
];

const TablaPedidosCompletados: React.FC = () => {
  const perfil = Cookies.get('perfilPedidosCookie') || '';
  const usuario = Cookies.get('usuarioPedidosCookie') || '';
  const usuarioRegional = Cookies.get('regionalPedidosCookie') || '';
  const today = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState<ListarCompletadosResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [regionalFiltro, setRegionalFiltro] = useState<string>(
    ['ADMIN', 'CONTROL', 'ANALISTA'].includes(perfil) ? 'TODOS' : usuarioRegional
  );
  const [fechaInicial, setFechaInicial] = useState<string>(today);
  const [fechaFinal, setFechaFinal] = useState<string>(today);

  const buildFiltros = () => {
    const filtros: any = {};
    if (['ADMIN', 'CONTROL', 'ANALISTA'].includes(perfil)) {
      if (regionalFiltro !== 'TODOS') filtros.regionales = [regionalFiltro];
    } else {
      filtros.regionales = [usuarioRegional];
    }
    return filtros;
  };

  const fetchData = async () => {
    if (!fechaInicial || !fechaFinal) {
      Swal.fire('Error', 'Selecciona fecha inicial y final', 'warning');
      return;
    }
    if (new Date(fechaInicial) > new Date(fechaFinal)) {
      Swal.fire('Error', 'La fecha inicial no puede ser posterior a la fecha final', 'warning');
      return;
    }
    setLoading(true);
    try {
      const filtros = buildFiltros();
      const res = await listarVehiculosCompletados(
        usuario,
        fechaInicial,
        fechaFinal,
        filtros
      );

      if (!res || res.length === 0) {
        setData([]);
        // Swal.fire('Sin resultados', 'No se encontraron pedidos completados en este rango de fechas', 'info');
        return;
      }

      setData(res);
    } catch (err: any) {
      setData([]);
      const status = err.response?.status;
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message;

      if (status === 404 && /No se encontraron vehículos COMPLETADOS/i.test(detail || '')) {
        Swal.fire('Sin resultados', 'No se encontraron vehículos COMPLETADOS en ese rango.', 'info');
      } else {
        Swal.fire('Error', detail, 'error');
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchData();
  }, []);

  const handleExportar = async () => {
    if (!fechaInicial || !fechaFinal) {
      Swal.fire('Error', 'Selecciona fecha inicial y final', 'warning');
      return;
    }
    if (new Date(fechaInicial) > new Date(fechaFinal)) {
      Swal.fire('Error', 'La fecha inicial no puede ser posterior a la fecha final', 'warning');
      return;
    }
    try {
      const filtros = buildFiltros();
      const blob = await exportarCompletados(
        usuario,
        fechaInicial,
        fechaFinal,
        filtros.regionales
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos_completados_${today}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message;
      Swal.fire('Error', detail, 'error');
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  return (
    <div className="TablaPedidosCompletados-contenedor">
      {/* Filtros */}
      <div className="TablaPedidosCompletados-filtros">
        {['ADMIN', 'CONTROL', 'ANALISTA'].includes(perfil) && (
          <select
            value={regionalFiltro}
            onChange={e => setRegionalFiltro(e.target.value)}
          >
            <option value="TODOS">Todas las regionales</option>
            {regionesDisponibles.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={fechaInicial}
          onChange={e => setFechaInicial(e.target.value)}
        />
        <input
          type="date"
          value={fechaFinal}
          onChange={e => setFechaFinal(e.target.value)}
        />
        <button
          className="TablaPedidosCompletados-button"
          onClick={fetchData}
        >
          Filtrar
        </button>
      </div>

      {loading ? (
        <p className="TablaPedidosCompletados-loading">Cargando...</p>
      ) : (
        <>
          <div className="TablaPedidosCompletados-wrapper">
            <table className="TablaPedidosCompletados-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Vehículo</th>
                  <th>Tipo</th>
                  <th>Destino Final</th>
                  <th>Estados</th>
                  <th>Puntos</th>
                  <th>Kg Reales</th>
                  <th>Kg Sicetac</th>
                  <th>Flete Teorico</th>
                  <th>Car/desc Teorico Teorico</th>
                  <th>Pto Adic Teórico</th>                
                  <th>Total Teórico</th>   
                  <th>Flete Solicitado</th>
                  <th>Car/desc Solicitado</th>
                  <th>Pto Adic Solicitado</th>
                  <th>Desvío</th>   
                  <th>Total Solicitado</th>                             
                  <th>Diferencia</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map(g => (
                  <React.Fragment key={g.consecutivo_vehiculo}>
                    <tr
                      className={`${
                        expanded.has(g.consecutivo_vehiculo)
                          ? 'TablaPedidosCompletados-row--expanded'
                          : ''
                      }`}
                    >
                      <td>
                        <button onClick={() => toggleExpand(g.consecutivo_vehiculo)}>
                          {expanded.has(g.consecutivo_vehiculo) ? '−' : '+'}
                        </button>
                      </td>
                      <td>{g.consecutivo_vehiculo}</td>                      
                      <td>{(g.tipo_vehiculo_sicetac || '').split('_')[0]}</td>
                      <td>{g.destino}</td>
                      <td>{g.estados.join(', ')}</td>
                      <td>{g.total_puntos_vehiculo}</td>
                      <td>{numeroSeguro(g.total_kilos_vehiculo)}</td>
                      <td>{numeroSeguro(g.total_kilos_vehiculo_sicetac)}</td>
                      <td>{formatoMoneda(g.costo_teorico_vehiculo)}</td>
                      <td>{formatoMoneda(g.total_cargue_descargue_teorico)}</td>
                      <td>{formatoMoneda(g.total_punto_adicional_teorico)}</td>
                      <td>{formatoMoneda(g.costo_teorico_vehiculo)}</td>
                      <td>{formatoMoneda(g.total_flete_solicitado)}</td>
                      <td>{formatoMoneda(g.total_cargue_descargue)}</td>
                      <td>{formatoMoneda(g.total_punto_adicional)}</td>
                      <td>{formatoMoneda(g.total_desvio_vehiculo)}</td>
                      <td>{formatoMoneda(g.costo_real_vehiculo)}</td>
                      <td className={Number(g.diferencia_flete) > 0 ? 'TablaPedidosCompletados-cell--error' : ''}>
                        {formatoMoneda(g.diferencia_flete)}
                      </td>

                    </tr>

                    {expanded.has(g.consecutivo_vehiculo) && (
                      <tr className="TablaPedidosCompletados-details">
                        <td colSpan={17}>
                          <table className="TablaPedidosCompletados-subtable">
                            <thead>
                              <tr>
                              <th>Pedido</th><th>Consecutivo pedido</th><th>Origen</th><th>Destino Real</th><th>Cliente</th>
                              <th>Destinatario</th><th>Kilos</th><th>Entregas</th><th>Observaciones</th><th>Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                              {g.pedidos.map(p => (
                                <tr key={p.id}>
                                <td>{p.consecutivo_integrapp}</td>
                                <td>{p.numero_pedido}</td>
                                <td>{p.origen}</td>
                                <td>{p.destino_real}</td>
                                <td>{p.nombre_cliente}</td>
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

          {data.length > 0 && (
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button
                className="TablaPedidosCompletados-button"
                onClick={handleExportar}
              >
                Exportar a Excel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TablaPedidosCompletados;
