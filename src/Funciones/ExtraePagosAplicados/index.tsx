import { useState, useEffect, useContext } from "react"; 
import axios from "axios";
import { ContextoApp } from '../../Contexto/index';

// Interfaces para las respuestas de la API
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

const ExtraccionPagosAplicados = () => {
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
          "eyJpdiI6Inl1cHZlZWFOQnc4TFB1a1hkS1VMWGc9PSIsInZhbHVlIjoia1JDRWduZ3FFZmZvRmZYUkJ3Q1JpT2RSU1htRHZkRzhQSkg0ekE5S2xwcz0iLCJtYWMiOiJjNjQxZjdlNDVlMzcwZTEzYzY4Mzc1MGYwNjI3MWQyOTI2ZTAzY2NhZDk1YjQ3MDgwYjg3ODEzODEyYzY3NzI5IiwidGFnIjoiIn0=",
        agency: "001",
        proyect: "1",
        isGroup: 0,
      };

      try {
        // ✅ Tipamos la respuesta del login
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
              valor: "Aplicado",
            },
          ],
        };

        // ✅ Tipamos también la respuesta de consulta
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

export default ExtraccionPagosAplicados;
