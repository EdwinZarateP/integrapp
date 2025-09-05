import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import {
  listarPedidosVehiculos,
  autorizarPorConsecutivoVehiculo,
  eliminarPedidosPorConsecutivoVehiculo,
  ajustarTotalesVehiculo,
  AjusteVehiculo,
  confirmarPreautorizados,
  fusionarVehiculos
} from '../../Funciones/ApiPedidos/apiPedidos';
import './TablaPedidos.css';

const formatoMoneda = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number((v ?? 0));
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

// 👉 Estados compatibles con el backend actualizado
const ESTADO_PREAUT = 'PREAUTORIZADO';
const ESTADO_AUT = 'AUTORIZADO';
const ESTADO_REQ_COORD = 'REQUIERE AUTORIZACION COORDINADOR';
const ESTADO_REQ_GEREN = 'REQUIERE AUTORIZACION GERENTE';
const ESTADO_COMPLETADO = 'COMPLETADO';

const estadosDisponibles = [ESTADO_PREAUT, ESTADO_AUT, ESTADO_REQ_COORD, ESTADO_REQ_GEREN, ESTADO_COMPLETADO];
const regionesDisponibles = ['FUNZA', 'KABI', 'GIRARDOTA', 'BUCARAMANGA', 'CALI', 'BARRANQUILLA'];

const perfilesConEdicion = ['ADMIN', 'DESPACHADOR', 'OPERADOR'] as const;
const opcionesTipoSicetac = ['CARRY', 'NHR', 'TURBO', 'NIES', 'SENCILLO', 'PATINETA', 'TRACTOMULA'];

type Perfil = 'ADMIN' | 'COORDINADOR' | 'ANALISTA' | 'DESPACHADOR' | 'OPERADOR' | 'GERENTE' | string;

type EditFormState = {
  consecutivo_vehiculo: string;
  tipo_vehiculo_sicetac: string;
  total_kilos_vehiculo_sicetac: string; // como string para inputs controlados
  total_desvio_vehiculo: string;
  total_punto_adicional: string;
  total_cargue_descargue: string;
  total_flete_solicitado: string;
  Observaciones_ajustes: string;
};

type FusionFormState = {
  nuevo_destino: string;
  tipo_vehiculo_sicetac: string;
  total_flete_solicitado: string;
  total_cargue_descargue: string;
  total_punto_adicional: string;
  total_desvio_vehiculo: string;
  observacion_fusion: string;
};

// ✅ Helper: estados válidos para FUSIÓN
const esFusionable = (g: any) => {
  const e: string[] = Array.isArray(g.estados) ? g.estados : [];
  return (
    e.includes(ESTADO_PREAUT) ||
    e.includes(ESTADO_REQ_COORD) ||
    e.includes(ESTADO_REQ_GEREN)
  );
};

// 🔎 Utilidades de autorización
function requeridoPorEstados(estados: string[]): 'COORDINADOR' | 'GERENTE' | null {
  if (!Array.isArray(estados) || estados.length === 0) return null;
  const upper = estados.map(e => (e || '').toUpperCase());
  const pideCoord = upper.includes(ESTADO_REQ_COORD);
  const pideGeren = upper.includes(ESTADO_REQ_GEREN);
  if (pideGeren) return 'GERENTE';
  if (pideCoord) return 'COORDINADOR';
  return null;
}

