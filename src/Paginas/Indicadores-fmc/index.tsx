import React from "react";
import "./estilos.css";

const Indicadoresfmc: React.FC = () => {
  return (
    <div className="Indicadores-container">
      <iframe
        className="Indicadores-iframe"
        title="fmc"
        src="https://app.powerbi.com/reportEmbed?reportId=0e518d11-b76b-42c0-97ab-c0afae62982f&autoAuth=true&ctid=ea185721-3793-484c-bdb8-995797ce0ecc"
        allowFullScreen
      />
    </div>
  );
};

export default Indicadoresfmc;
