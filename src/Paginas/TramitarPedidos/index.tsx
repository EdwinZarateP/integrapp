// src/components/TramitarPedidos/index.tsx

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  cargarPedidosMasivo,
  listarPedidos,
  eliminarPedido,
  actualizarEstadoPedido,
  exportarAutorizados,
  cargarNumerosPedidoMasivo,
  listarCompletados,
  exportarCompletados
} from '../../Funciones/ApiPedidos/pedidos';
import { IoExitSharp } from 'react-icons/io5';
import './estilos.css';

interface Pedido {
  id: string;
  placa: string;
  cliente_nombre: string;
  origen: string;
  destino: string;
  num_cajas: number;
  num_kilos: number;
  tipo_vehiculo: string;
  valor_flete: number;
  valor_flete_sistema: number;
  observaciones: string;
  regional: string;
  estado: string;
  fecha_actualizacion?: string;
  numero_pedido?: string;
  pedido_actualizado_por?: string;
}

const TramitarPedidos: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'tramite' | 'completados'>('tramite');

  // TRÁMITE
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cargandoTramite, setCargandoTramite] = useState(false);
  const [filtroRegional, setFiltroRegional] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');


  // COMPLETADOS
  const [pedidosCompletados, setPedidosCompletados] = useState<Pedido[]>([]);
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState(fechaInicio);
  const [fileCompletados, setFileCompletados] = useState<File | null>(null);
  const fileCompRef = useRef<HTMLInputElement>(null);
  const [cargandoCompletados, setCargandoCompletados] = useState(false);
  const [filtroRegionalCompletados, setFiltroRegionalCompletados] = useState('');
  const regionalesFijas = ["FUNZA", "GIRARDOTA", "BUCARAMANGA", "CALI", "BARRANQUILLA"];

  const usuario = document.cookie
    .split('; ')
    .find(row => row.startsWith('usuarioPedidosCookie='))
    ?.split('=')[1] ?? null;
  const perfil = document.cookie
    .split('; ')
    .find(row => row.startsWith('perfilPedidosCookie='))
    ?.split('=')[1]?.toUpperCase() ?? '';

  // Inicial cargados
  useEffect(() => {
    if (!usuario) navigate('/LoginUsuario', { replace: true });
    else fetchPedidos();
  }, [navigate, usuario]);

  useEffect(() => {
    if (tab === 'completados') {
      fetchCompletados(); // carga completados automáticamente con fechas actuales
    }
  }, [tab]);


  // trae trámites
  const fetchPedidos = async () => {
    if (!usuario) return;
    try {
      const data = await listarPedidos(usuario, {
        estados: ['REQUIERE AUTORIZACION', 'AUTORIZADO'],
        regionales: filtroRegional ? [filtroRegional] : undefined
      });
      setPedidos(data);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: 'error', title: 'Error al cargar trámites' });
    }
  };

  // trae completados
  const fetchCompletados = async () => {
    if (!usuario) return;
    try {
      const data = await listarCompletados(
        usuario,
        fechaInicio,
        fechaFin,
        filtroRegionalCompletados ? [filtroRegionalCompletados] : []
      );
      setPedidosCompletados(data);
    } catch (err: any) {
      if (err.message.includes('No se encontraron pedidos COMPLETADOS')) {
        setPedidosCompletados([]);
        return;
      }
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error al cargar completados' });
    }
  };

  // formatea moneda
  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);

  // logout
  const handleLogout = () => {
    document.cookie = 'usuarioPedidosCookie=; Max-Age=0; path=/;';
    document.cookie = 'perfilPedidosCookie=; Max-Age=0; path=/;';
    navigate('/LoginUsuario', { replace: true });
  };

  // subir trámites
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

  const handleUpload = async () => {
    if (!usuario || !file) return;
    setCargandoTramite(true);
    try {
      const res = await cargarPedidosMasivo(file, usuario);
      await Swal.fire({ icon: 'success', title: res.mensaje, timer: 2000, showConfirmButton: false });
      await fetchPedidos();
    } catch (err: any) {
      const data = err.detail;
      const errores = Array.isArray(data?.errores) ? data.errores : [];
      await Swal.fire({
        icon: 'error',
        title: data?.mensaje ?? 'Error al cargar archivo',
        html: errores.length
          ? `<ul style="text-align:left">${errores.slice(0, 3).map((e: string) => `<li>${e}</li>`).join('')}</ul>` +
            (errores.length > 3 ? `<p>... y ${errores.length - 3} más</p>` : '')
          : undefined
      });
    } finally {
      setCargandoTramite(false);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // subir completados
  const handleFileChangeCompletados = (e: ChangeEvent<HTMLInputElement>) =>
    setFileCompletados(e.target.files?.[0] ?? null);

  const handleUploadCompletados = async () => {
    if (!usuario || !fileCompletados) return;
    setCargandoCompletados(true);
    try {
      const res = await cargarNumerosPedidoMasivo(fileCompletados, usuario);
      await Swal.fire({ icon: 'success', title: res.mensaje, timer: 2000, showConfirmButton: false });
      await fetchPedidos();         // remueve de trámite
      await fetchCompletados();     // refresca completados
    } catch (err: any) {
      const data = err.detail ?? { mensaje: err.message };
      await Swal.fire({
        icon: 'error',
        title: data.mensaje || 'Error al cargar completados',
        html: Array.isArray(data.errores)
          ? `<ul style="text-align:left">${data.errores.map((e: string) => `<li>${e}</li>`).join('')}</ul>`
          : undefined
      });
    } finally {
      setCargandoCompletados(false);
      setFileCompletados(null);
      if (fileCompRef.current) fileCompRef.current.value = '';
    }
  };

  // acciones fila
  const handleEliminar = async (id: string) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar este pedido y todos de la misma placa?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(r => r.isConfirmed);
    if (!ok || !usuario) return;
    try {
      await eliminarPedido(id, usuario);
      await fetchPedidos();
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al eliminar pedido' });
    }
  };
  const handleAutorizar = async (id: string) => {
    const { value: obs, isConfirmed } = await Swal.fire({
      title: 'Observaciones (opcional)',
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Autorizar'
    });
    if (!isConfirmed || !usuario) return;
    try {
      await actualizarEstadoPedido(id, 'AUTORIZADO', usuario, obs || undefined);
      await fetchPedidos();
      Swal.fire({ icon: 'success', title: 'Pedido autorizado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al autorizar pedido' });
    }
  };

  // exportar
  const handleExportarAutorizados = async () => {
    try { await exportarAutorizados(); }
    catch { Swal.fire({ icon: 'error', title: 'Error al exportar autorizados' }); }
  };
  const handleExportarCompletados = async () => {
    try { await exportarCompletados(usuario!, fechaInicio, fechaFin, filtroRegionalCompletados ? [filtroRegionalCompletados] : []); }
    catch { Swal.fire({ icon: 'error', title: 'Error al exportar completados' }); }
  };

  // agrupamiento trámites
  const pedidosFiltrados = pedidos.filter(p =>
    (!filtroRegional || p.regional === filtroRegional) &&
    (!filtroEstado   || p.estado   === filtroEstado)
  );
  const grupos = pedidosFiltrados.reduce<Record<string, Pedido[]>>((acc, p) => {
    (acc[p.placa] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="TramitarPedidos-contenedor">
      {/* HEADER */}
      <div className="TramitarPedidos-header">
        <h2 className="TramitarPedidos-titulo">Tramitar Pedidos</h2>
        <button onClick={handleLogout} className="TramitarPedidos-botonCerrarSesion">
          <IoExitSharp />
        </button>
      </div>

      {/* TABS */}
      <div className="TramitarPedidos-tabs">
        <button
          className={tab === 'tramite' ? 'active' : ''}
          onClick={() => setTab('tramite')}
        >
          En Trámite
        </button>
        <button
          className={tab === 'completados' ? 'active' : ''}
          onClick={() => setTab('completados')}
        >
          Completados
        </button>
      </div>

      {/* VISTA TRÁMITE */}
      {tab === 'tramite' && (
        <>
          {/* carga masiva trámites */}
          {(perfil === 'ADMIN' || perfil === 'OPERADOR') && (
            <div className="TramitarPedidos-upload">
              <input
                ref={fileRef}
                type="file"
                accept=".xls,.xlsx,.xlsm"
                onChange={handleFileChange}
                className="TramitarPedidos-file"
              />
              <button
                onClick={handleUpload}
                disabled={cargandoTramite || !file}
                className="TramitarPedidos-botonUpload"
              >
                {cargandoTramite ? 'Cargando...' : 'Cargar Archivo'}
              </button>
            </div>
          )}

          {/* carga masiva completados */}
          {(perfil === 'ADMIN' || perfil === 'ANALISTA') && (
            <div className="TramitarPedidos-upload">
              <input
                ref={fileCompRef}
                type="file"
                accept=".xls,.xlsx,.xlsm"
                onChange={handleFileChangeCompletados}
                className="TramitarPedidos-file"
              />
              <button
                onClick={handleUploadCompletados}
                disabled={cargandoCompletados || !fileCompletados}
                className="TramitarPedidos-botonUpload"
              >
                {cargandoCompletados ? 'Cargando...' : 'Cargar Completados'}
              </button>
            </div>
          )}

          {/* filtros trámite */}
          {perfil !== 'OPERADOR' && (
            <div className="TramitarPedidos-filtros">
              <select
                value={filtroRegional}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroRegional(e.target.value)}
                className="TramitarPedidos-select"
              >
                <option value="">Todas regionales</option>
                {regionalesFijas.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={filtroEstado}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroEstado(e.target.value)}
                className="TramitarPedidos-select"
              >

                <option value="">Todos estados</option>
                {[...new Set(pedidos.map(p => p.estado))].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* tabla trámites */}
          <div className="TramitarPedidos-tableWrapper">
            <table className="TramitarPedidos-table">
              <thead>
                <tr>
                  <th>Cliente</th><th>Origen</th><th>Destino</th>
                  <th>Cajas</th><th>Kilos</th><th>Vehículo</th>
                  <th>Flete</th><th>Flete Sist.</th><th>Diferencia</th>
                  <th>Observaciones</th><th>Regional</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grupos).map(([placa, items]) => {
                  const total = items.reduce((sum, p) => sum + p.valor_flete, 0);
                  const sist  = items[0].valor_flete_sistema;
                  const diff  = total - sist;
                  return (
                    <React.Fragment key={placa}>
                      <tr className="TramitarPedidos-placaHeader">
                        <td colSpan={13}>Placa: <strong>{placa}</strong></td>
                      </tr>
                      {items.map(p => (
                        <tr key={p.id} className={p.estado === 'REQUIERE AUTORIZACION' ? 'TramitarPedidos-row--requiere' : ''}>
                          <td>{p.cliente_nombre}</td><td>{p.origen}</td><td>{p.destino}</td>
                          <td>{p.num_cajas}</td><td>{p.num_kilos}</td><td>{p.tipo_vehiculo}</td>
                          <td>{formatCOP(p.valor_flete)}</td><td>{formatCOP(p.valor_flete_sistema)}</td>
                          <td className={`TramitarPedidos-diferencia ${diff > 49000 ? 'TramitarPedidos-diferencia--negativa' : ''}`}>
                            {formatCOP(diff)}
                          </td>
                          <td>{p.observaciones}</td><td>{p.regional}</td><td>{p.estado}</td>
                          <td className="TramitarPedidos-acciones">
                            {p.estado === 'REQUIERE AUTORIZACION' && (perfil === 'GERENTE' || perfil === 'ADMIN') && (
                              <button onClick={() => handleAutorizar(p.id)} className="TramitarPedidos-botonAutorizar">
                                Autorizar
                              </button>
                            )}
                            {(perfil === 'ADMIN' || perfil === 'OPERADOR') && (
                              <button onClick={() => handleEliminar(p.id)} className="TramitarPedidos-botonEliminar">
                                Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="TramitarPedidos-placaResumen">
                        <td colSpan={6}><strong>Total Placa</strong></td>
                        <td colSpan={3}><strong>{formatCOP(total)}</strong></td>
                        <td colSpan={4}></td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(perfil === 'ANALISTA' || perfil === 'ADMIN') && (
            <div className="TramitarPedidos-footer">
              <button onClick={handleExportarAutorizados} className="TramitarPedidos-botonExportar">
                Exportar Autorizados
              </button>
            </div>
          )}
        </>
      )}

      {/* VISTA COMPLETADOS */}
      {tab === 'completados' && (
        <div className="TramitarPedidos-completados">
          <div className="TramitarPedidos-filtros">
            <label>
              Desde:
              <input
                type="date"
                value={fechaInicio}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newFecha = e.target.value;
                  setFechaInicio(newFecha);
                  if (newFecha > fechaFin) {
                    setFechaFin(newFecha);
                  }
                }}
              />
            </label>
            <label>
              Hasta:
              <input
                type="date"
                value={fechaFin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaFin(e.target.value)}
              />
            </label>
            {perfil !== 'OPERADOR' && (
              <select
                value={filtroRegionalCompletados}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroRegionalCompletados(e.target.value)}
                className="TramitarPedidos-select"
              >

                <option value="">Todas regionales</option>
                {regionalesFijas.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}
            <button className="TramitarPedidos-botonCompletados" onClick={() => {
              if (fechaInicio > fechaFin) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Rango de fechas inválido',
                  text: 'La fecha inicial no puede ser posterior a la fecha final.'
                });
                return;
              }
              fetchCompletados();
            }}>
              Aplicar filtros
            </button>
          </div>

          <div className="TramitarPedidos-tableWrapper">
            <table className="TramitarPedidos-table">
              <thead>
                <tr>
                  <th>Placa</th><th>Número Pedido</th><th>Origen</th><th>Destino</th><th>Cliente</th><th>Cajas</th><th>Kilos</th>
                  <th>Vehículo</th><th>Valor Flete</th><th>Regional</th>
                  <th>Fecha Actualización</th>
                </tr>
              </thead>
              <tbody>
                {pedidosCompletados.map(p => (
                  <tr key={p.id}>
                    <td>{p.placa}</td><td>{p.numero_pedido}</td><td>{p.origen}</td><td>{p.destino}</td>
                    <td>{p.cliente_nombre}</td><td>{p.num_cajas}</td><td>{p.num_kilos}</td><td>{p.tipo_vehiculo}</td>
                    <td>{formatCOP(p.valor_flete)}</td><td>{p.regional}</td>
                    <td>{p.fecha_actualizacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(perfil === 'ANALISTA' || perfil === 'ADMIN') && (
            <div className="TramitarPedidos-footer">
              <button onClick={handleExportarCompletados} className="TramitarPedidos-botonExportar">
                Exportar Completados
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TramitarPedidos;
