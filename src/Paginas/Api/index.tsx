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
        username: "134APIINTEGRA",
        idname: "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0=",
        agency: "001",
        proyect: "1",
        isGroup: 0
      });

      if (response.data && response.data.data && response.data.data.access_token) {
        const newToken = response.data.data.access_token;
        setToken(newToken); // Guardar el token en el estado
        localStorage.setItem('vulcano_token', newToken); // Guardar el token en localStorage
      }
    } catch (error) {
      setError('Error al hacer login');
      console.error(error);
    }
  };

  // Función para consultar el reporte
  const fetchReport = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/vulcano/customer/00134/index`,
        {
          pageSize: 2,
          page: 1,
          rptId: 26,
          filter: [
            {
              campo: "Fecha",
              operador: "RANGE",
              valor: ["2024-08-25", "2024-08-30"]
            },
            {
              campo: "Tenedor",
              operador: "=",
              valor: "1070607772"
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setReportData(response.data.data);
      } else {
        setError('No se encontraron datos en la respuesta.');
      }
    } catch (error) {
      setError('Error al consultar el reporte');
      console.error(error);
    }
  };

  // Efecto para hacer login solo si no hay token
  useEffect(() => {
    if (!token) {
      login();
    } else {
      fetchReport(); // Si ya hay token, consultar el reporte inmediatamente
    }
  }, [token]);

  return (
    <div>
      <h1>Manifiestos Filtrados</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {reportData ? (
        <div>
          <h2>Reporte</h2>
          <pre>{JSON.stringify(reportData, null, 2)}</pre>
        </div>
      ) : (
        <p>Cargando datos del reporte...</p>
      )}
    </div>
  );
};

export default VulcanoApiComponent;
