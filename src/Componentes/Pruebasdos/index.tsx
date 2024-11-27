import { useState, useContext } from "react";
import consultaSaldos from "../../Funciones/ExtraeSaldos"; // Importa la función consultaSaldos
import { ContextoApp } from "../../Contexto/index";

const PagosButton = () => {
  const [cargando, setCargando] = useState(false); // Estado para manejar el loading
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  // Accede al contexto global
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("Contexto no definido. Asegúrate de usar el proveedor correctamente.");
  }

  const { tenedor } = almacenVariables; // Obtén el tenedor desde el contexto

  const manejarClick = async () => {
    setCargando(true);
    setError(null); // Limpia errores antes de ejecutar

    try {
      if (!tenedor) {
        throw new Error("No se proporcionó el tenedor. Verifica el contexto.");
      }
      
      const saldos = await consultaSaldos(tenedor); // Llama a consultaSaldos con el tenedor del contexto
      console.log("Saldos obtenidos:", saldos); // Opcional: muestra los datos obtenidos para depuración
    } catch (err) {
      setError((err as Error).message); // Captura el error
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <button
        onClick={manejarClick}
        disabled={cargando} // Deshabilita el botón mientras se procesa
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: cargando ? "not-allowed" : "pointer",
        }}
      >
        {cargando ? "Cargando..." : "Consultar Saldos"}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>} {/* Muestra el error si ocurre */}
    </div>
  );
};

export default PagosButton;
