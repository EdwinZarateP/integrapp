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

  // Filtra los manifiestos según el estado global en el contexto y por placa seleccionada
  const manifiestosFiltrados = manifiestos.filter((manifiesto) => {
    const cumpleEstado = manifiesto.Estado_mft === almacenVariables?.estado;
    const cumplePlaca =
  !almacenVariables?.placa || manifiesto.Placa === almacenVariables.placa;
    return cumpleEstado && cumplePlaca;
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
            No hay manifiestos disponibles para este estado y placa seleccionada.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContenedorTarjetas;
