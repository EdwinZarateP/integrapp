import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importa el hook de navegación
import "./estilos.css";
import { ContextoApp } from "../../Contexto/index";

const FiltradoPlacas: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error("El contexto no está disponible. Verifica el proveedor.");
  }

  const { DiccionarioManifiestosTodos, setPlaca } = contexto;
  const navigate = useNavigate(); // Hook para redirigir

  // Extraer valores únicos del campo "Placa"
  const placasUnicas = Array.from(
    new Set(DiccionarioManifiestosTodos.map((manifiesto) => manifiesto.Placa))
  );

  // Maneja la selección de una placa
  const manejarCambio = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaca(event.target.value); // Actualiza el valor en el contexto
    // Empuja un nuevo estado al historial para permitir volver
    window.history.pushState({ placa: event.target.value }, "");
  };

  // Detecta cuando el usuario navega hacia atrás y redirige a /SeleccionEstados
  useEffect(() => {
    const manejarPopState = () => {
      setPlaca(""); // Restablece el filtro
      navigate("/SeleccionEstados"); // Redirige a /SeleccionEstados
    };

    window.addEventListener("popstate", manejarPopState);

    // Limpieza del evento al desmontar el componente
    return () => {
      window.removeEventListener("popstate", manejarPopState);
    };
  }, [setPlaca, navigate]);

  return (
    <div className="FiltradoPlacas-contenedor">
      <label htmlFor="placas" className="FiltradoPlacas-label">
        Seleccione una placa:
      </label>
      <select
        id="placas"
        className="FiltradoPlacas-select"
        onChange={manejarCambio}
        defaultValue="" // Valor predeterminado
      >
        <option value="">-- Quitar Filtro --</option> {/* Opción para quitar el filtro */}
        {placasUnicas.map((placa, index) => (
          <option key={index} value={placa}>
            {placa}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltradoPlacas;
