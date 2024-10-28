import React, { useEffect, useState } from 'react';
import consultaSaldos from '../../Funciones/ExtraeSaldos/index'; // Asegúrate de que la ruta sea correcta

const Pruebas: React.FC = () => {
  const [manifiestos, setManifiestos] = useState<any[]>([]); // Estado para almacenar los manifiestos
  const [error, setError] = useState<string | null>(null); // Estado para almacenar errores

  const tenedor = "1010213062"; // Código del tenedor

  useEffect(() => {
    const fetchManifiestos = async () => {
      try {
        const data = await consultaSaldos(tenedor); // Llamar a la función con el tenedor
        setManifiestos(data); // Guardar los resultados en el estado
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err.message); // Establecer el mensaje de error
        } else {
          setError("Error desconocido");
        }
      }
    };

    fetchManifiestos(); // Ejecutar la función para obtener los manifiestos
  }, [tenedor]); // Ejecutar efecto cuando cambia el tenedor

  return (
    <div>
      <h2>Resultados de la Consulta para Tenedor: {tenedor}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar error si existe */}
      {manifiestos.length > 0 ? (
        <pre>{JSON.stringify(manifiestos, null, 1)}</pre> // Mostrar el array como un JSON bien formateado
      ) : (
        <p>No se encontraron manifiestos.</p> // Mensaje si no hay manifiestos
      )}
    </div>
  );
};

export default Pruebas;
