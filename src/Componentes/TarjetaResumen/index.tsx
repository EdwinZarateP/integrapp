import React from "react";
import "./estilos.css";

interface TarjetaResumenProps {
  manifiesto: string;
  origenDestino: string;
  placa: string;
  fecha: string;
  flete: string;
  reteFuente: string;
  reteICA: string;
  anticipo: string;
}

const TarjetaResumen: React.FC<TarjetaResumenProps> = ({
  manifiesto,
  origenDestino,
  placa,
  fecha,
  flete,
  reteFuente,
  reteICA,
  anticipo,
}) => {
  return (
    <div className="TarjetaResumen-contenedor">
      <h2 className="TarjetaResumen-titulo">Manifiesto: {manifiesto}</h2>
      <p className="TarjetaResumen-origenDestino">{origenDestino}</p>
      <p className="TarjetaResumen-detalle">
        <strong>Placa:</strong> {placa}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>Fecha:</strong> {fecha}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>Flete:</strong> {flete}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>ReteFuente:</strong> {reteFuente}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>ReteICA:</strong> {reteICA}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>Anticipo:</strong> {anticipo}
      </p>
    </div>
  );
};

export default TarjetaResumen;
