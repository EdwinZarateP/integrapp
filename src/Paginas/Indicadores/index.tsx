import React from "react";
import "./estilos.css";

const Indicadores: React.FC = () => {
  return (
    <div className="Indicadores-container">
      <iframe
        className="Indicadores-iframe"
        title="integrapp"
        src="https://app.powerbi.com/view?r=eyJrIjoiN2IxMTUwYmQtY2YzMi00YWRmLTkxMGUtZmM0OTYxNTZkMWI3IiwidCI6ImVhMTg1NzIxLTM3OTMtNDg0Yy1iZGI4LTk5NTc5N2NlMGVjYyIsImMiOjR9"
        allowFullScreen
      />
    </div>
  );
};

export default Indicadores;
