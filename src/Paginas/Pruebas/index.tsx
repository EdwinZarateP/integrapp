import React from "react";
import extraccionManifiestos from "../../Funciones/ExtraerInfoApi/index"

const Pruebas: React.FC = () => {
  const { manifiestosTodos, loading, error } = extraccionManifiestos();

  // Extrae los valores únicos de "Placa"
  const placasUnicas = Array.from(new Set(manifiestosTodos.map(manifiesto => manifiesto.Placa)));

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Pruebas</h1>
      <label htmlFor="placas">Selecciona una Placa:</label>
      <select id="placas" name="placas">
        {placasUnicas.map((placa, index) => (
          <option key={index} value={placa}>
            {placa}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pruebas;
