import React from 'react';
import logo from '../../Imagenes/logo.png'; // Importación del logo
import './estilos.css'; // Importación del archivo CSS

const Olvidoclave: React.FC = () => {
  
  // Manejador para el evento de enviar el formulario
  const manejarEnvioFormulario = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita el comportamiento por defecto del formulario (recargar la página)
    alert('restauración de clave en construcción'); // Muestra el mensaje emergente
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

        <button type="submit" className="boton">Restaurar clave</button>

      </form>

    </div>
  );
};

export default Olvidoclave;
