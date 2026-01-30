import axios from "axios";

export const autenticarApi = async () => {
  const url = "https://api.nescanis.com/vulcano/cloud/v1/auth/loginDbCustomer";
  const data = {
    username: "134APIINTEGRA",
    idname: "eyJpdiI6IlZSdVpoaHBhYk02b3ZFRTdMQlhuZnc9PSIsInZhbHVlIjoiTGs4KzM2OGhxWGo4ekVLUkVGMG1yS1EwUDEwNkZxdVl5VzNWcDNCQ0drMD0iLCJtYWMiOiJjMzEzMDEzYTk3OWJhNTM2MTYyYjlmZDRkNDE4ZDFlMzc2OGQ5MTg0ZWYwYzFkMmJkNjY5ZDZhNDI2N2I5ZDBmIiwidGFnIjoiIn0=",
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
