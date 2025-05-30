import { useContext } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { ContextoApp } from "../../Contexto/index";

// Define una interfaz para los manifiestos después de procesarlos
interface Manifiesto {
  Manif_numero: string;
  Estado_mft: string;
  Fecha: string;
  Manif_ministerio: string;
  Tipo_manifiesto: string;
  Origen: string;
  Destino: string;
  FechaPagoSaldo: string;
  MontoTotal: number; // Campo numérico
  ReteFuente: number; // Campo numérico
  ReteICA: number; // Campo numérico
  ReteCREE: string;
  ValorAnticipado: number; // Campo numérico
  AjusteFlete: string;
  Placa: string;
  Fecha_cumpl: string;
  TenId: string;
  Tenedor: string;
  deducciones: string;
}

// Define una interfaz para los manifiestos como llegan desde la API
interface ManifiestoAPI {
  Manif_numero: string;
  Estado_mft: string;
  Fecha: string;
  Manif_ministerio: string;
  Tipo_manifiesto: string;
  Origen: string;
  Destino: string;
  FechaPagoSaldo: string;
  MontoTotal: string; // Campo string recibido
  ReteFuente: string; // Campo string recibido
  ReteICA: string; // Campo string recibido
  ReteCREE: string;
  ValorAnticipado: string; // Campo string recibido
  AjusteFlete: string;
  Placa: string;
  Fecha_cumpl: string;
  TenId: string;
  Tenedor: string;
  deducciones: string;
}

const ExtraccionManifiestos = () => {
  const CodigoTenedorCookie = Cookies.get('tenedorIntegrapp');
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor correctamente.");
  }

  // Extrae las variables necesarias del contexto
  const {
    setDiccionarioManifiestosTodos,
    DiccionarioManifiestosTodos,
  } = almacenVariables;

  const fetchManifiestos = async (): Promise<Manifiesto[]> => {
    // Verifica si ya hay datos en DiccionarioManifiestosTodos
    if (DiccionarioManifiestosTodos.length > 0) {
      return DiccionarioManifiestosTodos;
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
      const loginrespuesta = await axios.post(loginUrl, loginPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const token = loginrespuesta.data.data.access_token;

      const queryUrl =
        "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
      const queryPayload = {
        pageSize: 1000,
        rptId: 26,
        filter: [
          {
            campo: "Fecha",
            operador: "YEAR>",
            valor: "2023",
          },
          {
            campo: "Tenedor",
            operador: "=",
            valor: CodigoTenedorCookie, // Usar el valor de 'tenedor' desde el contexto
          },
        ],
      };

      const queryrespuesta = await axios.post(queryUrl, queryPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ManifiestoAPI[] = queryrespuesta.data?.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("La respuesta de la API no contiene un array válido en 'data.data'.");
      }

      // Convertir los campos a números donde sea necesario
      const manifiestosProcesados: Manifiesto[] = data.map((item) => ({
        ...item,
        MontoTotal: parseFloat(item.MontoTotal),
        ReteFuente: parseFloat(item.ReteFuente),
        ReteICA: parseFloat(item.ReteICA),
        ValorAnticipado: parseFloat(item.ValorAnticipado),
      }));

      const manifiestosUnicos = manifiestosProcesados.reduce(
        (acc: Manifiesto[], item: Manifiesto) => {
          if (!acc.some((existingItem) => existingItem.Manif_numero === item.Manif_numero)) {
            acc.push(item);
          }
          return acc;
        },
        []
      );

      setDiccionarioManifiestosTodos(manifiestosUnicos); // Actualiza el contexto
      // console.log("Manifiestos obtenidos de la API:", manifiestosUnicos);
      return manifiestosUnicos; // Devuelve los manifiestos únicos
    } catch (err) {
      throw new Error("Error al extraer manifiestos: " + (err as Error).message);
    }
  };

  return { fetchManifiestos };
};

export default ExtraccionManifiestos;
