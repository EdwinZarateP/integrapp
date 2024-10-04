import React, { useState } from 'react';
import logo from '../../Imagenes/logo2.png'; // Importación del logo
import './estilos.css'; // Importación del archivo CSS

const Registro: React.FC = () => {
  const [passwordVisible, setVisibilidadPassword] = useState(false);
  const [verifyPasswordVisible, setVerifyPasswordVisible] = useState(false);

  const manejarVisibilidadPassword = () => {
    setVisibilidadPassword(!passwordVisible);
  };

  const manejarVisibilidadVerifyPassword = () => {
    setVerifyPasswordVisible(!verifyPasswordVisible);
  };

  return (
    <div className="contenedor">
      <img src={logo} alt="Logo Integra" className="logo" />

      <div className="titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      <form className="formulario">
        <div className="contenedorInput">
          <label htmlFor="email" className="etiqueta">Email</label>
          <input
            id="email"
            type="email"
            placeholder="conductores@gmail.com"
            className="input"
          />
        </div>

        <div className="contenedorInput">
          <label htmlFor="password" className="etiqueta">Contraseña</label>
          <div className="inputWrapper">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Digite su contraseña"
              className="input"
            />
            <button
              type="button"
              onClick={manejarVisibilidadPassword}
              className="verContrasenaBtn"
            >
              {passwordVisible ? (
                <span role="img" aria-label="Hide password">👁️</span> // Ícono de ojo abierto
              ) : (
                <span role="img" aria-label="Show password">👁️‍🗨️</span> // Ícono de ojo cerrado
              )}
            </button>
          </div>
        </div>

        <div className="contenedorInput">
          <label htmlFor="verifyPassword" className="etiqueta">Verificar Contraseña</label>
          <div className="inputWrapper">
            <input
              id="verifyPassword"
              type={verifyPasswordVisible ? "text" : "password"}
              placeholder="Digite de nuevo su contraseña"
              className="input"
            />
            <button
              type="button"
              onClick={manejarVisibilidadVerifyPassword}
              className="verContrasenaBtn"
            >
              {verifyPasswordVisible ? (
                <span role="img" aria-label="Hide password">👁️</span> // Ícono de ojo abierto
              ) : (
                <span role="img" aria-label="Show password">👁️‍🗨️</span> // Ícono de ojo cerrado
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="boton">Ingresar</button>
      </form>
    </div>
  );
};

export default Registro;
