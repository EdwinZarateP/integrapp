// src/Funciones/apiPedidos.tsx

import axios from 'axios';
import qs from 'qs';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// =======================
// Interfaces / Tipos base
// =======================
export interface FiltrosPedidos {
  estados?: string[];
  regionales?: string[];
}

export interface FiltrosConUsuario {
  usuario: string;
  filtros?: FiltrosPedidos;
}

export interface CargarMasivoResult {
  mensaje: string;
  tiempo_segundos: number;
  detalles: Pedido[];
}

export interface Pedido {
  id: string;
  fecha_creacion: string;
  nit_cliente: string;
  nombre_cliente: string;
  origen: string;
  destino: string;
  destino_real: string;
  num_cajas: number;
  num_kilos: number;
  num_kilos_sicetac?: number;
  tipo_vehiculo: string;
  tipo_vehiculo_sicetac?: string;
  valor_declarado: number;
  planilla_siscore?: string;
  valor_flete: number;
  ubicacion_cargue?: string;
  direccion_cargue?: string;
  ubicacion_descargue?: string;
  direccion_descargue?: string;
  observaciones?: string;
  vehiculo: string;
  consecutivo_pedido: number;
  consecutivo_integrapp: string;
  desvio: number;
  cargue_descargue: number;
  punto_adicional: number;
  creado_por: string;
  tipo_viaje: 'CARGA MASIVA' | 'PAQUETEO';
  observaciones_aprobador?: string;
  Observaciones_ajustes?: string;
  numero_pedido?: string;
  estado?: string;
}

export interface ListarVehiculosResponse {
  consecutivo_vehiculo: string;
  tipo_vehiculo?: string;
  tipo_vehiculo_sicetac?: string;
  destino: string;
  multiestado: boolean;
  estados: string[];
  total_cajas_vehiculo: number;
  total_kilos_vehiculo: number;
  total_kilos_vehiculo_sicetac?: number;
  total_flete_vehiculo: number;
  costo_real_vehiculo: number;
  valor_flete_sistema: number;
  total_flete_solicitado: number;
  costo_teorico_vehiculo: number;
  total_puntos_vehiculo: number;
  total_punto_adicional: number;
  total_punto_adicional_teorico: number;
  total_cargue_descargue: number;
  total_cargue_descargue_teorico: number;
  total_desvio_vehiculo: number;
  diferencia_flete: number;
  Observaciones_ajustes:string;
  pedidos: Pedido[];
}

export interface ListarCompletadosResponse {
  consecutivo_vehiculo: string;
  tipo_vehiculo?: string;
  tipo_vehiculo_sicetac?: string;
  destino: string;
  multiestado: boolean;
  estados: string[];
  total_cajas_vehiculo: number;
  total_kilos_vehiculo: number;
  total_kilos_vehiculo_sicetac?: number;
  total_flete_vehiculo: number;
  costo_real_vehiculo: number;
  valor_flete_sistema: number;
  total_flete_solicitado: number;
  costo_teorico_vehiculo: number;
  total_puntos_vehiculo: number;
  total_punto_adicional: number;
  total_punto_adicional_teorico: number;
  total_cargue_descargue: number;
  total_cargue_descargue_teorico: number;
  total_desvio_vehiculo: number;
  diferencia_flete: number;
  Observaciones_ajustes?: string;
  pedidos: Pedido[];
}

// ---- Ajustes por vehículo ----
export interface AjusteVehiculo {
  consecutivo_vehiculo: string;
  tipo_vehiculo_sicetac?: string;
  total_kilos_vehiculo_sicetac?: number;
  total_desvio_vehiculo?: number;
  total_punto_adicional?: number;
  Observaciones_ajustes?: string;
  total_cargue_descargue?: number;
  total_flete_solicitado?: number;
  nuevo_destino?: string;
  destino_desde_real?: string;
  usr_solicita_ajuste?: string;

}

export interface AjustesVehiculosPayload {
  usuario: string; // quien ejecuta (valida perfil/regional)
  ajustes: AjusteVehiculo[];
}

export interface AjusteResultado {
  consecutivo_vehiculo: string;
  regional: string;
  docs_actualizados: number;
  usr_solicita_ajuste: string;
  tipo_vehiculo_sicetac: string;
  total_kilos_vehiculo_sicetac: number;
  total_desvio_vehiculo: number;
  total_punto_adicional: number;
  costo_real_vehiculo: number;
  costo_teorico_vehiculo: number;
  diferencia_flete: number;
  nuevo_estado:
    | 'PREAUTORIZADO'
    | 'REQUIERE AUTORIZACION COORDINADOR'
    | 'REQUIERE AUTORIZACION CONTROL';
}

