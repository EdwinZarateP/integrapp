import React, { useState } from 'react';
import logo from '../../Imagenes/logo2.png'; // Importación del logo
import './estilos.css'; // Importación del archivo CSS

const Registro: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="contenedor">
      <img src={logo} alt="Logo Integra" className="logo" />

      <h1 className="titulo">IntegrApp</h1>

      <form className="formulario">
        <div className="contenedorInput">
          <label htmlFor="email" className="etiqueta">Email</label>
          <input
            id="email"
            type="email"
            placeholder="conductores@gmail.com"
            className="input"
            value="conductor@gmail.com"
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
              onClick={togglePasswordVisibility}
              className="verContraseñaBtn"
            >
              {passwordVisible ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <button type="submit" className="boton">Ingresar</button>
      </form>

      <div className="pieDePagina">
        <a href="#" className="enlace">Olvidé la clave</a>
        <a href="#" className="enlace">Registrarse</a>
      </div>
    </div>
  );
};

export default Registro;
