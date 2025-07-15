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

const regionalOptions = ['FUNZA', 'GIRARDOTA', 'BUCARAMANGA', 'CALI', 'BARRANQUILLA'];

const TablaPedidosCompletados: React.FC = () => {
  const perfil = Cookies.get('perfilPedidosCookie') || '';
  const usuario = Cookies.get('usuarioPedidosCookie') || '';
  const usuarioRegional = Cookies.get('regionalPedidosCookie') || '';

  // Fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState<ListarCompletadosResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [regionalFiltro, setRegionalFiltro] = useState<string>(
    ['ADMIN','GERENTE','ANALISTA'].includes(perfil) ? 'TODOS' : usuarioRegional
  );
  const [fechaInicial, setFechaInicial] = useState<string>(today);
  const [fechaFinal, setFechaFinal] = useState<string>(today);

  const buildFiltros = () => {
    const filtros: any = {};
    if (['ADMIN','GERENTE','ANALISTA'].includes(perfil)) {
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
    const inicio = new Date(fechaInicial);
    const fin = new Date(fechaFinal);
    if (inicio > fin) {
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
      setData(res);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message;
      Swal.fire('Error', detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar con rango hoy
  useEffect(() => {
    fetchData();
  }, []);

  const handleExportar = async () => {
    if (!fechaInicial || !fechaFinal) {
      Swal.fire('Error', 'Selecciona fecha inicial y final', 'warning');
      return;
    }
    const inicio = new Date(fechaInicial);
    const fin = new Date(fechaFinal);
    if (inicio > fin) {
      Swal.fire('Error', 'La fecha inicial no puede ser posterior a la fecha final', 'warning');
      return;
    }

    try {
      const filtros = buildFiltros();
      const regionales = filtros.regionales;

      const blob = await exportarCompletados(
        usuario,
        fechaInicial,
        fechaFinal,
        regionales
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos_completados_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
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
      <div className="TablaPedidosCompletados-filtros">
        {['ADMIN','GERENTE','ANALISTA'].includes(perfil) && (
          <select
            value={regionalFiltro}
            onChange={e => setRegionalFiltro(e.target.value)}
          >
            <option value="TODOS">Todas las regionales</option>
            {regionalOptions.map(r => (
              <option key={r} value={r}>{r}</option>
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
        <button className="TablaPedidosCompletados-button" onClick={fetchData}>
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
                  <th>Total Cajas</th>
                  <th>Total Kilos</th>
                  <th>Total Flete</th>
                  <th>Vlr. Flete Sistema</th>
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {data.map(group => (
                  <React.Fragment key={group.consecutivo_vehiculo}>
                    <tr className={
                      `${expanded.has(group.consecutivo_vehiculo)
                        ? 'TablaPedidosCompletados-row--expanded' : ''} ` +
                      `${group.diferencia_flete > 0
                        ? 'TablaPedidosCompletados-row--alert' : ''}`
                    }>
                      <td>
                        <button
                          className="TablaPedidosCompletados-expand"
                          onClick={() => toggleExpand(group.consecutivo_vehiculo)}
                        >
                          {expanded.has(group.consecutivo_vehiculo) ? '−' : '+'}
                        </button>
                      </td>
                      <td>{group.consecutivo_vehiculo}</td>
                      <td>{group.tipo_vehiculo}</td>
                      <td>{group.total_cajas_vehiculo}</td>
                      <td>{group.total_kilos_vehiculo}</td>
                      <td>{group.total_flete_vehiculo.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0})}</td>
                      <td>{group.valor_flete_sistema.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0})}</td>
                      <td className={group.diferencia_flete>0?'TablaPedidosCompletados-cell--error':''}>{group.diferencia_flete.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0})}</td>
                    </tr>

                    {expanded.has(group.consecutivo_vehiculo) && (
                      <tr className="TablaPedidosCompletados-details">
                        <td colSpan={9}>
                          <table className="TablaPedidosCompletados-subtable">
                            <thead><tr><th>Pedido</th><th>Origen</th><th>Destino</th><th>Punto</th><th>Cliente</th><th>Cajas</th><th>Kilos</th><th>Desvíos</th><th>Pto. Adicional</th><th>Cargue/Desc.</th><th>Obs.</th></tr></thead>
                            <tbody>
                              {group.pedidos.map(p=> (
                                <tr key={p.id}>
                                  <td>{p.consecutivo_integrapp}</td><td>{p.origen}</td><td>{p.destino}</td><td>{p.ubicacion_descargue}</td><td>{p.cliente_nombre}</td><td>{p.num_cajas}</td><td>{p.num_kilos}</td><td>{p.desvio}</td><td>{p.punto_adicional}</td><td>{p.cargue_descargue}</td><td>{p.observaciones}</td>
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
            <div style={{ textAlign:'right', marginTop:'1rem' }}>
              <button className="TablaPedidosCompletados-button" onClick={handleExportar}>
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