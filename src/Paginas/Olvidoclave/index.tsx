import React from 'react';
import logo from '../../Imagenes/logo2.png'; // Importación del logo
import './estilos.css'; // Importación del archivo CSS

const Olvidoclave: React.FC = () => {

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

        <button type="submit" className="boton">Restaurar clave</button>

      </form>

    </div>
  );
};

export default Olvidoclave;
