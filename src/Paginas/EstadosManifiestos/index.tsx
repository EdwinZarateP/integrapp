import { useContext } from "react";
import ContenedorTarjetas from "../../Componentes/ContenedorTarjetas/index";
import { ContextoApp } from "../../Contexto/index";

const Estados = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    return <p>Error: El contexto no está disponible.</p>;
  }

  // Verifica el contenido del contexto para depuración
  console.log(
    "Contenido de DiccionarioManifiestosTodos:",
    almacenVariables.DiccionarioManifiestosTodos
  );

  
  // Verifica el contenido del contexto para depuración
  console.log(
    "Contenido de DiccionarioNovedades:",
    almacenVariables.DiccionarioNovedades
  );

  // Filtra los manifiestos con el estado actual del contexto global
  const manifiestosFiltrados = almacenVariables.DiccionarioManifiestosTodos.filter(
    (manifiesto) =>
      manifiesto.Estado_mft?.trim().toUpperCase() ===
      almacenVariables.estado?.trim().toUpperCase()
  );

  // Verifica si hay resultados después del filtro
  console.log(`Manifiestos filtrados (${almacenVariables.estado}):`, manifiestosFiltrados);

  return (
    <div>
      <ContenedorTarjetas manifiestos={manifiestosFiltrados} />
    </div>
  );
};

export default Estados;
