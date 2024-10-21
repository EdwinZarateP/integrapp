import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../Imagenes/albatros.png';
import './estilos.css';
import BotonSencillo from '../../Componentes/BotonSencillo';
import { ContextoApp } from '../../Contexto/index';
import confetti from 'canvas-confetti'; // Importar confetti

// Define un tipo para las claves de ContextProps
type ContextKeys = 'nombre' | 'tenedor' | 'celular' | 'email' | 'password';

const Registro: React.FC = () => {
  const navigate = useNavigate();
  const [passwordVisible, setVisibilidadPassword] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  // Traigo las variables del proveedor
  const almacenVariables = useContext(ContextoApp);

  // Maneja la visibilidad de la contraseña
  const manejarVisibilidadPassword = () => {
    setVisibilidadPassword(!passwordVisible);
  };

  // Maneja el cambio en los campos del formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: ContextKeys; value: string };

    // Verificar que almacenVariables no sea undefined
    if (almacenVariables) {
      switch (name) {
        case 'nombre':
          almacenVariables.setNombre(value);
          break;
        case 'tenedor':
          almacenVariables.setTenedor(value);
          break;
        case 'celular':
          almacenVariables.setCelular(value);
          break;
        case 'email':
          almacenVariables.setEmail(value);
          break;
        case 'password':
          almacenVariables.setPassword(value);
          break;
        default:
          break;
      }
    }
  };

  // Función para lanzar confetti (explosión)
  const lanzarConfetti = () => {
    confetti({
      particleCount: 200, // Número de piezas de confeti
      spread: 70,         // Ángulo de dispersión
      origin: { y: 0.6 }, // Ajuste para la altura de la explosión
    });
  };

  // Maneja el envío del formulario
  const manejarEnvioFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validación del email
    if (almacenVariables && !almacenVariables.email.includes('@')) {
      setErrorMensaje('Por favor, ingresa un email válido.');
      return;
    }

    setErrorMensaje('');

    try {
      const response = await fetch('https://integrappi.onrender.com/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: almacenVariables?.nombre,
          tenedor: almacenVariables?.tenedor,
          telefono: almacenVariables?.celular,
          email: almacenVariables?.email,
          clave: almacenVariables?.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar el usuario');
      }

      // Lanzar confetti (explosión)
      lanzarConfetti();

      // Esperar 1 segundo para mostrar la explosión y luego navegar
      // Esperar 1 segundo para mostrar la explosión y luego navegar
    setTimeout(() => {
      window.scrollTo(0, 0); // Desplazar a la parte superior
      navigate('/');
    }, 1000);


    } catch (error: unknown) {
      setErrorMensaje(`Error: ${error instanceof Error ? error.message : 'Ocurrió un error inesperado'}`);
    }
  };

  return (
    <div className="contenedor">
      <img src={logo} alt="Logo Integra" className="logo" />
      <div className="titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      {errorMensaje && <p className="error">{errorMensaje}</p>}

      <form className="formulario" onSubmit={manejarEnvioFormulario}>
        {['nombre tenedor', 'cedula tenedor', 'celular', 'email'].map((field) => (
          <div className="contenedorInput" key={field}>
            <label htmlFor={field} className="etiqueta">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              id={field}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              placeholder={`Digite ${field}`}
              className="input"
              value={almacenVariables ? almacenVariables[field as ContextKeys] : ''} // Acceso seguro
              onChange={manejarCambio}
              required
            />
          </div>
        ))}

        <div className="contenedorInput">
          <label htmlFor="password" className="etiqueta">Clave</label>
          <div className="inputWrapper">
            <input
              id="password"
              name="password"
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Digite su clave"
              className="input"
              value={almacenVariables ? almacenVariables.password : ''} // Acceso seguro
              onChange={manejarCambio}
              required
            />
            <button
              type="button"
              onClick={manejarVisibilidadPassword}
              className="verContrasenaBtn"
            >
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <BotonSencillo type="submit" texto="Registrar" colorClass="negro" />
      </form>
    </div>
  );
};

export default Registro;
