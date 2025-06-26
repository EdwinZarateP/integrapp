import { useContext } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { ContextoApp } from "../../Contexto/index";

// Define la interfaz para los datos de Novedades
export interface Saldo {
  _id: string;         // ID único del manifiesto en MongoDB
  Tenedor: string;
  Manifiesto: string;
  Novedad: string;
  [key: string]: any;  // Para permitir campos adicionales
}

const ExtraeNovedades = () => {
  const CodigoTenedorCookie = Cookies.get('tenedorIntegrapp');
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor correctamente.");
  }

  const { setDiccionarioNovedades } = almacenVariables;

  const fetchNovedades = async (): Promise<Saldo[]> => {
    try {
      const url = `https://integrappi-dvmh.onrender.com/Novedades/tenedor/${CodigoTenedorCookie}`;

      // Tipamos la respuesta como un array de Saldo
      const respuesta = await axios.get<Saldo[]>(url);
      const data = respuesta.data;

      // Validación de tipo por seguridad
      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la API no contiene un array válido.");
      }

      // Guarda los datos en el contexto global
      setDiccionarioNovedades(data);

      return data;
    } catch (err) {
      throw new Error("Error al extraer Novedades: " + (err as Error).message);
    }
  };

  return { fetchNovedades };
};

export default ExtraeNovedades;
