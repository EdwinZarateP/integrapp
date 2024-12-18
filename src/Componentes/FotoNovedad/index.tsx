import React from 'react';
import './estilos.css';
import { useContext } from 'react';
import { ContextoApp } from '../../Contexto/index';
import { useNavigate } from 'react-router-dom'; // Importar el hook para navegación

const FotoNovedad: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  const navigate = useNavigate(); // Declaramos el hook para navegar

  return (
    <div className="fotoNovedad-contenedor">
      <div className="iframe-contenedor">
        {/* Iframe para mostrar el contenido del enlace */}
        <iframe
          src={almacenVariables?.link}
          title="Contenido de novedad"
          className="iframe-contenido"
        ></iframe>
      </div>

      {/* Botón para navegar a la ruta /Estados */}
      <button
        className="navegacion-btn"
        onClick={() => navigate('/Estados')}
      >
        Volver
      </button>
    </div>
  );
};

export default FotoNovedad;
