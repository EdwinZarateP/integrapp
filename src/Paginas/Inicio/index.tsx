import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../Imagenes/albatros.png';
import './estilos.css';
import BotonSencillo from '../../Componentes/BotonSencillo';
import { ContextoApp } from '../../Contexto/index';

const Inicio: React.FC = () => {
  const almacenVariables = useContext(ContextoApp); // Mueve el uso de useContext aquí
  const [passwordVisible, setVisibilidadPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error
  const navigate = useNavigate();

  const manejarVisibilidadPassword = () => {
    setVisibilidadPassword(!passwordVisible);
  };

  const manejarEnvioFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(''); // Limpiar el mensaje de error antes de enviar

    try {
      const response = await fetch('https://integrappi.onrender.com/usuarios/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: almacenVariables?.email || '', // Usa almacenVariables.email aquí
          password: almacenVariables?.password || '', // Usa almacenVariables.password aquí
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const data = await response.json();
      console.log(data.access_token); // Aquí puedes almacenar el token según sea necesario

      navigate('/SeleccionEstados');
    } catch (error) {
      console.error('Error de autenticación:', error);
      setErrorMessage('Credenciales incorrectas. Inténtalo de nuevo.'); // Establecer el mensaje de error
    }
  };

  return (
    <div className="contenedor">
      <img src={logo} alt="Logo Integra" className="logo" />

      <div className="titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      {errorMessage && <div className="mensajeError">{errorMessage}</div>} {/* Mostrar mensaje de error */}

      <form className="formulario" onSubmit={manejarEnvioFormulario}>
        
        <div className="contenedorInput">
          <label htmlFor="email" className="etiqueta">Email</label>
          <input
            id="email"
            type="email"
            placeholder="conductores@gmail.com"
            className="input"
            value={almacenVariables?.email || ''} // Usa almacenVariables.email aquí
            onChange={(e) => almacenVariables?.setEmail(e.target.value)} // Actualiza el estado del email en Contexto
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
              value={almacenVariables?.password || ''} // Usa almacenVariables.password aquí
              onChange={(e) => almacenVariables?.setPassword(e.target.value)} // Actualiza el estado de la contraseña en Contexto
            />
            <button
              type="button"
              onClick={manejarVisibilidadPassword}
              className="verContrasenaBtn"
            >
              {passwordVisible ? (
                <span role="img" aria-label="Hide password">👁️</span>
              ) : (
                <span role="img" aria-label="Show password">👁️‍🗨️</span>
              )}
            </button>
          </div>
        </div>

        <BotonSencillo type="submit" texto="Ingresar" colorClass="negro"/>
        
      </form>

      <div className="pieDePagina">
        <Link to="/Olvidoclave" className="enlace">Olvidé la clave</Link>
        <Link to="/Registro" className="enlace">Registrarse</Link>
      </div>
    </div>
  );
};

export default Inicio;