export interface AjustarTotalesVehiculoResponse {
  mensaje: string;
  resultados: AjusteResultado[];
  errores?: string[]; 
}

// ---- Respuestas de endpoints con `mensaje` (para evitar `{}`) ----
export interface AutorizarResponse {
  mensaje: string;
}

export interface ConfirmarPreautResponse {
  mensaje: string;
  actualizados?: number;
}

export interface FusionarVehiculosResponse {
  mensaje: string;
  consecutivo_resultante: string;
  docs_actualizados: number;
  totales?: any;
  estado?: any;
  consecutivos_fusionados?: string[];
}

// =======================
// Endpoints
// =======================

// 1) Cargar pedidos masivo
export const cargarPedidosMasivo = async (
  creadoPor: string,
  archivo: File,
  onUploadProgress?: (e: ProgressEvent) => void
): Promise<CargarMasivoResult> => {
  const formData = new FormData();
  formData.append('creado_por', creadoPor);
  formData.append('archivo', archivo);

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  };

  const { data } = await axios.post<CargarMasivoResult>(
    `${API_BASE}/pedidos/cargar-masivo`,
    formData,
    config
  );
  return data;
};

// 2) Listar pedidos por vehículo (multiestado)
export const listarPedidosVehiculos = async (
  usuario: string,
  filtros?: FiltrosPedidos
): Promise<ListarVehiculosResponse[]> => {
  const body: FiltrosConUsuario = { usuario, filtros };
  const { data } = await axios.post<ListarVehiculosResponse[]>(
    `${API_BASE}/pedidos/`,
    body
  );
  return data;
};

// 3) Autorizar por consecutivo_vehiculo
export const autorizarPorConsecutivoVehiculo = async (
  consecutivos: string[],
  usuario: string,
  observacionesAprobador?: string
): Promise<AutorizarResponse> => {
  const payload: Record<string, any> = { consecutivos, usuario };
  if (observacionesAprobador) payload.observaciones_aprobador = observacionesAprobador;

  const { data } = await axios.put<AutorizarResponse>(
    `${API_BASE}/pedidos/autorizar-por-consecutivo-vehiculo`,
    payload
  );
  return data;
};

// 4) Eliminar por consecutivo_vehiculo
export const eliminarPedidosPorConsecutivoVehiculo = async (
  consecutivoVehiculo: string,
  usuario: string
): Promise<{ mensaje: string }> => {
  const { data } = await axios.delete<{ mensaje: string }>(
    `${API_BASE}/pedidos/eliminar-por-consecutivo-vehiculo`,
    { params: { consecutivo_vehiculo: consecutivoVehiculo, usuario } }
  );
  return data;
};


// 5) Exportar autorizados a Excel
export const exportarAutorizados = async (): Promise<{ blob: Blob; filename?: string }> => {
  const res = await fetch(`${API_BASE}/pedidos/exportar-autorizados`, {
    credentials: 'include', // si usas cookies
  });

  if (!res.ok) {
    // intenta leer texto/JSON de error para mostrarlo arriba
    const msg = await res.text().catch(() => '');
    throw new Error(`Error ${res.status}: ${msg || res.statusText}`);
  }

  const blob = await res.blob();

  // nombre de archivo desde el header
  const cd = res.headers.get('content-disposition') || '';
  // filename* (RFC5987) o filename
  const m = /filename\*?=(?:UTF-8''|")?([^";]+)(?:")?/i.exec(cd);
  const filename = m ? decodeURIComponent(m[1]) : undefined;

  return { blob, filename };
};



