import React, { useState } from 'react';
import logo from '../../Imagenes/albatros.png'; // Ajusta la ruta si es necesario
import './estilos.css';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

type ApiRespuesta = {
  mensaje?: string;
  detail?: string;
};

const OlvidoClaveConductor: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const manejarEnvioFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje(null);
    setError(null);

    const emailTrim = email.trim();
    if (!emailTrim) {
      setError('Por favor ingresa tu correo.');
      return;
    }

    setEnviando(true);
    try {
      // Endpoint sugerido, ajusta según tu backend real
      const resp = await fetch(`${API_BASE}/usuarios/recuperar/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, perfil: 'CONDUCTOR' }), // Enviamos perfil por si el backend lo requiere
      });

      const data: ApiRespuesta = await resp.json().catch(() => ({} as ApiRespuesta));
      if (!resp.ok) {
        throw new Error(data?.detail || 'No pudimos procesar tu solicitud.');
      }

      setMensaje(
        data?.mensaje ||
          'Si el email existe en conductores, se envió un enlace de recuperación.'
      );
    } catch (e: any) {
      setError(e?.message || 'Ocurrió un error enviando el correo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`OlvidoConductor-contenedor ${enviando ? 'cargando' : ''}`}>
      <img src={logo} alt="Logo Integra" className="OlvidoConductor-logo" />

      <div className="OlvidoConductor-titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>
      
      <h3 className="OlvidoConductor-subtitulo">Recuperación Conductores</h3>

      <form className="OlvidoConductor-formulario" onSubmit={manejarEnvioFormulario} noValidate>
        <fieldset disabled={enviando} className="OlvidoConductor-fieldset">
          <div className="OlvidoConductor-grupo">
            <label htmlFor="email" className="OlvidoConductor-etiqueta">
              Email Registrado
            </label>
            <input
              id="email"
              type="email"
              placeholder="micorreo@ejemplo.com"
              className="OlvidoConductor-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mensaje && <p className="OlvidoConductor-mensaje exito">{mensaje}</p>}
          {error && <p className="OlvidoConductor-mensaje error">{error}</p>}

          <div className="OlvidoConductor-acciones">
            <button type="submit" className="OlvidoConductor-boton">
                {enviando ? 'Enviando...' : 'Recuperar Contraseña'}
            </button>
          </div>
          
          <div style={{textAlign: 'center', marginTop: '15px'}}>
              <span className="OlvidoConductor-link" onClick={() => navigate('/LoginConductores')}>
                  Volver al Inicio
              </span>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default OlvidoClaveConductor;