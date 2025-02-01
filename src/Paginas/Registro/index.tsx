import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../Imagenes/albatros.png';
import BotonSencillo from '../../Componentes/BotonSencillo';
import { ContextoApp } from '../../Contexto/index';
import confetti from 'canvas-confetti'; // Importar confetti
import './estilos.css';

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
      particleCount: 400, // Número de piezas de confeti
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
      const response = await fetch('https://integrappi-dvmh.onrender.com/usuarios/', {
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
      setTimeout(() => {
        window.scrollTo(0, 0); // Desplazar a la parte superior
        navigate('/InicioPropietarios');
      }, 0);

    } catch (error: unknown) {
      setErrorMensaje(`Error: ${error instanceof Error ? error.message : 'Ocurrió un error inesperado'}`);
    }
  };

  return (
    <div className="Registro-Contenedor">
      <img src={logo} alt="Logo Integra" className="Registro-Logo" />
      <div className="Registro-Titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      {errorMensaje && <p className="Registro-Error">{errorMensaje}</p>}

      <form className="Registro-Formulario" onSubmit={manejarEnvioFormulario}>
        {['nombre', 'tenedor', 'celular', 'email'].map((field) => (
          <div className="Registro-ContenedorInput" key={field}>
            <label htmlFor={field} className="Registro-Etiqueta">
              {field === 'tenedor' ? 'Cédula o NIT' : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={field}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              placeholder={field === 'tenedor' ? 'Digite su Cédula o NIT' : `Digite ${field}`}
              className="Registro-Input"
              value={almacenVariables ? almacenVariables[field as ContextKeys] : ''} // Acceso seguro
              onChange={manejarCambio}
              required
            />
          </div>
        ))}

        <div className="Registro-ContenedorInput">
          <label htmlFor="password" className="Registro-Etiqueta">Clave</label>
          <div className="Registro-InputWrapper">
            <input
              id="password"
              name="password"
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Digite su clave"
              className="Registro-Input"
              value={almacenVariables ? almacenVariables.password : ''} 
              onChange={manejarCambio}
              required
            />
            <button
              type="button"
              onClick={manejarVisibilidadPassword}
              className="Registro-VerContrasenaBtn"
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
