import { useContext } from "react";
import axios from "axios";
import { ContextoApp } from "../../Contexto/index";

// Define una interfaz para los datos de saldos
interface Saldo {
  _id: string; // ID único del manifiesto en MongoDB
  Tenedor: string;
  Manifiesto: string;
  Fecha: string;
  Monto: number; // Suposición de que hay un monto asociado, ajusta según el esquema real
  [key: string]: any; // Permite otros campos dinámicos
}

const ExtraeSaldos = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor correctamente.");
  }

  const { setDiccionarioSaldos, tenedor } = almacenVariables;

  const fetchSaldos = async (): Promise<Saldo[]> => {
    try {
      
      // Llama a la API de saldos usando el tenedor del contexto
      const url = `https://integrappi.onrender.com/manifiestos/tenedor/${tenedor}`;
      const respuesta = await axios.get(url);
      // console.log("Datos obtenidos de la API de saldos:", respuesta.data);

      // Valida que la respuesta sea un array antes de continuar
      const data: Saldo[] = respuesta.data;
      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la API no contiene un array válido.");
      }

      // Guarda los resultados en la variable global `DiccionarioSaldos`
      setDiccionarioSaldos(data);

      return data; // Devuelve los saldos obtenidos
    } catch (err) {
      throw new Error("Error al extraer saldos: " + (err as Error).message);
    }
  };

  return { fetchSaldos };
};

export default ExtraeSaldos;
