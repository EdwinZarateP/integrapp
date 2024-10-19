import axios from "axios";

export const autenticarApi = async () => {
  const url = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";
  const data = {
    username: "134APIINTEGRA",
    idname: "eyJpdiI6InZTN1BBeFF6UEhCSno5VUp0bjRWSFE9PSIsInZhbHVlIjoiMmdjY0g3VlpwZDZNbmdQU2JRTlg4bWRmeXlsQzY4TExLSGJYTVpTcitrOD0iLCJtYWMiOiIyNGM0ZjcyODYyZGY3MDdkZWY4M2EzNzI0YzNjMmIzNjgxZTQ2ODVlYzA2MWY2YWViNTRlYjhjMDE5NDY4ZWEzIiwidGFnIjoiIn0",
    agency: "001",
    proyect: "1",
    isGroup: 0
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Retorna los datos de la respuesta
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Unknown error occurred");
  }
};

const Api = () => {
  // Componente opcional para la visualización
  return (
    <div>
      <h1>Componente Api2</h1>
      {/* Aquí podrías incluir lógica dse renderizado si es necesario */}
    </div>
  );
};

export default Api;
