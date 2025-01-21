import React, { useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '../../Imagenes/AnimationPuntos.json';
import './P2RegistroPlaca.css';

const P2RegistroPlaca: React.FC = () => {
  const [placa, setPlaca] = useState('');
  const [idUsuario, setIdUsuario] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para la animación de carga

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!placa || !idUsuario || !archivo) {
      setMensaje('Por favor, complete todos los campos y seleccione un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('placa', placa);
    formData.append('id_usuario', idUsuario);
    formData.append('archivo', archivo);

    setIsLoading(true); // Mostrar la animación antes de iniciar la carga

    try {
      const response = await fetch('https://integrappi.onrender.com/vehiculos/subir-tarjeta', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje('Archivo subido exitosamente.');
        setArchivoUrl(data.url); // Mostrar la URL del archivo
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.detail}`);
      }
    } catch (error) {
      setMensaje('Error al subir el archivo. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false); // Ocultar la animación al finalizar la carga
    }
  };

  return (
    <div className="P2RegistroPlaca-contenedor">
      {/* Mostrar la animación solo cuando isLoading sea true */}
      {isLoading && (
        <div className="P2RegistroPlaca-lottie">
          <Lottie
            animationData={animationData}
            style={{ height: 200, width: '100%', margin: 'auto' }}
          />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="P2RegistroPlaca-formulario-contenedor">
            <h1 className="P2RegistroPlaca-titulo">Registro de Placa</h1>
            <form className="P2RegistroPlaca-formulario" onSubmit={handleSubmit}>
              <div className="P2RegistroPlaca-campo">
                <label htmlFor="placa" className="P2RegistroPlaca-label">Placa del Vehículo</label>
                <input
                  type="text"
                  id="placa"
                  className="P2RegistroPlaca-input"
                  placeholder="Ingrese la placa"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  required
                />
              </div>
              <div className="P2RegistroPlaca-campo">
                <label htmlFor="idUsuario" className="P2RegistroPlaca-label">ID del Usuario</label>
                <input
                  type="text"
                  id="idUsuario"
                  className="P2RegistroPlaca-input"
                  placeholder="Ingrese su ID de usuario"
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(e.target.value)}
                  required
                />
              </div>
              <div className="P2RegistroPlaca-campo">
                <label htmlFor="archivo" className="P2RegistroPlaca-label">Tarjeta de Propiedad</label>
                <input
                  type="file"
                  id="archivo"
                  className="P2RegistroPlaca-file"
                  accept=".pdf, image/*"
                  onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <button type="submit" className="P2RegistroPlaca-boton">Subir Archivo</button>
            </form>
            {mensaje && <p className="P2RegistroPlaca-mensaje">{mensaje}</p>}
          </div>
          <div className="P2RegistroPlaca-archivo-preview">
            {archivoUrl && (
              <div>
                <h2>Archivo Subido</h2>
                {archivoUrl.endsWith('.pdf') ? (
                  <a href={archivoUrl} target="_blank" rel="noopener noreferrer">
                    Ver PDF Subido
                  </a>
                ) : (
                  <img src={archivoUrl} alt="Archivo Subido" className="P2RegistroPlaca-imagen" />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default P2RegistroPlaca;
