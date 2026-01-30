import { useState, useEffect, useContext } from "react"; 
import axios from "axios";
import { ContextoApp } from '../../Contexto/index';

// Interfaces para tipar correctamente las respuestas
interface LoginResponse {
  data: {
    access_token: string;
  };
}

interface Pago {
  Manifiesto: string;
  Tenedor: string;
  Fecha: string;
  "Pago saldo": string;
}

interface ConsultaResponse {
  data: {
    data: Pago[];
  };
}

const ExtraccionPagosNoAplicados = () => {
  const almacenVariables = useContext(ContextoApp);

  const [manifiestos, setManifiestos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerPagos = async () => {
      const urlInicioSesion =
        "https://api.nescanis.com/vulcano/cloud/v1/auth/loginDbCustomer";

      const datosInicioSesion = {
        username: "134APIINTEGRA",
        idname:
          "eyJpdiI6IlZSdVpoaHBhYk02b3ZFRTdMQlhuZnc9PSIsInZhbHVlIjoiTGs4KzM2OGhxWGo4ekVLUkVGMG1yS1EwUDEwNkZxdVl5VzNWcDNCQ0drMD0iLCJtYWMiOiJjMzEzMDEzYTk3OWJhNTM2MTYyYjlmZDRkNDE4ZDFlMzc2OGQ5MTg0ZWYwYzFkMmJkNjY5ZDZhNDI2N2I5ZDBmIiwidGFnIjoiIn0=",
        agency: "001",
        proyect: "1",
        isGroup: 0,
      };

      try {
        // ✅ Tipar la respuesta del login
        const respuestaInicioSesion = await axios.post<LoginResponse>(
          urlInicioSesion,
          datosInicioSesion,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = respuestaInicioSesion.data.data.access_token;

        // ✅ Tipar la respuesta de consulta
        const urlConsulta =
          "https://api.nescanis.com/vulcano/cloud/v1/vulcano/customer/00134/index";

        const datosConsulta = {
          pageSize: 1000,
          page: 1,
          rptId: 27,
          filter: [
            {
              campo: "Tenedor",
              operador: "=",
              valor: almacenVariables?.tenedor,
            },
            {
              campo: "Fecha",
              operador: "YEAR>",
              valor: "2023",
            },
            {
              campo: "Pago saldo",
              operador: "=",
              valor: "No aplicado",
            },
          ],
        };

        const respuestaConsulta = await axios.post<ConsultaResponse>(
          urlConsulta,
          datosConsulta,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const datos = respuestaConsulta.data.data.data;
        const manifiestosFiltrados = datos.map((pago: Pago) => pago.Manifiesto);

        setManifiestos(manifiestosFiltrados);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido ocurrió");
        }
      } finally {
        setCargando(false);
      }
    };

    obtenerPagos();
  }, [almacenVariables?.tenedor]);

  return { manifiestos, cargando, error };
};

export default ExtraccionPagosNoAplicados;
