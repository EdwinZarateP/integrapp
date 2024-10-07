import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import logo from '../../Imagenes/albatros.png'; // Importación del logo
import './estilos.css'; // Importación del archivo CSS

const Inicio: React.FC = () => {
  const [passwordVisible, setVisibilidadPassword] = useState(false);
  const navigate = useNavigate(); // Hook para navegar entre rutas

  const manejarVisibilidadPassword = () => {
    setVisibilidadPassword(!passwordVisible);
  };

  // Manejador para el evento de enviar el formulario
  const manejarEnvioFormulario = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita el comportamiento por defecto del formulario (recargar la página)
    // Redirigir a la página /SeleccionEstados
    navigate('/SeleccionEstados');
  };

  return (
    <div className="contenedor">
      <img src={logo} alt="Logo Integra" className="logo" />

      <div className="titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      <form className="formulario" onSubmit={manejarEnvioFormulario}>
        
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

        <button type="submit" className="boton">Ingresar</button>
      </form>

      <div className="pieDePagina">
        <Link to="/Olvidoclave" className="enlace">Olvidé la clave</Link>
        <Link to="/Registro" className="enlace">Registrarse</Link>
      </div>
    </div>
  );
};

export default Inicio;
