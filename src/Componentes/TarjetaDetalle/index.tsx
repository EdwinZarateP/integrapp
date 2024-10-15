import React from 'react';
import './estilos.css'; 

// Definir las propiedades que el componente va a recibir
interface PropiedadesTarjetaDetalle {
  manifiesto: string;
  fecha: Date;
  origen: string;
  destino: string;
  placa: string;
  flete: number;
  anticipo: number;
  reteFuente: number;
  reteIca: number;
  descuento: number;
  saldo: number;
  fecha_saldo: Date;
}

const TarjetaDetalle: React.FC<PropiedadesTarjetaDetalle> = ({
  manifiesto,
  fecha,
  origen,
  destino,
  placa,
  flete,
  anticipo,
  reteFuente,
  reteIca,
  descuento,
  saldo,
  fecha_saldo,
}) => {
  return (
    <div className="tarjeta-detalle">
      <p><strong>Manifiesto:</strong> {manifiesto}</p>
      <p><strong>Fecha:</strong> {fecha.toLocaleDateString()}</p>
      <p>{origen} - {destino}</p>
      <p><strong>Placa:</strong> {placa}</p>
      <p><strong>Flete:</strong> ${flete.toLocaleString()}</p>
      <p><strong>Anticipo:</strong> ${anticipo.toLocaleString()}</p>
      <p><strong>Rete Fuente:</strong> ${reteFuente.toLocaleString()}</p>
      <p><strong>Rete ICA:</strong> ${reteIca.toLocaleString()}</p>
      <p><strong>Descuentos:</strong> ${descuento.toLocaleString()}</p>
      <p><strong>Saldo:</strong> ${saldo.toLocaleString()}</p>
      <p><strong>Fecha Saldo:</strong> {fecha_saldo.toLocaleDateString()}</p>
    </div>
  );
};

export default TarjetaDetalle;
