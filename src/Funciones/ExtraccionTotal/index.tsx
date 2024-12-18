import { useContext } from "react";
import { ContextoApp } from "../../Contexto/index";
import ExtraccionManifiestos from "../../Funciones/ExtraerInfoApiManifiestos/index";
import ExtraccionPagos from "../../Funciones/ExtraerInfoApiPagos/index";
import ExtraeSaldos from "../../Funciones/ExtraeSaldosApi/index";
import ExtraeNovedades from "../../Funciones/ExtraeNovedades/index";

const ExtraccionTotal = () => {
  const almacenVariables = useContext(ContextoApp);
  const { fetchManifiestos } = ExtraccionManifiestos();
  const { fetchPagos } = ExtraccionPagos();
  const { fetchSaldos } = ExtraeSaldos();
  const { fetchNovedades } = ExtraeNovedades();

  const ejecutarExtraccion = async (): Promise<void> => {
    if (!almacenVariables?.tenedor) {
      throw new Error("El contexto no contiene un 'tenedor'.");
    }

    try {
      // Verifica si ya hay saldos en el contexto
      if (almacenVariables.DiccionarioSaldos.length > 0) {
        // console.log("Usando saldos almacenados en el contexto:", almacenVariables.DiccionarioSaldos);
      } else {
        console.log("Iniciando extracción de saldos desde la API...");
        await fetchSaldos();
      }

      // Verifica si ya hay Novedades en el contexto
      if (almacenVariables.DiccionarioNovedades.length > 0) {
        // console.log("Usando Novedades almacenadas en el contexto:", almacenVariables.DiccionarioNovedades);
      } else {
        console.log("Iniciando extracción de Novedades desde la API...");
        await fetchNovedades();
      }

      // Verifica si ya hay pagos en el contexto
      if (almacenVariables.DiccionarioManifiestosPagos.length > 0) {
        // console.log("Usando pagos almacenados en el contexto:", almacenVariables.DiccionarioManifiestosPagos);
      } else {
        console.log("Iniciando extracción de pagos desde la API...");
        await fetchPagos();
      }

      // Verifica si ya hay manifiestos en el contexto
      if (almacenVariables.DiccionarioManifiestosTodos.length > 0) {
        // console.log("Usando manifiestos almacenados en el contexto:", almacenVariables.DiccionarioManifiestosTodos);
      } else {
        console.log("Iniciando extracción de manifiestos desde la API...");
        await fetchManifiestos();
      }

      console.log("Extracción total completada.");
    } catch (error) {
      console.error("Error en la extracción total:", error);
      throw error; // Propaga el error si deseas manejarlo en otro componente.
    }
  };

  return { ejecutarExtraccion };
};

export default ExtraccionTotal;
