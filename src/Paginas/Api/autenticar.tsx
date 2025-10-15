import axios from "axios";

export const autenticarApi = async () => {
  const url = "https://api_v1.vulcanoappweb.com/vulcano-web/api/cloud/v1/auth/loginDbCustomer";
  const data = {
    username: "134APIINTEGRA",
    idname: "eyJpdiI6Inl1cHZlZWFOQnc4TFB1a1hkS1VMWGc9PSIsInZhbHVlIjoia1JDRWduZ3FFZmZvRmZYUkJ3Q1JpT2RSU1htRHZkRzhQSkg0ekE5S2xwcz0iLCJtYWMiOiJjNjQxZjdlNDVlMzcwZTEzYzY4Mzc1MGYwNjI3MWQyOTI2ZTAzY2NhZDk1YjQ3MDgwYjg3ODEzODEyYzY3NzI5IiwidGFnIjoiIn0=",
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
