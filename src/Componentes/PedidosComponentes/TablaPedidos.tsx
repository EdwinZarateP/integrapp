import React, { useState, useEffect, useLayoutEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import {
  listarPedidosVehiculos,
  autorizarPorConsecutivoVehiculo,
  eliminarPedidosPorConsecutivoVehiculo,
  ajustarTotalesVehiculo,          // 👈 NUEVO
  AjusteVehiculo                    // 👈 (tipos opcionales, si los exportas)
} from '../../Funciones/ApiPedidos/apiPedidos';
import './TablaPedidos.css';

const formatoMoneda = (v: number) =>
  v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const estadosDisponibles = ['AUTORIZADO', 'REQUIERE AUTORIZACION', 'COMPLETADO'];
const regionesDisponibles = ['FUNZA', 'KABI', 'GIRARDOTA', 'BUCARAMANGA', 'CALI', 'BARRANQUILLA'];

const perfilesConEdicion = ['ADMIN', 'DESPACHADOR', 'OPERADOR'] as const;
const opcionesTipoSicetac = ['CARRY', 'NHR', 'TURBO', 'NIES', 'SENCILLO', 'PATINETA', 'TRACTOMULA'];

type Perfil = 'ADMIN' | 'GERENTE' | 'ANALISTA' | 'DESPACHADOR' | 'OPERADOR' | string;

type EditFormState = {
  consecutivo_vehiculo: string;
  tipo_vehiculo_sicetac: string;
  total_kilos_vehiculo_sicetac: string; // como string para inputs controlados
  total_desvio_vehiculo: string;
  total_punto_adicional: string;
  Observaciones_ajustes: string;
};

const TablaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandido, setExpandido] = useState<Set<string>>(new Set());
  const perfil = (Cookies.get('perfilPedidosCookie') || '') as Perfil;
  const usuario = Cookies.get('usuarioPedidosCookie') || '';
  const regionalUsuario = Cookies.get('regionalPedidosCookie') || '';
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroRegional, setFiltroRegional] = useState('TODOS');
  const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
  const [esPantallaGrande, setEsPantallaGrande] = useState(window.innerWidth >= 900);

  // 🌟 Modal de edición
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    consecutivo_vehiculo: '',
    tipo_vehiculo_sicetac: '',
    total_kilos_vehiculo_sicetac: '',
    total_desvio_vehiculo: '',
    total_punto_adicional: '',
    Observaciones_ajustes: ''
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 👉 Abrir modal con datos del grupo
  const abrirModalEditar = (g: any) => {
    if (!perfilesConEdicion.includes(perfil as any)) return;
    setEditForm({
      consecutivo_vehiculo: g.consecutivo_vehiculo,
      tipo_vehiculo_sicetac: (g.tipo_vehiculo_sicetac || g.tipo_vehiculo || '').split('_')[0],
      total_kilos_vehiculo_sicetac: (g.total_kilos_vehiculo_sicetac ?? '').toString(),
      total_desvio_vehiculo: (g.total_desvio_vehiculo ?? '').toString(),
      total_punto_adicional: (g.total_punto_adicional ?? '').toString(),
      Observaciones_ajustes: g.Observaciones_ajustes ?? ''
    });
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setGuardandoEdicion(false);
  };

  const onChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const parseNumber = (s: string): number | undefined => {
    if (s === '' || s === null || s === undefined) return undefined;
    const n = Number(String(s).replace(/\./g, '').replace(/,/g, '.'));
    return Number.isFinite(n) ? n : undefined;
  };

  const guardarEdicion = async () => {
    // Validación mínima
    if (!editForm.consecutivo_vehiculo) {
      Swal.fire('Atención', 'Falta consecutivo_vehiculo', 'warning');
      return;
    }
    if (!editForm.tipo_vehiculo_sicetac) {
      Swal.fire('Atención', 'Selecciona un tipo de vehículo (SICETAC)', 'warning');
      return;
    }

    const ajuste: AjusteVehiculo = {
      consecutivo_vehiculo: editForm.consecutivo_vehiculo,
      tipo_vehiculo_sicetac: editForm.tipo_vehiculo_sicetac || undefined,
      total_kilos_vehiculo_sicetac: parseNumber(editForm.total_kilos_vehiculo_sicetac),
      total_desvio_vehiculo: parseNumber(editForm.total_desvio_vehiculo),
      total_punto_adicional: parseNumber(editForm.total_punto_adicional),
      Observaciones_ajustes: editForm.Observaciones_ajustes?.trim() ? editForm.Observaciones_ajustes.trim() : undefined
    };

    setGuardandoEdicion(true);
    try {
      await ajustarTotalesVehiculo(usuario, [ajuste]);
      Swal.fire('Listo', 'Ajuste aplicado y estado recalculado', 'success');
      cerrarModalEditar();
      obtenerPedidos();
    } catch (e: any) {
      setGuardandoEdicion(false);
      Swal.fire('Error', e.response?.data?.detail || e.message, 'error');
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
              {pedidos.map(g => (
                <React.Fragment key={g.consecutivo_vehiculo}>
                  <tr className={
                    `${expandido.has(g.consecutivo_vehiculo) ? 'TablaPedidos-row--expanded' : ''} ` +
                    `${g.estados.includes('REQUIERE AUTORIZACION') ? 'TablaPedidos-row--requires-auth' : ''}`
                  }>
                    <td>
                      <button onClick={() => manejarExpandir(g.consecutivo_vehiculo)}>
                        {expandido.has(g.consecutivo_vehiculo) ? '−' : '+'}
                      </button>
                    </td>

                    {/* Doble clic para editar */}
                    <td
                      className="TablaPedidos-cell-consecutivo"
                      onDoubleClick={() => abrirModalEditar(g)}
                      title="Doble clic para editar"
                    >
                      {g.consecutivo_vehiculo}
                    </td>

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
                      {/* 👇 Botón Editar solo para ADMIN / DESPACHADOR / OPERADOR */}
                      {perfilesConEdicion.includes(perfil as any) && (
                        <button className="TablaPedidos-btn-editar" onClick={() => abrirModalEditar(g)}>
                          Editar
                        </button>
                      )}
                    </td>

                    <td>{(g.tipo_vehiculo_sicetac || '').split('_')[0]}</td>
                    <td>{g.destino}</td>
                    <td>{g.estados.join(', ')}</td>
                    <td>{g.total_puntos_vehiculo}</td>
                    <td>{g.total_kilos_vehiculo}</td>
                    <td>{g.total_kilos_vehiculo_sicetac}</td>
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
                    <td>{g.Observaciones_ajustes}</td>
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
      )}

      {/* ====================== MODAL EDITAR ====================== */}
      {mostrarModalEditar && (
        <div className="TablaPedidos-modal-editar">
          <div className="TablaPedidos-modal-editar-contenido">
            <div className="TablaPedidos-modal-editar-header">
              <h3>Editar vehículo</h3>
              <span className="TablaPedidos-modal-editar-consec">{editForm.consecutivo_vehiculo}</span>
            </div>

            <div className="TablaPedidos-modal-editar-grid">
              <div className="TablaPedidos-form-grupo">
                <label>Tipo vehículo (SICETAC)</label>
                <select
                  name="tipo_vehiculo_sicetac"
                  value={editForm.tipo_vehiculo_sicetac}
                  onChange={onChangeEdit}
                >
                  <option value="">Seleccione…</option>
                  {opcionesTipoSicetac.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Total kilos (SICETAC)</label>
                <input
                  type="number"
                  step="0.01"
                  name="total_kilos_vehiculo_sicetac"
                  value={editForm.total_kilos_vehiculo_sicetac}
                  onChange={onChangeEdit}
                  placeholder="Ej: 6200"
                />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Total desvío</label>
                <input
                  type="number"
                  step="1"
                  name="total_desvio_vehiculo"
                  value={editForm.total_desvio_vehiculo}
                  onChange={onChangeEdit}
                  placeholder="Ej: 200000"
                />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Total punto adicional</label>
                <input
                  type="number"
                  step="1"
                  name="total_punto_adicional"
                  value={editForm.total_punto_adicional}
                  onChange={onChangeEdit}
                  placeholder="Ej: 50000"
                />
              </div>

              <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full">
                <label>Observaciones del ajuste</label>
                <textarea
                  name="Observaciones_ajustes"
                  rows={3}
                  value={editForm.Observaciones_ajustes}
                  onChange={onChangeEdit}
                  placeholder="Opcional: explica el motivo del ajuste"
                />
              </div>
            </div>

            <div className="TablaPedidos-modal-editar-actions">
              <button className="TablaPedidos-btn-cancelar" onClick={cerrarModalEditar}>
                Cancelar
              </button>
              <button
                className="TablaPedidos-btn-guardar"
                onClick={guardarEdicion}
                disabled={guardandoEdicion}
              >
                {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==================== /MODAL EDITAR ==================== */}
    </div>
  );
};

export default TablaPedidos;
