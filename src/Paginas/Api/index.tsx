import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VulcanoApiComponent: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('vulcano_token')); // Obtener token de localStorage si existe
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1";

  // Función para hacer login y obtener el token
  const login = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/loginDbCustomer`, {
        "username": "134APIINTEGRA",
        "idname": "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0=",
        "agency": "001",
        "proyect": "1",
        "isGroup": 0
      });

      if (response.data && response.data.data && response.data.data.access_token) {
        const newToken = response.data.data.access_token;
        setToken(newToken); // Guardar el token en el estado
        localStorage.setItem('vulcano_token', newToken); // Guardar el token en localStorage

        // Mostrar mensaje de éxito en la consola
        console.log("Login exitoso. Token recibido:", newToken);

        // Llamar a fetchReport después del login exitoso
        fetchReport(newToken);
      }
    } catch (error) {
      setError('Error al hacer login');
      console.error(error);
    }
  };

  // Función para consultar el reporte
  const fetchReport = async (authToken: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/vulcano/customer/00134/report`, // URL para obtener el reporte
        {
          "pageSize": 1000,
          "rptId": 26,
          "filter": [
            {
              "campo": "Fecha",
              "operador": "YEAR>",
              "valor": "2023"
            },
            {
              "campo": "Tenedor",
              "operador": "=",
              "valor": "1070607772"
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}` // Pasar el token en los headers
          }
        }
      );

      // Almacenar los datos del reporte en el estado
      setReportData(response.data);

      // Mostrar un mensaje en la consola si la solicitud fue exitosa
      console.log('Reporte obtenido con éxito:', response.data);
    } catch (error) {
      setError('Error al obtener el reporte');
      console.error(error);
    }
  };

  // Llamar al login cuando el componente se monta
  useEffect(() => {
    if (!token) {
      login(); // Solo llamar al login si no existe el token en localStorage
    } else {
      fetchReport(token); // Si ya hay token, intentar obtener el reporte directamente
    }
  }, [token]);

  return (
    <div>
      {error && <p>{error}</p>}
      {reportData ? (
        <pre>{JSON.stringify(reportData, null, 2)}</pre>
      ) : (
        <p>Cargando reporte...</p>
      )}
    </div>
  );
};

export default VulcanoApiComponent;
