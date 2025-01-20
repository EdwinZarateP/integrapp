// Archivo: P2RegistroPlaca.tsx
import React from 'react';
import './P2RegistroPlaca.css';

const P2RegistroPlaca: React.FC = () => {
  return (
    <div className="P2RegistroPlaca-contenedor">
      <h1 className="P2RegistroPlaca-titulo">Registro de Placa</h1>
      <form className="P2RegistroPlaca-formulario">
        <div className="P2RegistroPlaca-campo">
          <label htmlFor="placa" className="P2RegistroPlaca-label">Placa del Vehículo</label>
          <input
            type="text"
            id="placa"
            className="P2RegistroPlaca-input"
            placeholder="Ingrese la placa"
          />
        </div>
        <div className="P2RegistroPlaca-campo">
          <label htmlFor="tarjeta" className="P2RegistroPlaca-label">Tarjeta de Propiedad</label>
          <input
            type="file"
            id="tarjeta"
            className="P2RegistroPlaca-file"
            accept=".pdf, image/*"
          />
        </div>
        <button type="submit" className="P2RegistroPlaca-boton">Adjuntar Tarjeta de Propiedad</button>
      </form>
    </div>
  );
};

export default P2RegistroPlaca;
