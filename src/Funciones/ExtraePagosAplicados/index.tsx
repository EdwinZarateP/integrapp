import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ContextoApp } from '../../Contexto/index';

// Define una interfaz para los elementos de pagos
interface Pago {
  Manifiesto: string;
  Tenedor: string;
  Fecha: string;
  "Pago saldo": string;
}

const ExtraccionPagosAplicados = () => {
  const almacenVariables = useContext(ContextoApp);

  const [manifiestos, setManifiestos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerPagos = async () => {
      const urlInicioSesion = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";

      const datosInicioSesion = {
        username: "134APIINTEGRA",
        idname: "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0",
        agency: "001",
        proyect: "1",
        isGroup: 0
      };

      try {
        // Realiza el inicio de sesión
        const respuestaInicioSesion = await axios.post(urlInicioSesion, datosInicioSesion, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const token = respuestaInicioSesion.data.data.access_token;

        // Realiza la consulta de pagos usando el token
        const urlConsulta = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
        const datosConsulta = {
          pageSize: 1000,
          page: 1,
          rptId: 27,
          filter: [
            {
              campo: "Tenedor",
              operador: "=",
              valor: almacenVariables?.tenedor
            },
            {
              campo: "Fecha",
              operador: "YEAR>",
              valor: "2023"
            },
            {
              campo: "Pago saldo",
              operador: "=",
              valor: "Aplicado"
            }
          ]
        };

        const respuestaConsulta = await axios.post(urlConsulta, datosConsulta, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Procesa y extrae los manifiestos aplicados de la respuesta
        const datos = respuestaConsulta.data.data.data; // Extrae la lista "data"
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
  }, [almacenVariables?.tenedor]); // Agregar almacenVariables.tenedor como dependencia para el efecto

  return { manifiestos, cargando, error };
};

export default ExtraccionPagosAplicados;