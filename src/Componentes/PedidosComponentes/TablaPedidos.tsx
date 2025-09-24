import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import {
  listarPedidosVehiculos,
  autorizarPorConsecutivoVehiculo,
  eliminarPedidosPorConsecutivoVehiculo,
  ajustarTotalesVehiculo,
  confirmarPreautorizados,
  fusionarVehiculos,
  dividirVehiculo,
  // Tipos del cliente API
  AjusteVehiculo,
  DividirHastaTresPayload,
  ListarVehiculosResponse as VehiculoGroup,
  Pedido
} from '../../Funciones/ApiPedidos/apiPedidos';
import './TablaPedidos.css';

/***********************************
 * Utilidades y tipos locales
 ***********************************/

type Perfil = 'ADMIN' | 'COORDINADOR' | 'ANALISTA' | 'DESPACHADOR' | 'OPERADOR' | 'CONTROL' | string;

type EditFormState = {
  consecutivo_vehiculo: string;
  tipo_vehiculo_sicetac: string;
  total_kilos_vehiculo_sicetac: string; // input controlado
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


const opcionesTipoSicetac = ['CARRY', 'NHR', 'TURBO', 'NIES', 'SENCILLO', 'PATINETA', 'TRACTOMULA'];

const ESTADO_PREAUT = 'PREAUTORIZADO';
const ESTADO_AUT = 'AUTORIZADO';
const ESTADO_REQ_COORD = 'REQUIERE AUTORIZACION COORDINADOR';
const ESTADO_REQ_GEREN = 'REQUIERE AUTORIZACION CONTROL';
const ESTADO_COMPLETADO = 'COMPLETADO';

const estadosDisponibles = [ESTADO_PREAUT, ESTADO_AUT, ESTADO_REQ_COORD, ESTADO_REQ_GEREN, ESTADO_COMPLETADO];
const regionesDisponibles = ['FUNZA', 'CELTA', 'GIRARDOTA', 'BUCARAMANGA', 'CALI', 'BARRANQUILLA'];

const perfilesConEdicion = ['ADMIN', 'DESPACHADOR', 'ANALISTA', 'OPERADOR'] as const;

/***********************************
 * Helpers puros
 ***********************************/

function asString(v: unknown): string {
  return v == null ? '' : String(v);
}

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const formatoMoneda = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

const esFusionable = (g: VehiculoGroup) => {
  const e: string[] = Array.isArray(g.estados) ? g.estados : [];
  return e.includes(ESTADO_PREAUT) || e.includes(ESTADO_REQ_COORD) || e.includes(ESTADO_REQ_GEREN);
};

const esDivisible = (g: VehiculoGroup) => esFusionable(g);

function requeridoPorEstados(estados: string[]): 'COORDINADOR' | 'CONTROL' | null {
  if (!Array.isArray(estados) || estados.length === 0) return null;
  const upper = estados.map((e) => (e || '').toUpperCase());
  const pideCoord = upper.includes(ESTADO_REQ_COORD);
  const pideGeren = upper.includes(ESTADO_REQ_GEREN);
  if (pideGeren) return 'CONTROL';
  if (pideCoord) return 'COORDINADOR';
  return null;
}

function perfilPuedeAutorizar(perfil: Perfil, requerido: 'COORDINADOR' | 'CONTROL' | null): boolean {
  const p = (perfil || '').toUpperCase();
  if (!requerido) return false;
  if (p === 'ADMIN') return true;
  if (requerido === 'CONTROL') return p === 'CONTROL';
  if (requerido === 'COORDINADOR') return p === 'COORDINADOR' || p === 'CONTROL';
  return false;
}

function parseNumberLoose(s: string): number | undefined {
  if (s == null || s === '') return undefined;
  const n = Number(String(s).replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : undefined;
}

/***********************************
 * Subcomponentes puros y memoizados
 ***********************************/

const CellMoney: React.FC<{ value: unknown; highlightPositive?: boolean }>
  = React.memo(({ value, highlightPositive }) => {
    const n = typeof value === 'number' ? value : Number(value ?? 0);
    return (
      <td className={classNames(highlightPositive && n > 0 && 'TablaPedidos-cell--error')}>
        {formatoMoneda(value)}
      </td>
    );
  });
CellMoney.displayName = 'CellMoney';

const DetailsTable: React.FC<{ pedidos: Pedido[] }>
  = React.memo(({ pedidos }) => {
    return (
      <table className="TablaPedidos-subtable" role="grid" aria-label="Detalle de pedidos del vehículo">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Origen</th>
            <th>Destino Real</th>
            <th>Cliente</th>
            <th>Ubicación Descargue</th>
            <th>Kilos</th>
            <th>Planilla</th>
            <th>Observaciones</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
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
    );
  });
DetailsTable.displayName = 'DetailsTable';

/***********************************
 * Componente principal
 ***********************************/

const TablaPedidos: React.FC = () => {
  const perfil = (Cookies.get('perfilPedidosCookie') || '') as Perfil;
  const usuario = Cookies.get('usuarioPedidosCookie') || '';
  const regionalUsuario = Cookies.get('regionalPedidosCookie') || '';

  // estado base
  const [pedidos, setPedidos] = useState<VehiculoGroup[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandido, setExpandido] = useState<Set<string>>(new Set());
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroRegional, setFiltroRegional] = useState<string>('TODOS');
  const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
  const [esPantallaGrande, setEsPantallaGrande] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 900 : true
  );

  // edición
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

  // fusión
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

  // división
  const [mostrarModalDividir, setMostrarModalDividir] = useState(false);
  const [divisionGuardando, setDivisionGuardando] = useState(false);
  const [divisionVehiculo, setDivisionVehiculo] = useState<VehiculoGroup | null>(null);
  const [divisionDestino, setDivisionDestino] = useState('');
  const [divisionObs, setDivisionObs] = useState('');
  const [divisionDestB, setDivisionDestB] = useState<Set<string>>(new Set());
  const [divisionDestC, setDivisionDestC] = useState<Set<string>>(new Set());

  // split por kilos (Opción 2)
  type SplitState = { docId?: string; ci: string; kg: string; cajas?: string };
  const [splitB, setSplitB] = useState<SplitState>({ ci: '', kg: '', cajas: '' });
  const [splitC, setSplitC] = useState<SplitState>({ ci: '', kg: '', cajas: '' });

  // selección global
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  // watchers de tamaño
  useLayoutEffect(() => {
    const onResize = () => setEsPantallaGrande(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const obtenerPedidos = useCallback(async () => {
    setCargando(true);
    const esAdminType = ['ADMIN', 'COORDINADOR', 'ANALISTA', 'CONTROL'].includes(perfil);
    const filtros: any = {};
    if (filtroEstado !== 'TODOS') filtros.estados = [filtroEstado];
    filtros.regionales = esAdminType
      ? filtroRegional === 'TODOS'
        ? regionesDisponibles
        : [filtroRegional]
      : [regionalUsuario];
    try {
      const res: VehiculoGroup[] = await listarPedidosVehiculos(usuario, filtros);
      setPedidos(Array.isArray(res) ? res : []);
      setSeleccionados(new Set());
    } catch (e: any) {
      Swal.fire('Error', e?.response?.data?.detail || e?.message || 'Error al listar', 'error');
    } finally {
      setCargando(false);
    }
  }, [perfil, filtroEstado, filtroRegional, regionalUsuario, usuario]);

  useEffect(() => {
    void obtenerPedidos();
  }, [obtenerPedidos]);

  const manejarExpandir = useCallback((id: string) => {
    setExpandido((prev) => {
      const copia = new Set(prev);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }, []);

  /***************
   * Acciones fila
   ***************/

  const manejarAutorizar = useCallback(async (grupo: VehiculoGroup) => {
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
      cancelButtonText: 'Cancelar',
    });

    try {
      await autorizarPorConsecutivoVehiculo([grupo.consecutivo_vehiculo], usuario, obs ?? undefined);
      Swal.fire('Listo', 'Vehículo autorizado', 'success');
      void obtenerPedidos();
    } catch (e: any) {
      const d = e?.response?.data?.detail || e?.response?.data || e?.message;
      Swal.fire('Error', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  }, [perfil, usuario, obtenerPedidos]);

  const manejarConfirmarPreautorizado = useCallback(async (consec: string) => {
    const { value: obs } = await Swal.fire({
      title: 'Confirmar PREAUTORIZADO',
      input: 'textarea',
      inputLabel: 'Observaciones del aprobador (opcional)',
      inputPlaceholder: 'Escribe una nota si lo deseas…',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
    try {
      await confirmarPreautorizados([consec], usuario, obs ?? undefined);
      Swal.fire('Listo', 'Vehículo confirmado a AUTORIZADO', 'success');
      void obtenerPedidos();
    } catch (e: any) {
      const d = e?.response?.data?.detail || e?.response?.data || e?.message;
      Swal.fire('Error', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  }, [usuario, obtenerPedidos]);

  const manejarEliminar = useCallback(async (consec: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar vehículo?',
      text: consec,
      icon: 'warning',
      showCancelButton: true,
    });
    if (!isConfirmed) return;
    try {
      await eliminarPedidosPorConsecutivoVehiculo(consec, usuario);
      Swal.fire('Eliminado', 'Vehículo eliminado', 'success');
      void obtenerPedidos();
    } catch (e: any) {
      Swal.fire('Error', e?.response?.data?.detail || e?.message || 'No se pudo eliminar', 'error');
    }
  }, [usuario, obtenerPedidos]);

  /***************
   * Edición (ajustes)
   ***************/

  const abrirModalEditar = useCallback((g: VehiculoGroup) => {
    if (!perfilesConEdicion.includes(perfil as any)) return;
    setEditForm({
      consecutivo_vehiculo: g.consecutivo_vehiculo,
      tipo_vehiculo_sicetac: (g.tipo_vehiculo_sicetac || g.tipo_vehiculo || '').split('_')[0],
      total_kilos_vehiculo_sicetac: String(g.total_kilos_vehiculo_sicetac ?? ''),
      total_desvio_vehiculo: String(g.total_desvio_vehiculo ?? ''),
      total_punto_adicional: String(g.total_punto_adicional ?? ''),
      total_cargue_descargue: String(g.total_cargue_descargue ?? ''),
      total_flete_solicitado: String(g.total_flete_solicitado ?? ''),
      Observaciones_ajustes: g.Observaciones_ajustes ?? '',
    });
    setMostrarModalEditar(true);
  }, [perfil]);

  const cerrarModalEditar = useCallback(() => {
    setMostrarModalEditar(false);
    setGuardandoEdicion(false);
  }, []);

  const onChangeEdit = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const guardarEdicion = useCallback(async () => {
    if (!editForm.consecutivo_vehiculo) {
      Swal.fire('Atención', 'Falta consecutivo_vehiculo', 'warning');
      return;
    }
    if (!editForm.tipo_vehiculo_sicetac) {
      Swal.fire('Atención', 'Selecciona un tipo de vehículo (SICETAC)', 'warning');
      return;
    }

    const flete = parseNumberLoose(editForm.total_flete_solicitado);
    const kilos = parseNumberLoose(editForm.total_kilos_vehiculo_sicetac);

    if (!Number.isFinite(flete!) || (flete as number) <= 0) {
      Swal.fire('Atención', 'El flete solicitado debe ser un número mayor a 0', 'warning');
      return;
    }
    if (!Number.isFinite(kilos!) || (kilos as number) <= 0) {
      Swal.fire('Atención', 'El peso (kilos RUNT) debe ser un número mayor a 0', 'warning');
      return;
    }

    const ajuste: AjusteVehiculo = {
      consecutivo_vehiculo: editForm.consecutivo_vehiculo,
      tipo_vehiculo_sicetac: editForm.tipo_vehiculo_sicetac || undefined,
      total_kilos_vehiculo_sicetac: kilos,
      total_desvio_vehiculo: parseNumberLoose(editForm.total_desvio_vehiculo),
      total_punto_adicional: parseNumberLoose(editForm.total_punto_adicional),
      total_cargue_descargue: parseNumberLoose(editForm.total_cargue_descargue),
      total_flete_solicitado: flete,
      Observaciones_ajustes: editForm.Observaciones_ajustes?.trim() || undefined,
    };

    setGuardandoEdicion(true);
    try {
      await ajustarTotalesVehiculo(usuario, [ajuste]);
      Swal.fire('Listo', 'Ajuste aplicado y estado recalculado', 'success');
      cerrarModalEditar();
      void obtenerPedidos();
    } catch (e: any) {
      setGuardandoEdicion(false);
      Swal.fire('Error', e?.response?.data?.detail || e?.message || 'No se pudo ajustar', 'error');
    }
  }, [editForm, usuario, obtenerPedidos, cerrarModalEditar]);

  /***************
   * Selección
   ***************/

  const puedeSeleccionar = perfilesConEdicion.includes(perfil as any);

  const toggleSeleccion = useCallback((cv: string) => {
    if (!puedeSeleccionar) return;
    setSeleccionados((prev) => {
      const s = new Set(prev);
      s.has(cv) ? s.delete(cv) : s.add(cv);
      return s;
    });
  }, [puedeSeleccionar]);

  const toggleSeleccionTodos = useCallback(() => {
    if (!puedeSeleccionar) return;
    setSeleccionados((prev) => {
      const actuales = new Set(prev);
      const allCvs = pedidos.map((g) => g.consecutivo_vehiculo);
      const todosYa = allCvs.every((cv) => actuales.has(cv));
      if (todosYa) allCvs.forEach((cv) => actuales.delete(cv));
      else allCvs.forEach((cv) => actuales.add(cv));
      return actuales;
    });
  }, [pedidos, puedeSeleccionar]);

  const manejarConfirmacionMasiva = useCallback(async () => {
    const seleccionPreaut = pedidos
      .filter(
        (g) => seleccionados.has(g.consecutivo_vehiculo) && Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT)
      )
      .map((g) => g.consecutivo_vehiculo);

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
      cancelButtonText: 'Cancelar',
    });
    try {
      const res = await confirmarPreautorizados(seleccionPreaut, usuario, obs ?? undefined);
      const msg = typeof res?.mensaje === 'string' ? res.mensaje : `Confirmados: ${seleccionPreaut.length}`;
      Swal.fire('Éxito', msg, 'success');
      setSeleccionados(new Set());
      void obtenerPedidos();
    } catch (e: any) {
      const d = e?.response?.data?.detail || e?.response?.data || e?.message;
      Swal.fire('Error', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  }, [pedidos, seleccionados, usuario, obtenerPedidos]);

  /***************
   * Fusión
   ***************/

  const seleccionadosFusionables = useMemo(
    () => pedidos.filter((g) => seleccionados.has(g.consecutivo_vehiculo) && esFusionable(g)),
    [pedidos, seleccionados]
  );
  const cantidadSeleccionadosFusionables = seleccionadosFusionables.length;

  const seleccionadosInvalidosParaFusion = useMemo(() => {
    return Array.from(seleccionados).filter((cv) => {
      const g = pedidos.find((p) => p.consecutivo_vehiculo === cv);
      return g && !esFusionable(g);
    });
  }, [seleccionados, pedidos]);

  const abrirModalFusion = useCallback(() => {
    if (!puedeSeleccionar) return;

    if (cantidadSeleccionadosFusionables < 2) {
      Swal.fire('Atención', 'Selecciona al menos 2 vehículos con estado PREAUTORIZADO o REQUIERE AUTORIZACION', 'warning');
      return;
    }

    if (seleccionadosInvalidosParaFusion.length) {
      Swal.fire(
        'Aviso',
        `Se ignorarán (no válidos para fusión):\n${seleccionadosInvalidosParaFusion.join(', ')}`,
        'info'
      );
    }

    const primero = seleccionadosFusionables[0];
    setFusionForm({
      nuevo_destino: (primero?.destino || '').toString().toUpperCase(),
      tipo_vehiculo_sicetac: (primero?.tipo_vehiculo_sicetac || primero?.tipo_vehiculo || '').split('_')[0],
      total_flete_solicitado: '',
      total_cargue_descargue: '',
      total_punto_adicional: '',
      total_desvio_vehiculo: '',
      observacion_fusion: '',
    });
    setMostrarModalFusion(true);
  }, [puedeSeleccionar, cantidadSeleccionadosFusionables, seleccionadosInvalidosParaFusion, seleccionadosFusionables]);

  const cerrarModalFusion = useCallback(() => {
    setMostrarModalFusion(false);
    setFusionGuardando(false);
  }, []);

  const onChangeFusion = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFusionForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const guardarFusion = useCallback(async () => {
    const consecutivos = seleccionadosFusionables.map((g) => g.consecutivo_vehiculo);
    if (consecutivos.length < 2) {
      Swal.fire('Atención', 'Debes seleccionar mínimo dos vehículos en PREAUTORIZADO o REQUIERE AUTORIZACION', 'warning');
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
      observacion_fusion: fusionForm.observacion_fusion?.trim() || undefined,
    };

    setFusionGuardando(true);
    try {
      const res = await fusionarVehiculos(payload);
      Swal.fire('Éxito', res?.mensaje || 'Fusión realizada', 'success');
      cerrarModalFusion();
      setSeleccionados(new Set());
      void obtenerPedidos();
    } catch (e: any) {
      setFusionGuardando(false);
      const d = e?.response?.data?.detail ?? e?.response?.data ?? e?.message ?? 'Error desconocido';
      Swal.fire('Error al fusionar', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  }, [seleccionadosFusionables, fusionForm, usuario, cerrarModalFusion, obtenerPedidos]);

  /***************
   * División
   ***************/

  const destinatariosUnicos = useMemo<string[]>(() => {
    const vals = new Set<string>();
    if (divisionVehiculo?.pedidos && Array.isArray(divisionVehiculo.pedidos)) {
      divisionVehiculo.pedidos.forEach((p: any) => {
        const s = asString(p?.ubicacion_descargue);
        if (s) vals.add(s);
      });
    }
    return Array.from(vals);
  }, [divisionVehiculo]);

  // Reemplaza "consecutivosDoc" por esto:
  type DocSplitOpt = {
    id: string;           // _id del doc (o p.id si ya lo traes así)
    ci: string;
    kgRunt: number;       // num_kilos_sicetac (fallback a num_kilos)
    kgFis: number;        // num_kilos (solo informativo)
    cajas: number;
    label: string;        // texto visible en el select
  };

  // ⚠️ Ajusta la propiedad que trae el ID: p._id, p.id, etc.
  const docsParaSplit: DocSplitOpt[] = useMemo(() => {
    const src = (divisionVehiculo?.pedidos as any[]) ?? [];
    return src.map((p) => {
      const id = String(p._id ?? p.id);  // usa la que tengas
      const ci = String(p.consecutivo_integrapp ?? '');
      const kgRunt = Number(p.num_kilos_sicetac ?? p.num_kilos ?? 0);
      const kgFis  = Number(p.num_kilos ?? 0);
      const cajas  = Number(p.num_cajas ?? 0);
      return {
        id,
        ci,
        kgRunt,
        kgFis,
        cajas,
        label: `${ci} · ${kgRunt} kg RUNT · ${cajas} cajas`
      };
    });
  }, [divisionVehiculo]);


  const moverADest = useCallback((dest: string, grupo: 'B' | 'C') => {
    const d = dest.trim();
    if (!d) return;
    if (grupo === 'B') {
      setDivisionDestB((prev) => {
        const nb = new Set(prev);
        nb.add(d);
        return nb;
      });
      setDivisionDestC((prev) => {
        const nc = new Set(prev);
        nc.delete(d);
        return nc;
      });
    } else {
      setDivisionDestC((prev) => {
        const nc = new Set(prev);
        nc.add(d);
        return nc;
      });
      setDivisionDestB((prev) => {
        const nb = new Set(prev);
        nb.delete(d);
        return nb;
      });
    }
  }, []);

  const quitarDeGrupo = useCallback((dest: string, grupo: 'B' | 'C') => {
    const d = dest.trim();
    if (!d) return;
    if (grupo === 'B') {
      setDivisionDestB((prev) => {
        const nb = new Set(prev);
        nb.delete(d);
        return nb;
      });
    } else {
      setDivisionDestC((prev) => {
        const nc = new Set(prev);
        nc.delete(d);
        return nc;
      });
    }
  }, []);

  const limpiarSeleccionDivision = useCallback(() => {
    setDivisionDestB(new Set());
    setDivisionDestC(new Set());
  }, []);

  const abrirModalDividir = useCallback((g: VehiculoGroup) => {
    if (!perfilesConEdicion.includes(perfil as any)) {
      Swal.fire('Sin permiso', 'Tu perfil no puede dividir vehículos', 'warning');
      return;
    }
    if (!esDivisible(g)) {
      Swal.fire('Estado inválido', 'Solo se pueden dividir vehículos en PREAUTORIZADO o REQUIERE AUTORIZACION', 'warning');
      return;
    }
    setDivisionVehiculo(g);
    setDivisionDestino((g?.destino || '').toString().toUpperCase());
    setDivisionObs('');
    limpiarSeleccionDivision();
    setMostrarModalDividir(true);
  }, [perfil, limpiarSeleccionDivision]);

  const cerrarModalDividir = useCallback(() => {
    setMostrarModalDividir(false);
    setDivisionVehiculo(null);
    setDivisionGuardando(false);
    limpiarSeleccionDivision();
    setSplitB({ ci: '', kg: '', cajas: '' });
    setSplitC({ ci: '', kg: '', cajas: '' });
  }, [limpiarSeleccionDivision]);

  const guardarDivision = useCallback(async () => {
    if (!divisionVehiculo) return;

    const arrB = Array.from(divisionDestB);
    const arrC = Array.from(divisionDestC);

    const validSplitB = !!(splitB.ci && Number(splitB.kg) > 0);
    const validSplitC = !!(splitC.ci && Number(splitC.kg) > 0);

    if (!divisionDestino.trim()) {
      Swal.fire('Atención', 'Debes indicar el destino único', 'warning');
      return;
    }

    // Caso "nada para dividir"
    if (arrB.length === 0 && arrC.length === 0 && !validSplitB && !validSplitC) {
      Swal.fire('Atención', 'No hay nada para dividir; asigna destinatarios o configura un split por kilos', 'warning');
      return;
    }

    // Regla "no C sin B": aplica si no hay nada en B (ni destinatarios ni split) y sí hay algo en C
    if (!arrB.length && !validSplitB && (arrC.length || validSplitC)) {
      Swal.fire('Atención', 'No puedes crear C sin B', 'warning');
      return;
    }

    // Regla "A no vacío": si usas solo destinatarios, asegúrate de que quede alguno en A;
    // si usas split por kilos, el back ya valida que el remanente > 0 en el doc partido.
    const totalDest = destinatariosUnicos.length;
    if ((arrB.length + arrC.length) >= totalDest && !validSplitB && !validSplitC) {
      Swal.fire('Atención', 'El grupo A no puede quedar vacío (deja al menos un destinatario sin mover)', 'warning');
      return;
    }

    // Validaciones soft para split: que los kilos no superen a los del doc
    // helper
    const getDoc = (id?: string) => docsParaSplit.find(d => d.id === id);

    if (validSplitB) {
      const doc = getDoc(splitB.docId);
      const kgNum = Number(splitB.kg);
      if (!doc) return Swal.fire('Atención', 'Debes seleccionar el documento origen para B', 'warning');
      if (kgNum >= doc.kgRunt) {
        return Swal.fire('Atención', `Kilos a mover a B (${kgNum}) no pueden ser ≥ a los kg RUNT del doc (${doc.kgRunt})`, 'warning');
      }
    }
    if (validSplitC) {
      const doc = getDoc(splitC.docId);
      const kgNum = Number(splitC.kg);
      if (!doc) return Swal.fire('Atención', 'Debes seleccionar el documento origen para C', 'warning');
      if (kgNum >= doc.kgRunt) {
        return Swal.fire('Atención', `Kilos a mover a C (${kgNum}) no pueden ser ≥ a los kg RUNT del doc (${doc.kgRunt})`, 'warning');
      }
    }

    // Arma payload: puedes mandar destinatarios y/o split en cada grupo
    const payload: DividirHastaTresPayload = {
      usuario,
      consecutivo_origen: divisionVehiculo.consecutivo_vehiculo,
      destino_unico: divisionDestino.trim().toUpperCase(),
      observacion_division: divisionObs?.trim() || undefined,
      campo_destinatario: (arrB.length || arrC.length) ? 'ubicacion_descargue' : undefined,
      grupo_B: (arrB.length || validSplitB) ? {
        destinatarios: arrB.length ? arrB : undefined,
        split: validSplitB ? {
          consecutivo_integrapp: splitB.ci,
          kilos: Number(splitB.kg),
          cajas: splitB.cajas ? Number(splitB.cajas) : undefined,
          doc_id: splitB.docId,             // 👈 NUEVO
        } : undefined
      } : undefined,
      grupo_C: (arrC.length || validSplitC) ? {
        destinatarios: arrC.length ? arrC : undefined,
        split: validSplitC ? {
          consecutivo_integrapp: splitC.ci,
          kilos: Number(splitC.kg),
          cajas: splitC.cajas ? Number(splitC.cajas) : undefined,
          doc_id: splitC.docId,             // 👈 NUEVO
        } : undefined
      } : undefined,
    };


    setDivisionGuardando(true);
    try {
      const res = await dividirVehiculo(payload);
      Swal.fire('Éxito', res?.mensaje || 'División realizada', 'success');
      cerrarModalDividir();
      void obtenerPedidos();
    } catch (e: any) {
      setDivisionGuardando(false);
      const d = e?.response?.data?.detail ?? e?.response?.data ?? e?.message ?? 'Error desconocido';
      Swal.fire('Error al dividir', typeof d === 'string' ? d : JSON.stringify(d, null, 2), 'error');
    }
  }, [
    divisionVehiculo,
    divisionDestino,
    divisionObs,
    destinatariosUnicos.length,
    divisionDestB,
    divisionDestC,
    splitB,
    splitC,
    usuario,
    cerrarModalDividir,
    obtenerPedidos
  ]);

  /***************
   * Derivados UI
   ***************/

  const headerChecked = useMemo(() => {
    if (!pedidos.length) return false;
    const allCvs = pedidos.map((g) => g.consecutivo_vehiculo);
    return allCvs.length > 0 && allCvs.every((cv) => seleccionados.has(cv));
  }, [pedidos, seleccionados]);

  const cantidadSeleccionados = seleccionados.size;
  const cantidadSeleccionadosPreaut = useMemo(
    () =>
      pedidos.filter(
        (g) => seleccionados.has(g.consecutivo_vehiculo) && Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT)
      ).length,
    [pedidos, seleccionados]
  );

  const primerConsecutivoFusionable = seleccionadosFusionables[0]?.consecutivo_vehiculo || '';

  /***************
   * Render
   ***************/

  return (
    <div className="TablaPedidos-contenedor">
      {/* Filtros desktop */}
      {esPantallaGrande && (
        <div className="TablaPedidos-filtros">
          {['ADMIN', 'COORDINADOR', 'ANALISTA', 'CONTROL'].includes(perfil) && (
            <select value={filtroRegional} onChange={(e) => setFiltroRegional(e.target.value)}>
              <option value="TODOS">Todas regionales</option>
              {regionesDisponibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="TODOS">Todos estados</option>
            {estadosDisponibles.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <button onClick={obtenerPedidos}>Filtrar</button>
        </div>
      )}

      {/* Filtros mobile */}
      {!esPantallaGrande && (
        <button className="TablaPedidos-btn-filtros-mobile" onClick={() => setMostrarModalFiltros(true)}>
          Filtros
        </button>
      )}

      {mostrarModalFiltros && !esPantallaGrande && (
        <div className="TablaPedidos-modal-filtros" role="dialog" aria-modal="true">
          <div className="TablaPedidos-modal-contenido">
            {['ADMIN', 'COORDINADOR', 'ANALISTA', 'CONTROL'].includes(perfil) && (
              <select value={filtroRegional} onChange={(e) => setFiltroRegional(e.target.value)}>
                <option value="TODOS">Todas regionales</option>
                {regionesDisponibles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="TODOS">Todos estados</option>
              {estadosDisponibles.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <div className="TablaPedidos-modal-botones">
              <button onClick={obtenerPedidos}>Filtrar</button>
              <button onClick={() => setMostrarModalFiltros(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones bulk */}
      {perfilesConEdicion.includes(perfil as any) && (
        <div className="TablaPedidos-bulkbar">
          <div className="TablaPedidos-bulkbar-left">
            <label className="TablaPedidos-checkbox">
              <input type="checkbox" checked={headerChecked} onChange={toggleSeleccionTodos} />
              <span>Seleccionar todos los visibles</span>
            </label>
            <span className="TablaPedidos-bulkbar-count">Seleccionados: {cantidadSeleccionados}</span>
            {cantidadSeleccionados > 0 && (
              <span className="TablaPedidos-bulkbar-hint">(PREAUT seleccionados: {cantidadSeleccionadosPreaut})</span>
            )}
            {seleccionadosInvalidosParaFusion.length > 0 && (
              <span className="TablaPedidos-bulkbar-hint">({seleccionadosInvalidosParaFusion.length} no permiten fusión)</span>
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
        <p>Cargando…</p>
      ) : (
        <div className="TablaPedidos-tabla-container">
          <table className="TablaPedidos-table" role="grid" aria-label="Listado de vehículos y pedidos">
            <thead className="TablaPedidos-table-titulos">
              <tr>
                <th className="TablaPedidos-col-select">{perfilesConEdicion.includes(perfil as any) ? 'Sel.' : ''}</th>
                <th></th>
                <th>Vehículo</th>
                <th>Acciones</th>
                <th>Tipo</th>
                <th>Destino Final</th>
                <th>Estados</th>
                <th>Puntos</th>
                <th>Kg Reales</th>
                <th>Kg Runt</th>
                <th>Flete Teórico</th>
                <th>Car/desc Teórico</th>
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
              {pedidos.map((g) => {                
                const estados: string[] = Array.isArray(g.estados) ? g.estados : [];
                const seleccionado = seleccionados.has(g.consecutivo_vehiculo);
                const requiere = requeridoPorEstados(estados);
                const puedeAutorizar = perfilPuedeAutorizar(perfil, requiere);
                const filaRequiereAuth = estados.includes(ESTADO_REQ_COORD) || estados.includes(ESTADO_REQ_GEREN);                
                const totalSolicitadoEsCero = Number(g.costo_real_vehiculo ?? 0) === 0;


                return (
                  <React.Fragment key={g.consecutivo_vehiculo}>
                    <tr
                      className={classNames(
                        expandido.has(g.consecutivo_vehiculo) && 'TablaPedidos-row--expanded',
                        filaRequiereAuth && 'TablaPedidos-row--requires-auth',
                        totalSolicitadoEsCero && 'TablaPedidos-row--total-solicitado-cero' // 👈 AÑADIDO
                      )}
                    >
                      <td className="TablaPedidos-col-select">
                        {perfilesConEdicion.includes(perfil as any) ? (
                          <input
                            type="checkbox"
                            checked={seleccionado}
                            onChange={() => toggleSeleccion(g.consecutivo_vehiculo)}
                            aria-label={`Seleccionar ${g.consecutivo_vehiculo}`}
                          />
                        ) : null}
                      </td>

                      <td>
                        <button onClick={() => manejarExpandir(g.consecutivo_vehiculo)} aria-label="Alternar detalle">
                          {expandido.has(g.consecutivo_vehiculo) ? '−' : '+'}
                        </button>
                      </td>

                      <td
                        className="TablaPedidos-cell-consecutivo"
                        onDoubleClick={() => abrirModalEditar(g)}
                        title="Doble clic para editar"
                      >
                        {g.consecutivo_vehiculo}
                      </td>

                      <td>
                        {filaRequiereAuth && puedeAutorizar && (
                          <button className="TablaPedidos-btn-autorizar" onClick={() => manejarAutorizar(g)} title={`Autorizar (${requiere})`}>
                            Autorizar
                          </button>
                        )}
                        {Array.isArray(g.estados) && g.estados.includes(ESTADO_PREAUT) && perfilesConEdicion.includes(perfil as any) && (
                          <button className="TablaPedidos-btn-confirmar" onClick={() => manejarConfirmarPreautorizado(g.consecutivo_vehiculo)}>
                            Confirmar
                          </button>
                        )}
                        {['ADMIN', 'OPERADOR'].includes(perfil) && (
                          <button className="TablaPedidos-btn-eliminar" onClick={() => manejarEliminar(g.consecutivo_vehiculo)}>
                            Eliminar
                          </button>
                        )}
                        {perfilesConEdicion.includes(perfil as any) && (
                          <button className="TablaPedidos-btn-editar" onClick={() => abrirModalEditar(g)}>
                            Editar
                          </button>
                        )}
                        {perfilesConEdicion.includes(perfil as any) && esDivisible(g) && (
                          <button className="TablaPedidos-btn-dividir" onClick={() => abrirModalDividir(g)} title="Dividir vehículo en A/B/C por destinatario">
                            Dividir
                          </button>
                        )}
                      </td>

                      <td>{(g.tipo_vehiculo_sicetac || '').split('_')[0]}</td>
                      <td>{g.destino}</td>
                      <td>{estados.join(', ')}</td>
                      <td>{g.total_puntos_vehiculo}</td>
                      <td>{g.total_kilos_vehiculo}</td>
                      <td>{g.total_kilos_vehiculo_sicetac}</td>
                      <CellMoney value={g.valor_flete_sistema} />
                      <CellMoney value={g.total_cargue_descargue_teorico} />
                      <CellMoney value={g.total_punto_adicional_teorico} />
                      <CellMoney value={g.costo_teorico_vehiculo} />
                      <CellMoney value={g.total_flete_solicitado} />
                      <CellMoney value={g.total_cargue_descargue} />
                      <CellMoney value={g.total_punto_adicional} />
                      <CellMoney value={g.total_desvio_vehiculo || 0} />
                      <CellMoney value={g.costo_real_vehiculo} />
                      <CellMoney value={g.diferencia_flete} highlightPositive />
                      <td>{g.Observaciones_ajustes}</td>
                    </tr>

                    {expandido.has(g.consecutivo_vehiculo) && (
                      <tr className="TablaPedidos-details">
                        <td colSpan={21}>
                          <DetailsTable pedidos={g.pedidos as unknown as Pedido[]} />
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

      {/* MODAL EDITAR */}
      {mostrarModalEditar && (
        <div className="TablaPedidos-modal-editar" role="dialog" aria-modal="true">
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
                  if (e.key === '0' && !editForm.total_flete_solicitado) e.preventDefault();
                }}
                name="total_flete_solicitado"
                value={editForm.total_flete_solicitado}
                onChange={onChangeEdit}
                placeholder="Ej: 1200000"
              />
            </div>

            <div className="TablaPedidos-modal-editar-grid">
              <div className="TablaPedidos-form-grupo">
                <label>Tipo vehículo (RUNT)</label>
                <select name="tipo_vehiculo_sicetac" value={editForm.tipo_vehiculo_sicetac} onChange={onChangeEdit}>
                  <option value="">Seleccione…</option>
                  {opcionesTipoSicetac.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
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
              <button className="TablaPedidos-btn-guardar" onClick={guardarEdicion} disabled={guardandoEdicion}>
                {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FUSIÓN */}
      {mostrarModalFusion && (
        <div className="TablaPedidos-modal-editar" role="dialog" aria-modal="true">
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
                <input name="nuevo_destino" value={fusionForm.nuevo_destino} onChange={onChangeFusion} placeholder="Ej: BOGOTA" />
              </div>

              <div className="TablaPedidos-form-grupo">
                <label>Tipo vehículo (SICETAC)</label>
                <select name="tipo_vehiculo_sicetac" value={fusionForm.tipo_vehiculo_sicetac} onChange={onChangeFusion}>
                  <option value="">Seleccione…</option>
                  {opcionesTipoSicetac.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
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
              <button className="TablaPedidos-btn-guardar" onClick={guardarFusion} disabled={fusionGuardando}>
                {fusionGuardando ? 'Fusionando…' : 'Fusionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIVIDIR */}
      {mostrarModalDividir && divisionVehiculo && (
        <div className="TablaPedidos-modal-editar" role="dialog" aria-modal="true">
          <div className="TablaPedidos-modal-editar-contenido">
            <div className="TablaPedidos-modal-editar-header">
              <h3>Dividir vehículo</h3>
              <span className="TablaPedidos-modal-editar-consec">
                {divisionVehiculo.consecutivo_vehiculo}
              </span>
            </div>

            {/* Destino único */}
            <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full">
              <label>Destino único (para A/B/C)</label>
              <input
                value={divisionDestino}
                onChange={(e) => setDivisionDestino(e.target.value.toUpperCase())}
                placeholder="Ej: MEDELLIN"
              />
            </div>

            {/* ===== Opción 1: mover por destinatarios ===== */}
            <div className="TablaPedidos-modal-editar-grid TablaPedidos-modal-dividir-grid">
              <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full">
                <label>Destinatarios del vehículo (Opción 1)</label>
                <div className="TablaPedidos-lista-destinatarios">
                  {destinatariosUnicos.length === 0 ? (
                    <div style={{ opacity: 0.7 }}>
                      No hay destinatarios encontrados para el campo seleccionado
                    </div>
                  ) : (
                    destinatariosUnicos.map((dest) => {
                      const enB = divisionDestB.has(dest);
                      const enC = divisionDestC.has(dest);
                      return (
                        <div key={dest} className="TablaPedidos-dest-item">
                          <div className="TablaPedidos-dest-nombre" title={dest}>
                            {dest}
                          </div>
                          <div className="TablaPedidos-dest-actions">
                            <button
                              type="button"
                              className={classNames('TablaPedidos-chip', enB && 'is-active')}
                              onClick={() =>
                                enB ? quitarDeGrupo(dest, 'B') : moverADest(dest, 'B')
                              }
                            >
                              {enB ? 'Quitar de B' : '→ B'}
                            </button>
                            <button
                              type="button"
                              className={classNames('TablaPedidos-chip', enC && 'is-active')}
                              onClick={() =>
                                enC ? quitarDeGrupo(dest, 'C') : moverADest(dest, 'C')
                              }
                              disabled={divisionDestB.has(dest)}
                              title={divisionDestB.has(dest) ? 'Ya está en B' : undefined}
                            >
                              {enC ? 'Quitar de C' : '→ C'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="TablaPedidos-dest-resumen">
                  <span>
                    A (queda):{' '}
                    {Math.max(
                      destinatariosUnicos.length - divisionDestB.size - divisionDestC.size,
                      0
                    )}
                  </span>
                  <span>B: {divisionDestB.size}</span>
                  <span>C: {divisionDestC.size}</span>
                </div>
              </div>
            </div>

            {/* ===== Opción 2: partir un documento por kilos ===== */}
            <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full TablaPedidos-divisionGrupo" style={{ marginTop: 16 }}>
              <label>Opción 2: Partir un documento por kilos</label>

              {/* Split hacia B */}
              <fieldset className="TablaPedidos-fieldset-split">
                <legend>Mandar a B</legend>
                <div className="TablaPedidos-split-grid">
                  <div>
                    <small>Consecutivo Integrapp (doc origen)</small>
                    <select
                      value={splitB.docId ?? ''}
                      onChange={(e) => {
                        const id = e.target.value;
                        const doc = docsParaSplit.find(d => d.id === id);
                        setSplitB(s => ({ ...s, docId: id || undefined, ci: doc?.ci || '' }));
                      }}
                    >
                      <option value="">— Selecciona —</option>
                      {docsParaSplit.map((d) => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <small>Kilos a mover a B</small>
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={splitB.kg}
                      onChange={(e) => setSplitB((s) => ({ ...s, kg: e.target.value }))}
                      placeholder="Ej: 2000"
                    />
                  </div>
                  <div>
                    <small>Cajas (opcional)</small>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={splitB.cajas ?? ''}
                      onChange={(e) => setSplitB((s) => ({ ...s, cajas: e.target.value }))}
                      placeholder="Auto proporcional si vacío"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Split hacia C */}
              <fieldset className="TablaPedidos-fieldset-split">
                <legend>Mandar a C</legend>
                <div className="TablaPedidos-split-grid">
                  <div>
                    <small>Consecutivo Integrapp (doc origen)</small>
                    <select
                      value={splitC.docId ?? ''}
                      onChange={(e) => {
                        const id = e.target.value;
                        const doc = docsParaSplit.find(d => d.id === id);
                        setSplitC(s => ({ ...s, docId: id || undefined, ci: doc?.ci || '' }));
                      }}
                    >
                      <option value="">— Selecciona —</option>
                      {docsParaSplit.map((d) => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <small>Kilos a mover a C</small>
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={splitC.kg}
                      onChange={(e) => setSplitC((s) => ({ ...s, kg: e.target.value }))}
                      placeholder="Ej: 800"
                    />
                  </div>
                  <div>
                    <small>Cajas (opcional)</small>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={splitC.cajas ?? ''}
                      onChange={(e) => setSplitC((s) => ({ ...s, cajas: e.target.value }))}
                      placeholder="Auto proporcional si vacío"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="TablaPedidos-tip">
                <small>
                  Puedes combinar ambas opciones: mover algunos destinatarios a B/C <i>y además</i> partir un documento por kilos.
                </small>
              </div>
            </div>

            {/* Observación */}
            <div className="TablaPedidos-form-grupo TablaPedidos-form-grupo--full">
              <label>Observación de división (opcional)</label>
              <textarea
                rows={3}
                value={divisionObs}
                onChange={(e) => setDivisionObs(e.target.value)}
                placeholder="Motivo / comentario…"
              />
            </div>

            {/* Acciones */}
            <div className="TablaPedidos-modal-editar-actions">
              <button className="TablaPedidos-btn-cancelar" onClick={cerrarModalDividir}>
                Cancelar
              </button>
              <button
                className="TablaPedidos-btn-guardar"
                onClick={guardarDivision}
                disabled={divisionGuardando}
              >
                {divisionGuardando ? 'Dividiendo…' : 'Dividir'}
              </button>
            </div>

            <div className="TablaPedidos-tip">
              <small>
                Reglas: no puedes crear C sin B; A no puede quedar vacío; un mismo destinatario no puede ir en B y C.
              </small>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TablaPedidos;
