import React from "react";
import "./estilos.css";

const Indicadoresfmc: React.FC = () => {
  return (
    <div className="Indicadores-container">
      <iframe
        className="Indicadores-iframe"
        title="fmc"
        src="https://app.powerbi.com/view?r=eyJrIjoiNzk3OTNkZDYtNTQ0YS00NTZiLThjOWQtM2Y4NzIwODExM2ZiIiwidCI6ImVhMTg1NzIxLTM3OTMtNDg0Yy1iZGI4LTk5NTc5N2NlMGVjYyIsImMiOjR9"
        allowFullScreen
      />
    </div>
  );
};

export default Indicadoresfmc;
