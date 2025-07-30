import axios from 'axios';
import qs from 'qs';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// Interfaces
export interface FiltrosPedidos {
  estados?: string[];
  regionales?: string[];
}

export interface FiltrosConUsuario {
  usuario: string;
  filtros?: FiltrosPedidos;
}

export interface Pedido {
  id: string;
  fecha_creacion: string;
  cliente_nombre: string;
  origen: string;
  destino: string;
  num_cajas: number;
  num_kilos: number;
  tipo_vehiculo: string;
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
  estado?: string;
}
export interface ListarVehiculosResponse {
  consecutivo_vehiculo: string;
  multiestado: boolean;
  tipo_vehiculo?: string;
  estados: string[];
  total_cajas_vehiculo: number;
  total_kilos_vehiculo: number;
  total_flete_vehiculo: number;
  /** Nuevo: suma de todos los costos reales (flete + desvío + cargue + punto adicional) */
  costo_real_vehiculo: number;
  valor_flete_sistema: number;
  /** Nuevo: suma teórica según tarifa + otros_costos + desvío */
  costo_teorico_vehiculo: number;
  total_puntos_vehiculo: number;
  total_punto_adicional: number;
  total_punto_adicional_teorico: number;
  total_cargue_descargue: number;
  total_cargue_descargue_teorico: number;
  total_desvio_vehiculo: number;
  diferencia_flete: number;
  pedidos: Pedido[];
}


export interface ListarCompletadosResponse {
  consecutivo_vehiculo: string;
  tipo_vehiculo: string;
  multiestado: boolean;
  estados: string[];
  total_cajas_vehiculo: number;
  total_kilos_vehiculo: number;
  total_flete_vehiculo: number;
  valor_flete_sistema: number;
  total_punto_adicional: number;
  total_cargue_descargue: number;
  total_desvio: number;
  diferencia_flete: number;
  pedidos: Pedido[];
}

// 1) Cargar pedidos masivo
// Añade la firma opcional onUploadProgress
export const cargarPedidosMasivo = async (
  creadoPor: string,
  archivo: File,
  onUploadProgress?: (e: ProgressEvent) => void
): Promise<{ mensaje: string; detalles: Pedido[] }> => {
  const formData = new FormData();
  formData.append('creado_por', creadoPor);
  formData.append('archivo', archivo);

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  };

  const response = await axios.post(
  `${API_BASE}/pedidos/cargar-masivo`,
  formData,
  config
);

return response.data as { mensaje: string; detalles: Pedido[] };
};



// 2) Listar pedidos por vehículo (multiestado)
export const listarPedidosVehiculos = async (
  usuario: string,
  filtros?: FiltrosPedidos
): Promise<ListarVehiculosResponse[]> => {
  const body: FiltrosConUsuario = { usuario, filtros };
  const response = await axios.post<ListarVehiculosResponse[]>(
    `${API_BASE}/pedidos/`,
    body
  );
  return response.data;
};


// 3) Autorizar pedidos por consecutivo_vehiculo
export const autorizarPorConsecutivoVehiculo = async (
  consecutivos: string[],
  usuario: string,
  observacionesAprobador?: string
): Promise<{ mensaje: string }> => {
  const data: any = { consecutivos, usuario };
  if (observacionesAprobador) data.observaciones_aprobador = observacionesAprobador;
  const response = await axios.put<{ mensaje: string }>(
    `${API_BASE}/pedidos/autorizar-por-consecutivo-vehiculo`,
    data
  );
  return response.data;
};

// 4) Eliminar pedidos por consecutivo_vehiculo
export const eliminarPedidosPorConsecutivoVehiculo = async (
  consecutivoVehiculo: string,
  usuario: string
): Promise<{ mensaje: string }> => {
  const response = await axios.delete<{ mensaje: string }>(
    `${API_BASE}/pedidos/eliminar-por-consecutivo-vehiculo`,
    { params: { consecutivo_vehiculo: consecutivoVehiculo, usuario } }
  );
  return response.data;
};

// 5) Exportar autorizados a Excel
export const exportarAutorizados = async (): Promise<Blob> => {
  const response = await axios.get<Blob>(
    `${API_BASE}/pedidos/exportar-autorizados`,
    { responseType: 'blob' }
  );
  return response.data;
};

// 6) Cargar números de pedido masivo
export const cargarNumerosPedido = async (
  usuario: string,
  archivo: File
): Promise<{ mensaje: string; vehiculos_completados: string[] }> => {
  const formData = new FormData();
  formData.append('usuario', usuario);
  formData.append('archivo', archivo);
  const response = await axios.post<{ mensaje: string; vehiculos_completados: string[] }>(
    `${API_BASE}/pedidos/cargar-numeros-pedido`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

// 7) Exportar completados a Excel
export const exportarCompletados = async (
  usuario: string,
  fechaInicial: string,
  fechaFinal: string,
  regionales?: string[]
): Promise<Blob> => {
  const params: any = { usuario, fecha_inicial: fechaInicial, fecha_final: fechaFinal };
  if (regionales && regionales.length) {
    params.regionales = regionales;
  }

  const response = await axios.get<Blob>(
    `${API_BASE}/pedidos/exportar-completados`,
    {
      params,
      // Serializa arrays así: ?regionales=FUNZA&regionales=GIRARDOTA
      paramsSerializer: p => qs.stringify(p, { arrayFormat: 'repeat' }),
      responseType: 'blob',
    }
  );
  return response.data;
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
  const response = await axios.post<ListarCompletadosResponse[]>(
    `${API_BASE}/pedidos/listar-vehiculo-completados`,
    body,
    { params }
  );
  return response.data;
};
