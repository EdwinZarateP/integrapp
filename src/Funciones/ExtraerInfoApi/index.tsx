import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ContextoApp } from '../../Contexto/index';

// Interfaz para el login
interface LoginResponse {
  data: {
    access_token: string;
  };
}

// Interfaz para la consulta de manifiestos
interface ApiResponse {
  data: Manifiesto[];
}

// Interfaz de manifiestos
interface Manifiesto {
  Manif_numero: string;
  Estado_mft: string;
  Fecha: string;
  Manif_ministerio: string;
  Tipo_manifiesto: string;
  Origen: string;
  Destino: string;
  FechaPagoSaldo: string;
  MontoTotal: string;
  ReteFuente: string;
  ReteICA: string;
  ReteCREE: string;
  ValorAnticipado: string;
  AjusteFlete: string;
  Placa: string;
  Fecha_cumpl: string;
  TenId: string;
  Tenedor: string;
  deducciones: string;
  [key: string]: any; // por si vienen más campos
}

const extraccionManifiestos = () => {
  const almacenVariables = useContext(ContextoApp);

  const [respuesta, setrespuesta] = useState<Manifiesto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const loginUrl =
        "https://api.nescanis.com/vulcano/cloud/v1/auth/loginDbCustomer";

      const loginPayload = {
        username: "134APIINTEGRA",
        idname:
          "eyJpdiI6IlZSdVpoaHBhYk02b3ZFRTdMQlhuZnc9PSIsInZhbHVlIjoiTGs4KzM2OGhxWGo4ekVLUkVGMG1yS1EwUDEwNkZxdVl5VzNWcDNCQ0drMD0iLCJtYWMiOiJjMzEzMDEzYTk3OWJhNTM2MTYyYjlmZDRkNDE4ZDFlMzc2OGQ5MTg0ZWYwYzFkMmJkNjY5ZDZhNDI2N2I5ZDBmIiwidGFnIjoiIn0=",
        agency: "001",
        proyect: "1",
        isGroup: 0,
      };

      try {
        // ✅ Login con tipado correcto
        const loginrespuesta = await axios.post<LoginResponse>(
          loginUrl,
          loginPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = loginrespuesta.data.data.access_token;

        const queryUrl =
          "https://api.nescanis.com/vulcano/cloud/v1/vulcano/customer/00134/index";
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
              valor: almacenVariables?.tenedor,
            },
          ],
        };

        // ✅ Consulta con tipado correcto
        const queryrespuesta = await axios.post<ApiResponse>(
          queryUrl,
          queryPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setrespuesta(queryrespuesta.data.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [almacenVariables?.tenedor]);

  // ✅ Filtrar manifiestos únicos
  const filtrarManifiestosUnicos = (data: Manifiesto[]): Manifiesto[] => {
    return data.reduce((acc: Manifiesto[], item) => {
      if (!acc.some(existing => existing.Manif_numero === item.Manif_numero)) {
        acc.push(item);
      }
      return acc;
    }, []);
  };

  const manifiestosTodos = respuesta ? filtrarManifiestosUnicos(respuesta) : [];

  return { manifiestosTodos, loading, error };
};

export default extraccionManifiestos;
