import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ContextoApp } from '../../Contexto/index';

const Api2 = () => {
  const almacenVariables = useContext(ContextoApp);

  const [response, setResponse] = useState(null);
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
        const loginResponse = await axios.post(loginUrl, loginPayload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const token = loginResponse.data.data.access_token;

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

        const queryResponse = await axios.post(queryUrl, queryPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setResponse(queryResponse.data);
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
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default Api2;
