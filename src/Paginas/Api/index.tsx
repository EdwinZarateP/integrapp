import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ContextoApp } from '../../Contexto/index';

// Define una interfaz para los datos de la respuesta
interface ApiResponse {
  // Especifica las propiedades esperadas en la respuesta
  // Por ejemplo, si la respuesta tiene una propiedad "data" que es un array de objetos
  data: any[]; // Cambia 'any[]' por el tipo correcto según tu API
}

const Api2 = () => {
  const almacenVariables = useContext(ContextoApp);

  const [respuesta, setrespuesta] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const loginUrl = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";

      const loginPayload = {
        username: "134APIINTEGRA",
        idname: "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0",
        agency: "001",
        proyect: "1",
        isGroup: 0
      };

      try {
        // Realiza el login
        const loginrespuesta = await axios.post(loginUrl, loginPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const token = loginrespuesta.data.data.access_token;

        // Realiza la segunda consulta usando el token
        const queryUrl = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/vulcano/customer/00134/index";
        const queryPayload = {
          pageSize: 1000,
          rptId: 26,
          filter: [
            {
              campo: "Fecha",
              operador: "YEAR>",
              valor: "2023"
            },
            {
              campo: "Tenedor",
              operador: "=",
              valor: almacenVariables?.tenedor // Aquí se utiliza el valor de almacenVariables.tenedor
            }
          ]
        };

        const queryrespuesta = await axios.post(queryUrl, queryPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Establece la respuesta en el estado
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
  }, [almacenVariables?.tenedor]); // Agregar almacenVariables.tenedor como dependencia para el efecto

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>API Respuesta</h1>
      {/* Si no quieres usar JSON.stringify, puedes iterar sobre la respuesta */}
      {respuesta && respuesta.data.map((item, index) => (
        <div key={index}>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default Api2;
