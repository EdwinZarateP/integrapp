import React from 'react';
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png"; 
import './estilos.css';

const HeaderLogo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header 
      className="HeaderLogo-contenedor" 
      onClick={() => navigate("/")} 
      title="Volver al inicio"
    >
      <img src={logo} alt="Logo Albatros" className="HeaderLogo-img" />
      
      <div className="HeaderLogo-titulo">
        <span>Integr</span>
        <span>App</span>
      </div>
      
      <div className="HeaderLogo-subtitulo">
        <span>Cadena De</span>
        <span>Servicios</span>
      </div>  
    </header>
  );
};

export default HeaderLogo;