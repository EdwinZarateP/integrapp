import React, { useContext } from "react";
import TarjetaResumen from "../TarjetaResumen/index";
import "./estilos.css";
import { ContextoApp } from "../../Contexto/index";
import FiltradoPlacas from "../FiltradoPlacas/index";

interface ContenedorTarjetasProps {
  manifiestos: any[];
}

const ContenedorTarjetas: React.FC<ContenedorTarjetasProps> = ({ manifiestos }) => {
  const almacenVariables = useContext(ContextoApp);

  // Filtra los manifiestos según las condiciones específicas
  const manifiestosFiltrados = manifiestos
    .filter((manifiesto) => {
      if (almacenVariables?.estado === "LIQUIDADO") {
        // Mostrar solo los que tienen coincidencia en DiccionarioManifiestosPagos
        return almacenVariables.DiccionarioManifiestosPagos.some(
          (pago) => pago.Manifiesto === manifiesto.Manif_numero
        );
      }

      // Si el estado no es "LIQUIDADO", aplica el filtro de placa normalmente
      const cumplePlaca =
        !almacenVariables?.placa || manifiesto.Placa === almacenVariables.placa;
      return manifiesto.Estado_mft === almacenVariables?.estado && cumplePlaca;
    })
    // Ordenar por fecha en orden descendente
    .sort((a, b) => {
      const fechaA = new Date(a.Fecha);
      const fechaB = new Date(b.Fecha);
      return fechaB.getTime() - fechaA.getTime(); // Orden descendente
    });

  return (
    <div className="ContenedorTarjetas-contenedor">
      <h1 className="ContenedorTarjetas-titulo">
        Manifiestos {almacenVariables?.estado || "Sin Estado"}
      </h1>

      {/* Combobox para filtrar por placa */}
      <FiltradoPlacas />

      <div className="ContenedorTarjetas-grid">
        {manifiestosFiltrados.length > 0 ? (
          manifiestosFiltrados.map((manifiesto, index) => (
            <TarjetaResumen
              key={index}
              manifiesto={manifiesto.Manif_numero}
              origenDestino={`${manifiesto.Origen} - ${manifiesto.Destino}`}
              placa={manifiesto.Placa}
              fecha={manifiesto.Fecha}
              flete={manifiesto.MontoTotal}
              reteFuente={manifiesto.ReteFuente}
              reteICA={manifiesto.ReteICA}
              anticipo={manifiesto.ValorAnticipado}
            />
          ))
        ) : (
          <p className="ContenedorTarjetas-sinDatos">
            No hay manifiestos disponibles para este estado.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContenedorTarjetas;