function perfilPuedeAutorizar(perfil: Perfil, requerido: 'COORDINADOR' | 'GERENTE' | null): boolean {
  const p = (perfil || '').toUpperCase();
  if (!requerido) return false;
  if (p === 'ADMIN') return true;
  if (requerido === 'GERENTE') return p === 'GERENTE';
  if (requerido === 'COORDINADOR') return p === 'COORDINADOR' || p === 'GERENTE';
  return false;
}

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
  const [esPantallaGrande, setEsPantallaGrande] = useState(typeof window !== 'undefined' ? window.innerWidth >= 900 : true);

  // 🌟 Modal de edición
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    consecutivo_vehiculo: '',
    tipo_vehiculo_sicetac: '',
    total_kilos_vehiculo_sicetac: '',
    total_desvio_vehiculo: '',
    total_punto_adicional: '',
    total_cargue_descargue: '',
    total_flete_solicitado: '',
    Observaciones_ajustes: ''
  });

  // 🧩 Modal de fusión
  const [mostrarModalFusion, setMostrarModalFusion] = useState(false);
  const [fusionGuardando, setFusionGuardando] = useState(false);
  const [fusionForm, setFusionForm] = useState<FusionFormState>({
    nuevo_destino: '',
    tipo_vehiculo_sicetac: '',
    total_flete_solicitado: '',
    total_cargue_descargue: '',
    total_punto_adicional: '',
    total_desvio_vehiculo: '',
    observacion_fusion: ''
  });

  // ✅ Selección (usada para confirmar PREAUT y para FUSIÓN)
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  // Detectar cambios en el tamaño de la pantalla
  useLayoutEffect(() => {
    const actualizarTamañoPantalla = () => setEsPantallaGrande(window.innerWidth >= 900);
    window.addEventListener('resize', actualizarTamañoPantalla);
    return () => window.removeEventListener('resize', actualizarTamañoPantalla);
  }, []);

  const obtenerPedidos = async () => {
    setCargando(true);
    const filtros: any = {
      estados: filtroEstado === 'TODOS' ? estadosDisponibles : [filtroEstado],
    };
    if (['ADMIN', 'COORDINADOR', 'ANALISTA', 'GERENTE'].includes(perfil)) {
      if (filtroRegional !== 'TODOS') filtros.regionales = [filtroRegional];
    } else {
      filtros.regionales = [regionalUsuario];
    }
    try {
      const res = await listarPedidosVehiculos(usuario, filtros);
      setPedidos(res);
      setSeleccionados(new Set()); // limpiar selección al refrescar
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

  // --------- Acciones por fila ---------
  const manejarAutorizar = async (grupo: any) => {
    // REQUIERE AUTORIZACION [COORD/GERENTE] -> AUTORIZADO (según perfil)
    const requerido = requeridoPorEstados(grupo.estados || []);
    if (!perfilPuedeAutorizar(perfil, requerido)) {
      Swal.fire('Sin permiso', `Este vehículo requiere ${requerido}. Tu perfil: ${perfil}`, 'warning');
      return;
    }

    const { value: obs } = await Swal.fire({
      title: `Autorizar vehículo (${requerido})`,
      input: 'textarea',
      inputLabel: 'Observaciones del aprobador (opcional)',
      inputPlaceholder: 'Escribe una nota si lo deseas…',
      showCancelButton: true,
      confirmButtonText: 'Autorizar',
      cancelButtonText: 'Cancelar'
    });

    try {
      await autorizarPorConsecutivoVehiculo([grupo.consecutivo_vehiculo], usuario, obs ?? undefined);
      Swal.fire('Listo', 'Vehículo autorizado', 'success');
      obtenerPedidos();
    } catch (e: any) {
      const d = e.response?.data?.detail || e.response?.data || e.message;
      Swal.fire('Error', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  };

  const manejarConfirmarPreautorizado = async (consec: string) => {
    // PREAUTORIZADO -> AUTORIZADO (ADMIN/DESP/OPER)
    const { value: obs } = await Swal.fire({
      title: 'Confirmar PREAUTORIZADO',
      input: 'textarea',
      inputLabel: 'Observaciones del aprobador (opcional)',
      inputPlaceholder: 'Escribe una nota si lo deseas…',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });
    try {
      await confirmarPreautorizados([consec], usuario, obs ?? undefined);
      Swal.fire('Listo', 'Vehículo confirmado a AUTORIZADO', 'success');
      obtenerPedidos();
    } catch (e: any) {
      const d = e.response?.data?.detail || e.response?.data || e.message;
      Swal.fire('Error', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
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

  // --------- Edición (ajustes) ----------
  const abrirModalEditar = (g: any) => {
    if (!perfilesConEdicion.includes(perfil as any)) return;
    setEditForm({
      consecutivo_vehiculo: g.consecutivo_vehiculo,
      tipo_vehiculo_sicetac: (g.tipo_vehiculo_sicetac || g.tipo_vehiculo || '').split('_')[0],
      total_kilos_vehiculo_sicetac: (g.total_kilos_vehiculo_sicetac ?? '').toString(),
      total_desvio_vehiculo: (g.total_desvio_vehiculo ?? '').toString(),
      total_punto_adicional: (g.total_punto_adicional ?? '').toString(),
      total_cargue_descargue: (g.total_cargue_descargue ?? '').toString(),
      total_flete_solicitado: (g.total_flete_solicitado ?? '').toString(),
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
    if (!editForm.consecutivo_vehiculo) {
      Swal.fire('Atención', 'Falta consecutivo_vehiculo', 'warning');
      return;
    }
    if (!editForm.tipo_vehiculo_sicetac) {
      Swal.fire('Atención', 'Selecciona un tipo de vehículo (SICETAC)', 'warning');
      return;
    }

    const flete = Number(String(editForm.total_flete_solicitado).replace(/\./g, '').replace(/,/g, '.'));
    const kilos = Number(String(editForm.total_kilos_vehiculo_sicetac).replace(/\./g, '').replace(/,/g, '.'));

    if (!Number.isFinite(flete) || flete <= 0) {
      Swal.fire('Atención', 'El flete solicitado debe ser un número mayor a 0', 'warning');
      return;
    }
    if (!Number.isFinite(kilos) || kilos <= 0) {
      Swal.fire('Atención', 'El peso (kilos RUNT) debe ser un número mayor a 0', 'warning');
      return;
    }

    const ajuste: AjusteVehiculo = {
      consecutivo_vehiculo: editForm.consecutivo_vehiculo,
      tipo_vehiculo_sicetac: editForm.tipo_vehiculo_sicetac || undefined,
      total_kilos_vehiculo_sicetac: kilos,
      total_desvio_vehiculo: parseNumber(editForm.total_desvio_vehiculo),
      total_punto_adicional: parseNumber(editForm.total_punto_adicional),
      total_cargue_descargue: parseNumber(editForm.total_cargue_descargue),
      total_flete_solicitado: flete,
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


  // --------- Selección ----------
  const puedeSeleccionar = perfilesConEdicion.includes(perfil as any);

  // Para confirmar PREAUT masivo
  // const preautorizadosVisibles = useMemo(
  //   () => pedidos.filter(g => Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT)),
  //   [pedidos]
  // );
  // const hayPreautorizadosVisibles = preautorizadosVisibles.length > 0;

  const toggleSeleccion = (cv: string) => {
    if (!puedeSeleccionar) return;
    const s = new Set(seleccionados);
    s.has(cv) ? s.delete(cv) : s.add(cv);
    setSeleccionados(s);
  };

  const toggleSeleccionTodos = () => {
    if (!puedeSeleccionar) return;
    const actuales = new Set(seleccionados);
    const allCvs = pedidos.map(g => g.consecutivo_vehiculo); // seleccionar TODOS los visibles
    const todosYa = allCvs.every(cv => actuales.has(cv));
    if (todosYa) {
      allCvs.forEach(cv => actuales.delete(cv));
    } else {
      allCvs.forEach(cv => actuales.add(cv));
    }
    setSeleccionados(actuales);
  };

  const manejarConfirmacionMasiva = async () => {
    // Solo confirma los seleccionados que estén en PREAUT
    const seleccionPreaut = pedidos
      .filter(g => seleccionados.has(g.consecutivo_vehiculo) && Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT))
      .map(g => g.consecutivo_vehiculo);

    if (!seleccionPreaut.length) {
      Swal.fire('Atención', 'Selecciona al menos un vehículo en estado PREAUTORIZADO', 'warning');
      return;
    }

    const { value: obs } = await Swal.fire({
      title: `Confirmar ${seleccionPreaut.length} vehículo(s) preautorizado(s)`,
      input: 'textarea',
      inputLabel: 'Observaciones del aprobador (opcional)',
      inputPlaceholder: 'Escribe una nota si lo deseas…',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });
    try {
      const res = await confirmarPreautorizados(seleccionPreaut, usuario, obs ?? undefined);
      const msg =
        typeof res?.mensaje === 'string'
          ? res.mensaje
          : `Confirmados: ${seleccionPreaut.length}`;
      Swal.fire('Éxito', msg, 'success');
      setSeleccionados(new Set());
      obtenerPedidos();
    } catch (e: any) {
      const d = e.response?.data?.detail || e.response?.data || e.message;
      Swal.fire('Error', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  };

  // ---------- FUSIÓN ----------
  // Seleccionados VÁLIDOS para fusión
  const seleccionadosFusionables = useMemo(
    () => pedidos.filter(g => seleccionados.has(g.consecutivo_vehiculo) && esFusionable(g)),
    [pedidos, seleccionados]
  );
  const cantidadSeleccionadosFusionables = seleccionadosFusionables.length;

  // Para avisar si el usuario seleccionó algunos NO válidos para fusión
  const seleccionadosInvalidosParaFusion = useMemo(() => {
    return Array.from(seleccionados).filter(cv => {
      const g = pedidos.find(p => p.consecutivo_vehiculo === cv);
      return g && !esFusionable(g);
    });
  }, [seleccionados, pedidos]);

  const abrirModalFusion = () => {
    if (!puedeSeleccionar) return;

    if (cantidadSeleccionadosFusionables < 2) {
      Swal.fire(
        'Atención',
        'Selecciona al menos 2 vehículos con estado PREAUTORIZADO o REQUIERE AUTORIZACION',
        'warning'
      );
      return;
    }

    if (seleccionadosInvalidosParaFusion.length) {
      Swal.fire(
        'Aviso',
        `Se ignorarán (no válidos para fusión):\n${seleccionadosInvalidosParaFusion.join(', ')}`,
        'info'
      );
    }

    // Prefill con el 1.º válido para fusión
    const primero = seleccionadosFusionables[0];
    setFusionForm({
      nuevo_destino: primero?.destino || '',
      tipo_vehiculo_sicetac: (primero?.tipo_vehiculo_sicetac || primero?.tipo_vehiculo || '').split('_')[0],
      total_flete_solicitado: '',
      total_cargue_descargue: '',
      total_punto_adicional: '',
      total_desvio_vehiculo: '',
      observacion_fusion: ''
    });
    setMostrarModalFusion(true);
  };

  const cerrarModalFusion = () => {
    setMostrarModalFusion(false);
    setFusionGuardando(false);
  };

  const onChangeFusion = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFusionForm(prev => ({ ...prev, [name]: value }));
  };

  const guardarFusion = async () => {
    // Solo envía los válidos para fusión
    const consecutivos = seleccionadosFusionables.map(g => g.consecutivo_vehiculo);

    if (consecutivos.length < 2) {
      Swal.fire(
        'Atención',
        'Debes seleccionar mínimo dos vehículos en PREAUTORIZADO o REQUIERE AUTORIZACION',
        'warning'
      );
      return;
    }
    if (!fusionForm.nuevo_destino.trim()) {
      Swal.fire('Atención', 'Debes indicar el nuevo destino', 'warning');
      return;
    }
    if (!fusionForm.tipo_vehiculo_sicetac) {
      Swal.fire('Atención', 'Selecciona un tipo de vehículo (SICETAC)', 'warning');
      return;
    }

    const payload = {
      usuario,
      consecutivos,
      nuevo_destino: fusionForm.nuevo_destino.trim().toUpperCase(),
      tipo_vehiculo_sicetac: fusionForm.tipo_vehiculo_sicetac,
      total_flete_solicitado: Number(fusionForm.total_flete_solicitado || 0),
      total_cargue_descargue: Number(fusionForm.total_cargue_descargue || 0),
      total_punto_adicional: Number(fusionForm.total_punto_adicional || 0),
      total_desvio_vehiculo: Number(fusionForm.total_desvio_vehiculo || 0),
      observacion_fusion: fusionForm.observacion_fusion?.trim() || undefined
    };

    setFusionGuardando(true);
    try {
      const res = await fusionarVehiculos(payload);
      const msg = res?.mensaje || 'Fusión realizada';
      Swal.fire('Éxito', msg, 'success');
      cerrarModalFusion();
      setSeleccionados(new Set());
      obtenerPedidos();
    } catch (e: any) {
      setFusionGuardando(false);
      const d = e?.response?.data?.detail ?? e?.response?.data ?? e?.message ?? 'Error desconocido';
      Swal.fire('Error al fusionar', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  };

  // header checkbox: selecciona TODOS los visibles
  const headerChecked = useMemo(() => {
    if (!pedidos.length) return false;
    const allCvs = pedidos.map(g => g.consecutivo_vehiculo);
    return allCvs.length > 0 && allCvs.every(cv => seleccionados.has(cv));
  }, [pedidos, seleccionados]);

  // Para mostrar ayuda en bulkbar
  const cantidadSeleccionados = seleccionados.size;
  const cantidadSeleccionadosPreaut = pedidos.filter(
    g => seleccionados.has(g.consecutivo_vehiculo) && Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT)
  ).length;

  // Para el modal de fusión
  const primerConsecutivoFusionable = seleccionadosFusionables[0]?.consecutivo_vehiculo || '';

  return (
    <div className="TablaPedidos-contenedor">

      {/* Filtros para pantalla grande */}
      {esPantallaGrande && (
        <div className="TablaPedidos-filtros">
          {['ADMIN', 'COORDINADOR', 'ANALISTA', 'GERENTE'].includes(perfil) && (
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
            {['ADMIN', 'COORDINADOR', 'ANALISTA', 'GERENTE'].includes(perfil) && (
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

      {/* 🔽 Barra de acciones masivas (sticky) */}
      {puedeSeleccionar && (
        <div className="TablaPedidos-bulkbar">
          <div className="TablaPedidos-bulkbar-left">
            <label className="TablaPedidos-checkbox">
              <input
                type="checkbox"
                checked={headerChecked}
                onChange={toggleSeleccionTodos}
              />
              <span>Seleccionar todos los visibles</span>
            </label>
            <span className="TablaPedidos-bulkbar-count">
              Seleccionados: {cantidadSeleccionados}
            </span>
            {cantidadSeleccionados > 0 && (
              <span className="TablaPedidos-bulkbar-hint">
                (PREAUT seleccionados: {cantidadSeleccionadosPreaut})
              </span>
            )}
            {seleccionadosInvalidosParaFusion.length > 0 && (
              <span className="TablaPedidos-bulkbar-hint">
                ({seleccionadosInvalidosParaFusion.length} no permiten fusión)
              </span>
            )}
          </div>
          <div className="TablaPedidos-bulkbar-actions">
            <button
              className="TablaPedidos-btn-confirmar"
              disabled={cantidadSeleccionadosPreaut === 0}
              onClick={manejarConfirmacionMasiva}
              title="Confirmar PREAUTORIZADOS → AUTORIZADO"
            >
              Pre Autorizados
            </button>
            <button
              className="TablaPedidos-btn-fusionar"
              disabled={cantidadSeleccionadosFusionables < 2}
              onClick={abrirModalFusion}
              title={
                cantidadSeleccionadosFusionables < 2
                  ? 'Debes seleccionar al menos 2 vehículos en PREAUTORIZADO o REQUIERE AUTORIZACION'
                  : 'Fusionar 2 o más vehículos seleccionados'
              }
            >
              Fusionar
            </button>
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
                {/* Columna selección (perfiles permitidos) */}
                <th className="TablaPedidos-col-select">
                  {puedeSeleccionar ? 'Sel.' : ''}
                </th>
                <th></th>
                <th>Vehículo</th>
                <th>Acciones</th>
                <th>Tipo</th>
                <th>Destino Final</th>
                <th>Estados</th>
                <th>Puntos</th>
                <th>Kg Reales</th>
                <th>Kg Runt</th>
                <th>Flete Teorico</th>
                <th>Car/desc Teorico</th>
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
              {pedidos.map(g => {
                const estados: string[] = Array.isArray(g.estados) ? g.estados : [];
                const seleccionado = seleccionados.has(g.consecutivo_vehiculo);
                const requiere = requeridoPorEstados(estados);
                const puedeAutorizar = perfilPuedeAutorizar(perfil, requiere);
                const filaRequiereAuth = estados.includes(ESTADO_REQ_COORD) || estados.includes(ESTADO_REQ_GEREN);

                return (
                  <React.Fragment key={g.consecutivo_vehiculo}>
                    <tr className={
                      `${expandido.has(g.consecutivo_vehiculo) ? 'TablaPedidos-row--expanded' : ''} ` +
                      `${filaRequiereAuth ? 'TablaPedidos-row--requires-auth' : ''}`
                    }>
                      {/* Checkbox por fila */}
                      <td className="TablaPedidos-col-select">
                        {puedeSeleccionar ? (
                          <input
                            type="checkbox"
                            checked={seleccionado}
                            onChange={() => toggleSeleccion(g.consecutivo_vehiculo)}
                            aria-label={`Seleccionar ${g.consecutivo_vehiculo}`}
                          />
                        ) : null}
                      </td>

                      {/* Expandir */}
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
                        {/* REQUIERE AUTORIZACION [COORD/GERENTE] -> AUTORIZAR */}
                        {filaRequiereAuth && puedeAutorizar && (
                          <button
                            className="TablaPedidos-btn-autorizar"
                            onClick={() => manejarAutorizar(g)}
                            title={`Autorizar (${requiere})`}
                          >
                            Autorizar
                          </button>
                        )}
                        {/* PREAUTORIZADO -> CONFIRMAR (ADMIN/DESP/OPER) */}
                        {Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT) && perfilesConEdicion.includes(perfil as any) && (
                          <button
                            className="TablaPedidos-btn-confirmar"
                            onClick={() => manejarConfirmarPreautorizado(g.consecutivo_vehiculo)}
                          >
                            Confirmar
                          </button>
                        )}
                        {/* Eliminar */}
                        {['ADMIN', 'OPERADOR'].includes(perfil) && (
                          <button className="TablaPedidos-btn-eliminar" onClick={() => manejarEliminar(g.consecutivo_vehiculo)}>
                            Eliminar
                          </button>
                        )}
                        {/* Editar */}
                        {perfilesConEdicion.includes(perfil as any) && (
                          <button className="TablaPedidos-btn-editar" onClick={() => abrirModalEditar(g)}>
                            Editar
                          </button>
                        )}
                      </td>

                      <td>{(g.tipo_vehiculo_sicetac || '').split('_')[0]}</td>
                      <td>{g.destino}</td>
                      <td>{estados.join(', ')}</td>
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
                        <td colSpan={21}>
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
                );
              })}
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

            <div className="TablaPedidos-form-grupo">
              <label>Flete solicitado (vehículo)</label>
              <input
                type="number"
                step="1"
                min={1}
                onKeyDown={(e) => {
                  // Evita que '0' sea el primer y único valor
                  if (e.key === '0' && !editForm.total_flete_solicitado) e.preventDefault();
                }}
                name="total_flete_solicitado"
                value={editForm.total_flete_solicitado}
                onChange={onChangeEdit}
                placeholder="Ej: 1.200.000"
              />
            </div>

            <div className="TablaPedidos-modal-editar-grid">
              <div className="TablaPedidos-form-grupo">
                <label>Tipo vehículo (RUNT)</label>
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
                <label>Total kilos (RUNT)</label>
                <input
                  type="number"
                  step="0.01"
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === '0' && !editForm.total_kilos_vehiculo_sicetac) e.preventDefault();
                  }}
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

              <div className="TablaPedidos-form-grupo">
                <label>Car/desc</label>
                <input
                  type="number"
                  step="1"
                  name="total_cargue_descargue"
                  value={editForm.total_cargue_descargue}
                  onChange={onChangeEdit}
                  placeholder="Ej: 80000"
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

      {/* ====================== MODAL FUSIÓN ====================== */}
      {mostrarModalFusion && (
        <div className="TablaPedidos-modal-editar">
          <div className="TablaPedidos-modal-editar-contenido">
            <div className="TablaPedidos-modal-editar-header">
              <h3>Fusionar vehículos</h3>
              <span className="TablaPedidos-modal-editar-consec">
                Se fusionarán {cantidadSeleccionadosFusionables} vehículos. El consecutivo final será el del primero válido seleccionado: <b>{primerConsecutivoFusionable}</b>
              </span>
            </div>

            <div className="TablaPedidos-modal-editar-grid">
              <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full">
                <label>Nuevo destino</label>
                <input
                  name="nuevo_destino"
                  value={fusionForm.nuevo_destino}
                  onChange={onChangeFusion}
                  placeholder="Ej: BOGOTA"
                />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Tipo vehículo (SICETAC)</label>
                <select
                  name="tipo_vehiculo_sicetac"
                  value={fusionForm.tipo_vehiculo_sicetac}
                  onChange={onChangeFusion}
                >
                  <option value="">Seleccione…</option>
                  {opcionesTipoSicetac.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Flete solicitado</label>
                <input
                  type="number"
                  step="1"
                  name="total_flete_solicitado"
                  value={fusionForm.total_flete_solicitado}
                  onChange={onChangeFusion}
                  placeholder="Ej: 1200000"
                />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Car/desc total</label>
                <input
                  type="number"
                  step="1"
                  name="total_cargue_descargue"
                  value={fusionForm.total_cargue_descargue}
                  onChange={onChangeFusion}
                  placeholder="Ej: 80000"
                />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Punto adicional total</label>
                <input
                  type="number"
                  step="1"
                  name="total_punto_adicional"
                  value={fusionForm.total_punto_adicional}
                  onChange={onChangeFusion}
                  placeholder="Ej: 50000"
                />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Desvío total</label>
                <input
                  type="number"
                  step="1"
                  name="total_desvio_vehiculo"
                  value={fusionForm.total_desvio_vehiculo}
                  onChange={onChangeFusion}
                  placeholder="Ej: 200000"
                />
              </div>

              <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full">
                <label>Observación de fusión (opcional)</label>
                <textarea
                  name="observacion_fusion"
                  rows={3}
                  value={fusionForm.observacion_fusion}
                  onChange={onChangeFusion}
                  placeholder="Motivo de la fusión…"
                />
              </div>
            </div>

            <div className="TablaPedidos-modal-editar-actions">
              <button className="TablaPedidos-btn-cancelar" onClick={cerrarModalFusion}>
                Cancelar
              </button>
              <button
                className="TablaPedidos-btn-guardar"
                onClick={guardarFusion}
                disabled={fusionGuardando}
              >
                {fusionGuardando ? 'Fusionando…' : 'Fusionar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==================== /MODAL FUSIÓN ==================== */}
    </div>
  );
};

export default TablaPedidos;
