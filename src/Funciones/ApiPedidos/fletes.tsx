import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const BASE_URL = `${API_BASE}/fletes`;

// 🔹 Cargar fletes masivamente desde Excel
export const cargarFletesMasivo = async (archivo: File) => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  try {
    const res = await axios.post(`${BASE_URL}/cargar-masivo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// 🔹 Crear flete individual
export const crearFlete = async (flete: any) => {
  try {
    const res = await axios.post(`${BASE_URL}/`, flete);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// 🔹 Listar todos los fletes
export const listarFletes = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// 🔹 Buscar valor de tarifa específica
export const buscarTarifa = async (origen: string, destino: string, tipo_vehiculo: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/buscar-tarifa`, {
      params: { origen, destino, tipo_vehiculo },
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// 🔹 Obtener flete por origen y destino
export const obtenerFlete = async (origen: string, destino: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/${origen}/${destino}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// 🔹 Actualizar flete
export const actualizarFlete = async (origen: string, destino: string, flete: any) => {
  try {
    const res = await axios.put(`${BASE_URL}/${origen}/${destino}`, flete);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// 🔹 Eliminar flete
export const eliminarFlete = async (origen: string, destino: string) => {
  try {
    const res = await axios.delete(`${BASE_URL}/${origen}/${destino}`);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