// 6) Cargar números de pedido masivo
export const cargarNumerosPedido = async (
  usuario: string,
  archivo: File
): Promise<{ mensaje: string; vehiculos_completados: string[] }> => {
  const formData = new FormData();
  formData.append('usuario', usuario);
  formData.append('archivo', archivo);

  const { data } = await axios.post<{ mensaje: string; vehiculos_completados: string[] }>(
    `${API_BASE}/pedidos/cargar-numeros-pedido`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

// 7) Exportar completados a Excel
export const exportarCompletados = async (
  usuario: string,
  fechaInicial: string,
  fechaFinal: string,
  regionales?: string[]
): Promise<Blob> => {
  const params: any = { usuario, fecha_inicial: fechaInicial, fecha_final: fechaFinal };
  if (regionales?.length) params.regionales = regionales;

  const { data } = await axios.get<Blob>(`${API_BASE}/pedidos/exportar-completados`, {
    params,
    // ?regionales=FUNZA&regionales=GIRARDOTA
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
    responseType: 'blob',
  });
  return data;
};

// 8) Listar sólo vehículos completados
export const listarVehiculosCompletados = async (
  usuario: string,
  fechaInicial: string,
  fechaFinal: string,
  filtros?: FiltrosPedidos
): Promise<ListarCompletadosResponse[]> => {
  const params = { fecha_inicial: fechaInicial, fecha_final: fechaFinal };
  const body: FiltrosConUsuario = { usuario, filtros };

  const { data } = await axios.post<ListarCompletadosResponse[]>(
    `${API_BASE}/pedidos/listar-vehiculo-completados`,
    body,
    { params }
  );
  return data;
};

// 9) Ajustar totales por vehículo y recalcular estado
export const ajustarTotalesVehiculo = async (
  usuario: string,
  ajustes: AjusteVehiculo[]
): Promise<AjustarTotalesVehiculoResponse> => {
  const body: AjustesVehiculosPayload = { usuario, ajustes };
  const { data } = await axios.put<AjustarTotalesVehiculoResponse>(
    `${API_BASE}/pedidos/ajustar-totales-vehiculo`,
    body
  );
  return data;
};

// 10) Confirmar PREAUTORIZADOS -> AUTORIZADO
export async function confirmarPreautorizados(
  consecutivos: string[],
  usuario: string,
  observaciones_aprobador?: string
): Promise<ConfirmarPreautResponse> {
  const url = `${API_BASE}/pedidos/confirmar-preautorizados`;
  const payload: Record<string, any> = { consecutivos, usuario };
  if (typeof observaciones_aprobador === 'string') {
    payload.observaciones_aprobador = observaciones_aprobador;
  }
  const { data } = await axios.put<ConfirmarPreautResponse>(url, payload);
  return data;
}

// 11) Fusionar vehículos
export type FusionVehiculosPayload = {
  usuario: string;
  consecutivos: string[]; // 2+ consecutivo_vehiculo
  nuevo_destino: string;
  tipo_vehiculo_sicetac: string;
  total_flete_solicitado: number;
  total_cargue_descargue: number;
  total_punto_adicional: number;
  total_desvio_vehiculo: number;
  observacion_fusion?: string;
};

export async function fusionarVehiculos(
  payload: FusionVehiculosPayload
): Promise<FusionarVehiculosResponse> {
  try {
    const { data } = await axios.post<FusionarVehiculosResponse>(
      `${API_BASE}/pedidos/fusionar-vehiculos`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (e: any) {
    // Log útil para diagnosticar respuestas de FastAPI
    console.error('fusionarVehiculos error', e?.response?.status, e?.response?.data, e);
    throw e; // El componente mostrará e.response.data.detail si existe
  }
}


// === Tipos del payload que espera el backend ===
export type OverridesVehiculo = {
  total_flete_solicitado?: number;
  total_cargue_descargue?: number;
  total_punto_adicional?: number;
  total_desvio_vehiculo?: number;
};

export type GrupoDivision = {
  destinatarios?: string[];
  split?: SplitConfig; // ahora acepta doc_id
};

export type DividirHastaTresPayload = {
  usuario: string;
  consecutivo_origen: string;
  destino_unico: string;
  observacion_division?: string;
  /** Campo por el cual se agrupan/mueven destinatarios cuando se usa Opción 1 */
  campo_destinatario?: 'ubicacion_descargue' | 'destino_real' | string;
  grupo_B?: GrupoDivision;
  grupo_C?: GrupoDivision;
};


// justo debajo de FusionarVehiculosResponse, por ejemplo
export type DividirVehiculoResponse = { mensaje: string } & Record<string, any>;

export async function dividirVehiculo(
  payload: DividirHastaTresPayload
): Promise<DividirVehiculoResponse> {
  try {
    const { data } = await axios.post<DividirVehiculoResponse>(
      `${API_BASE}/pedidos/dividir-vehiculo`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (e: any) {
    console.error('dividirVehiculo error', e?.response?.status, e?.response?.data, e);
    throw e;
  }
}

// NUEVO
export type SplitConfig = {
  consecutivo_integrapp: string;
  kilos: number;
  cajas?: number;
  /** ID único del documento (pedido) a partir — requerido si el CI no es único */
  doc_id?: string;     // 👈 nuevo
};


export type UsuarioLite = { id: string; nombre: string; usuario: string };

export async function listarDespachadores(): Promise<UsuarioLite[]> {
  const r = await fetch(`${API_BASE}/baseusuarios/despachadores`, {
    headers: { 'accept': 'application/json' },
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

