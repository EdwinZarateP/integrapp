// src/Funciones/ExtraeSaldos/index.tsx

import axios from 'axios';

export interface Saldo {
  _id: string;
  Tenedor: string;
  Manifiesto: string;
  Fecha: string;
  Monto: number;
  [key: string]: any;
}

const consultaSaldos = async (tenedor: string): Promise<Saldo[]> => {
  try {
    // Le decimos a axios que la respuesta será Saldo[]
    const response = await axios.get<Saldo[]>(
      `https://integrappi-dvmh.onrender.com/manifiestos/tenedor/${tenedor}`
    );
    return response.data;
  } catch (err: any) {
    console.error("Error al consultar saldos:", err);
    throw new Error("No se pudieron obtener los saldos.");
  }
};

export default consultaSaldos;
