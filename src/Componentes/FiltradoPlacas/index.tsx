import React, { useContext } from "react";
import "./estilos.css";
import { ContextoApp } from "../../Contexto/index";

const FiltradoPlacas: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error("El contexto no está disponible. Verifica el proveedor.");
  }

  const { DiccionarioManifiestosTodos, setPlaca } = contexto;

  // Extraer valores únicos del campo "Placa"
  const placasUnicas = Array.from(
    new Set(DiccionarioManifiestosTodos.map((manifiesto) => manifiesto.Placa))
  );

  // Maneja la selección de una placa
  const manejarCambio = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaca(event.target.value); // Actualiza el valor en el contexto
  };

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
        <option value="" disabled>
          -- Seleccionar --
        </option>
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
