import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const BASE_URL = `${API_BASE}/pedidos`;

export type RespuestaCarga = {
  mensaje: string;
};

export const cargarPedidosMasivo = async (
  archivo: File,
  creado_por: string
): Promise<RespuestaCarga> => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("creado_por", creado_por);

  try {
    const res = await axios.post<RespuestaCarga>(`${BASE_URL}/cargar-masivo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.data?.detail?.errores) {
      throw error.response.data.detail.errores;
    }
    throw error.response?.data || error.message;
  }
};

export const listarPedidos = async (usuario: string, filtros = {}) => {
  const response = await fetch(`${API_BASE}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario,
      filtros: {
        estados: null,
        regionales: null,
        ...filtros, // permite enviar filtros si luego los usas
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return await response.json();
};


export const actualizarEstadoPedido = async (
  pedido_id: string,
  nuevo_estado: string,
  usuario: string,
  observaciones_aprobador?: string
): Promise<any> => {
  try {
    const res = await axios.put(`${BASE_URL}/${pedido_id}/estado`, {
      estado: nuevo_estado,
      usuario,
      observaciones_aprobador,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const procesarMasivo = async (
  pedido_ids: string[],
  usuario: string
): Promise<any> => {
  try {
    const res = await axios.put(`${BASE_URL}/procesar-masivo`, {
      pedido_ids,
      usuario,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const eliminarPedido = async (pedido_id: string, usuario: string): Promise<any> => {
  try {
    const res = await axios.delete(`${BASE_URL}/${pedido_id}`, {
      params: { usuario }, // 👈 pasa el usuario aquí
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};


export const exportarAutorizados = async (): Promise<void> => {
  try {
    const res = await axios.get<Blob>(`${BASE_URL}/exportar-autorizados`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pedidos_autorizados.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
