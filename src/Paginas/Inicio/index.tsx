// import React, { useContext, useEffect, useRef } from 'react';
import "./estilos.css";
import logo from "../../Imagenes/logo2.png";
import { useContext } from "react";
import { ContextoApp } from "../../Contexto/index";

const Inicio: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  return (
    <div className="ContenedorInicio">
      <h3>Hola {almacenVariables?.usuario?.nombre}</h3>
      <img src={logo} alt="Logo integra" className="logo" />
      <h3>Bienvenido a integrApp</h3>
    </div>
  );
};

export default Inicio;
