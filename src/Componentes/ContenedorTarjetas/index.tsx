import React, { useContext } from "react";
import TarjetaResumen from "../TarjetaResumen/index";
import "./estilos.css";
import { ContextoApp } from "../../Contexto/index";

interface ContenedorTarjetasProps {
  manifiestos: any[];
}

const ContenedorTarjetas: React.FC<ContenedorTarjetasProps> = ({ manifiestos }) => {
  const almacenVariables = useContext(ContextoApp);

  // Filtra los manifiestos según el estado global en el contexto
  const manifiestosFiltrados = manifiestos.filter(
    (manifiesto) => manifiesto.Estado_mft === almacenVariables?.estado
  );

  return (
    <div className="ContenedorTarjetas-contenedor">
      <h1 className="ContenedorTarjetas-titulo">
        Manifiestos {almacenVariables?.estado || "Sin Estado"}
      </h1>
      <div className="ContenedorTarjetas-grid">
        {manifiestosFiltrados.length > 0 ? (
          manifiestosFiltrados.map((manifiesto, index) => (
            <TarjetaResumen
              key={index}
              manifiesto={manifiesto.Manif_numero}
              origenDestino={`${manifiesto.Origen} - ${manifiesto.Destino}`}
              placa={manifiesto.Placa}
              fecha={manifiesto.Fecha}
              flete={`$ ${manifiesto.MontoTotal}`}
              reteFuente={`$ ${manifiesto.ReteFuente}`}
              reteICA={`$ ${manifiesto.ReteICA}`}
              anticipo={`$ ${manifiesto.ValorAnticipado}`}
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
