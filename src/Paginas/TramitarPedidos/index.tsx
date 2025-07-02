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
}

const TramitarPedidos: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [filtroRegional, setFiltroRegional] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper para formatear COP sin decimales
  const formatCOP = (value: number): string =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);

  const leerCookie = (nombre: string): string | null => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  };
  const usuario = leerCookie('usuarioPedidosCookie');
  const perfil = leerCookie('perfilPedidosCookie')?.toUpperCase() ?? '';

  useEffect(() => {
    if (!usuario) navigate('/LoginUsuario', { replace: true });
    else fetchPedidos();
  }, [navigate, usuario]);

  const fetchPedidos = async () => {
    if (!usuario) return;
    try {
      const data = await listarPedidos(usuario);
      setPedidos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    document.cookie = 'usuarioPedidosCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'perfilPedidosCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/LoginUsuario', { replace: true });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!usuario || !file) return;
    setCargando(true);
    try {
      const res = await cargarPedidosMasivo(file, usuario);
      // Si carga bien, muestra mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: res.mensaje,
        timer: 2000,
        showConfirmButton: false,
      });
      await fetchPedidos();
    } catch (error: any) {
      console.log("🔴 Error al cargar masivo:", error);
      // extrae la estructura de error de FastAPI
      const data = error.detail;
      const title = data?.mensaje ?? 'Error al cargar archivo';
      const errores = Array.isArray(data?.errores) ? data.errores : [];

      // Muestra los errores de forma clara como lista
      await Swal.fire({
        icon: 'error',
        title,
        html: errores.length
          ? (() => {
              const mostrados = errores.slice(0, 3);
              const restantes = errores.length - 3;
              return `
                <ul style="text-align:left">
                  ${mostrados.map((e: string) => `<li>${e}</li>`).join('')}
                </ul>
                ${restantes > 0 ? `<p>... y ${restantes} error(es) más</p>` : ''}
              `;
            })()
          : 'Ocurrió un error inesperado'
      });
    } finally {
      setCargando(false);
      resetFileInput();
    }
  };


  const handleEliminar = async (id: string) => {
    if (!usuario) return;
    const ok = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar este pedido y todos de la misma placa?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then(r => r.isConfirmed);
    if (!ok) return;

    try {
      await eliminarPedido(id, usuario!);
      await fetchPedidos();
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al eliminar pedido' });
    }
  };

  const handleAutorizar = async (id: string) => {
    if (!usuario) return;
    const { value: obs, isConfirmed } = await Swal.fire({
      title: 'Observaciones (opcional)',
      input: 'textarea',
      inputPlaceholder: 'Ingresa observaciones...',
      showCancelButton: true,
      confirmButtonText: 'Autorizar',
    });
    if (!isConfirmed) return;

    try {
      await actualizarEstadoPedido(id, 'AUTORIZADO', usuario, obs || undefined);
      await fetchPedidos();
      Swal.fire({ icon: 'success', title: 'Pedido autorizado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al autorizar pedido' });
    }
  };

  const handleExportar = async () => {
    try {
      await exportarAutorizados();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al exportar' });
    }
  };

  // Agrupar por placa
  const pedidosFiltrados = pedidos.filter(p =>
    (!filtroRegional || p.regional === filtroRegional) &&
    (!filtroEstado   || p.estado    === filtroEstado)
  );

  const grupos = pedidosFiltrados.reduce<Record<string, Pedido[]>>((acc, p) => {
    (acc[p.placa] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="TramitarPedidos-contenedor">
      <div className="TramitarPedidos-header">
        <h2 className="TramitarPedidos-titulo">Tramitar Pedidos</h2>
        <button onClick={handleLogout} className="TramitarPedidos-botonCerrarSesion">
          <IoExitSharp />
        </button>
      </div>

      {(perfil === 'ADMIN' || perfil === 'OPERADOR') && (
        <div className="TramitarPedidos-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.xlsm"
            onChange={handleFileChange}
            className="TramitarPedidos-file"
          />
          <button
            onClick={handleUpload}
            disabled={cargando || !file}
            className="TramitarPedidos-botonUpload"
          >
            {cargando ? 'Cargando...' : 'Cargar Archivo'}
          </button>
        </div>
      )}

      {perfil !== 'OPERADOR' && (
        <div className="TramitarPedidos-filtros">
          <select
            value={filtroRegional}
            onChange={e => setFiltroRegional(e.target.value)}
            className="TramitarPedidos-select"
          >
            <option value="">Todas las regionales</option>
            {[...new Set(pedidos.map(p => p.regional))].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="TramitarPedidos-select"
          >
            <option value="">Todos los estados</option>
            {[...new Set(pedidos.map(p => p.estado))].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      )}

      <div className="TramitarPedidos-tableWrapper">
        <table className="TramitarPedidos-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Cajas</th>
              <th>Kilos</th>
              <th>Vehículo</th>
              <th>Flete</th>
              <th>Flete Sist.</th>
              <th>Diferencia</th>
              <th>Observaciones</th>
              <th>Regional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grupos).map(([placa, items]) => {
              const totalValorFlete   = items.reduce((sum, p) => sum + p.valor_flete, 0);
              const valorFleteSistema = items[0].valor_flete_sistema;
              const diffTotal         = totalValorFlete - valorFleteSistema;

              return (
                <React.Fragment key={placa}>
                  <tr className="TramitarPedidos-placaHeader">
                    <td colSpan={13}>
                      Placa: <strong>{placa}</strong>
                    </td>
                  </tr>

                  {items.map(p => (
                    <tr
                      key={p.id}
                      className={p.estado === 'REQUIERE AUTORIZACION' ? 'TramitarPedidos-row--requiere' : ''}
                    >
                      <td>{p.cliente_nombre}</td>
                      <td>{p.origen}</td>
                      <td>{p.destino}</td>
                      <td>{p.num_cajas}</td>
                      <td>{p.num_kilos}</td>
                      <td>{p.tipo_vehiculo}</td>
                      <td>{formatCOP(p.valor_flete)}</td>
                      <td></td> {/* oculto en detalle */}
                      <td></td> {/* oculto en detalle */}
                      <td>{p.observaciones}</td>
                      <td>{p.regional}</td>
                      <td>{p.estado}</td>
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
                    <td><strong>{formatCOP(totalValorFlete)}</strong></td>
                    <td><strong>{formatCOP(valorFleteSistema)}</strong></td>
                    <td className={`TramitarPedidos-diferencia ${diffTotal > 49000 ? 'TramitarPedidos-diferencia--negativa' : ''}`}> 
                      <strong>{formatCOP(diffTotal)}</strong>
                    </td>
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
          <button onClick={handleExportar} className="TramitarPedidos-botonExportar">
            Exportar Autorizados
          </button>
        </div>
      )}
    </div>
  );
};

export default TramitarPedidos;
