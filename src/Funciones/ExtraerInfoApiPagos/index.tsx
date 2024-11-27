import { useContext } from "react";
import axios from "axios";
import { ContextoApp } from "../../Contexto/index";

// Define una interfaz para los datos de pagos
interface Pago {
  Manifiesto: string;
  Tenedor: string;
  Fecha: string;
  PagoSaldo: string; // Renombrado para evitar problemas con espacios
}

const ExtraccionPagos = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor correctamente.");
  }

  // Extrae las variables necesarias del contexto
  const {
    setDiccionarioManifiestosPagos,
    DiccionarioManifiestosPagos,
    tenedor,
  } = almacenVariables;

  const fetchPagos = async (): Promise<Pago[]> => {
    // Verifica si ya hay datos en DiccionarioManifiestosPagos
    if (DiccionarioManifiestosPagos.length > 0) {
      console.log("Usando pagos almacenados en el contexto:", DiccionarioManifiestosPagos);
      return DiccionarioManifiestosPagos;
    }

    const loginUrl =
      "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";
    const loginPayload = {
      username: "134APIINTEGRA",
      idname:
        "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0",
      agency: "001",
      proyect: "1",
      isGroup: 0,
    };

    try {
      // Login para obtener el token
      const loginRespuesta = await axios.post(loginUrl, loginPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const token = loginRespuesta.data.data.access_token;

      const queryUrl =
        "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
      const queryPayload = {
        pageSize: 1000,
        rptId: 27, // ID correspondiente a pagos
        filter: [
          {
            campo: "Fecha",
            operador: "YEAR>",
            valor: "2023",
          },
          {
            campo: "Tenedor",
            operador: "=",
            valor: tenedor, // Utiliza el tenedor desde el contexto
          },
        ],
      };

      const queryRespuesta = await axios.post(queryUrl, queryPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = queryRespuesta.data?.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la API no contiene un array válido en 'data.data'.");
      }

      const pagosUnicos = data.reduce((acc: Pago[], item: Pago) => {
        if (!acc.some((existingItem) => existingItem.Manifiesto === item.Manifiesto)) {
          acc.push(item);
        }
        return acc;
      }, []);

      setDiccionarioManifiestosPagos(pagosUnicos); // Actualiza el contexto con los pagos únicos
      console.log("Pagos obtenidos de la API:", pagosUnicos); // Opcional: imprime en consola para depuración

      return pagosUnicos; // Devuelve los pagos únicos
    } catch (err) {
      throw new Error("Error al extraer pagos: " + (err as Error).message);
    }
  };

  return { fetchPagos };
};

export default ExtraccionPagos;
