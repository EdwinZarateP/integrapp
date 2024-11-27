import React from "react";
import "./estilos.css";

interface TarjetaResumenProps {
  manifiesto: string;
  origenDestino: string;
  placa: string;
  fecha: string;
  flete: number;
  reteFuente: number;
  reteICA: number;
  anticipo: number;
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
  // Formateador para pesos colombianos sin decimales
  const formatCOP = (value: number) =>
    value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

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
        <strong>Flete:</strong> {formatCOP(flete)}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>ReteFuente:</strong> {formatCOP(reteFuente)}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>ReteICA:</strong> {formatCOP(reteICA)}
      </p>
      <p className="TarjetaResumen-detalle">
        <strong>Anticipo:</strong> {formatCOP(anticipo)}
      </p>
    </div>
  );
};

export default TarjetaResumen;
