import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const Api = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const url = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";

      const data = {
        username: "134APIINTEGRA",
        idname: "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0",
        agency: "001",
        proyect: "1",
        isGroup: 0
      };

      try {
        const res = await axios.post(url, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setResponse(res.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Solo accedemos si 'err' es una instancia de Error
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>API Respuesta</h1>
      <pre>{JSON.stringify(response, null, 2)}</pre>
      <Link to="/Api2" className="linkBoton">
            <button>prueba de la api en tiempo</button>
      </Link>
    </div>
  );
};

export default Api;
