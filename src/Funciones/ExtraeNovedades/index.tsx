import { useContext } from "react";
import axios from "axios";
import { ContextoApp } from "../../Contexto/index";

// Define una interfaz para los datos de Novedades
interface Saldo {
  _id: string; // ID único del manifiesto en MongoDB
  Tenedor: string;
  Manifiesto: string;
  Novedad: string;
  [key: string]: any; // Permite otros campos dinámicos
}

const ExtraeNovedades = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor correctamente.");
  }

  const { setDiccionarioNovedades, tenedor } = almacenVariables;

  const fetchNovedades = async (): Promise<Saldo[]> => {
    try {
      
      // Llama a la API de Novedades usando el tenedor del contexto
      const url = `https://integrappi.onrender.com/Novedades/tenedor/${tenedor}`;
      const respuesta = await axios.get(url);
      // console.log("Datos obtenidos de la API de Novedades:", respuesta.data);

      // Valida que la respuesta sea un array antes de continuar
      const data: Saldo[] = respuesta.data;
      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la API no contiene un array válido.");
      }

      // Guarda los resultados en la variable global `DiccionarioNovedades`
      setDiccionarioNovedades(data);

      return data; // Devuelve los Novedades obtenidos
    } catch (err) {
      throw new Error("Error al extraer Novedades: " + (err as Error).message);
    }
  };

  return { fetchNovedades };
};

export default ExtraeNovedades;
