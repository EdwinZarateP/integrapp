import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Mantén useNavigate para redirección
import logo from '../../Imagenes/albatros.png'; // Importación del logo
import './estilos.css'; // Importación del archivo CSS
import BotonSencillo from '../../Componentes/BotonSencillo';

const Registro: React.FC = () => {
  const navigate = useNavigate(); // Inicializa useNavigate
  const [passwordVisible, setVisibilidadPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tenedor, setTenedor] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');
  const [exitoMensaje, setExitoMensaje] = useState(false); // Cambiar a booleano

  const manejarVisibilidadPassword = () => {
    setVisibilidadPassword(!passwordVisible);
  };

  const manejarEnvioFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validación simple de email antes de enviar los datos
    if (!email.includes('@')) {
      setErrorMensaje('Por favor, ingresa un email válido.');
      return;
    }

    setErrorMensaje('');
    setExitoMensaje(false);

    try {
      const response = await fetch('https://integrappi.onrender.com/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,
          tenedor: tenedor,
          telefono: celular,  // La API espera "telefono"
          email: email,
          clave: password,    // La API espera "clave"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar el usuario');
      }

      setExitoMensaje(true); // Cambia el estado a true al registrar exitosamente

    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMensaje(`Error: ${error.message}`);
      } else {
        setErrorMensaje('Ocurrió un error inesperado');
      }
    }
  };

  // Efecto para redirigir automáticamente después de un registro exitoso
  useEffect(() => {
    if (exitoMensaje) {
      // Redirigir a la página principal
      const timer = setTimeout(() => {
        navigate('/'); // Cambia a la ruta deseada
      }, 2000); // Redirige después de 2 segundos

      return () => clearTimeout(timer); // Limpia el timer si el componente se desmonta
    }
  }, [exitoMensaje, navigate]); // Dependencias del efecto

  return (
    <div className="contenedor">
      <img src={logo} alt="Logo Integra" className="logo" />

      <div className="titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      {errorMensaje && <p className="error">{errorMensaje}</p>}
      {exitoMensaje && (
        <p className="exito">¡Usuario registrado con éxito! Ingresa </p>
      )}

      <form className="formulario" onSubmit={manejarEnvioFormulario}>
        <div className="contenedorInput">
          <label htmlFor="nombre" className="etiqueta">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Digite su nombre"
            className="input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="contenedorInput">
          <label htmlFor="tenedor" className="etiqueta">Cedula o nit del propietario</label>
          <input
            id="tenedor"
            type="text"
            placeholder="Cedula o nit con el que registra sus vehiculos"
            className="input"
            value={tenedor}
            onChange={(e) => setTenedor(e.target.value)}
            required
          />
        </div>

        <div className="contenedorInput">
          <label htmlFor="celular" className="etiqueta">Celular</label>
          <input
            id="celular"
            type="tel"
            placeholder="Digite su número de celular"
            className="input"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            required
          />
        </div>

        <div className="contenedorInput">
          <label htmlFor="email" className="etiqueta">Email</label>
          <input
            id="email"
            type="email"
            placeholder="conductores@gmail.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="contenedorInput">
          <label htmlFor="password" className="etiqueta">Clave</label>
          <div className="inputWrapper">
            <input
              id="password"
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Digite su clave"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <BotonSencillo type="submit" texto="Registrar" colorClass="negro" />
      </form>
    </div>
  );
};

export default Registro;
