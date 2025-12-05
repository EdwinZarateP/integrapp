// src/Paginas/Olvidoclave.tsx
import React, { useState } from 'react';
import logo from '../../Imagenes/albatros.png';
import './estilos.css';
import BotonSencillo from '../../Componentes/BotonSencillo';

type ApiRespuesta = {
  mensaje?: string;
  detail?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''; 

const Olvidoclave: React.FC = () => {
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError('Ingresa un correo válido.');
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch(`${API_BASE}/usuarios/recuperar/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim }),
      });

      const data: ApiRespuesta = await resp.json().catch(() => ({} as ApiRespuesta));
      if (!resp.ok) {
        throw new Error(data?.detail || 'No pudimos procesar tu solicitud.');
      }

      setMensaje(
        data?.mensaje ||
          'Si el email existe, se envió un enlace de recuperación. Revisa tu bandeja de entrada y spam.'
      );
    } catch (e: any) {
      setError(e?.message || 'Ocurrió un error enviando el correo de recuperación.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`Olvidoclave-contenedor ${enviando ? 'Olvidoclave-cargando' : ''}`}>
      <img src={logo} alt="Logo Integra" className="Olvidoclave-logo" />

      <div className="Olvidoclave-titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>

      <form className="Olvidoclave-formulario" onSubmit={manejarEnvioFormulario} noValidate>
        {/* Deshabilita todos los controles mientras se envía */}
        <fieldset disabled={enviando} className="Olvidoclave-fieldset">
          <div className="Olvidoclave-contenedorInput">
            <label htmlFor="email" className="Olvidoclave-etiqueta">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="conductores@gmail.com"
              className="Olvidoclave-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {mensaje && (
            <p className="Olvidoclave-mensaje" role="status" aria-live="polite">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="Olvidoclave-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <div className="Olvidoclave-acciones">
            <BotonSencillo
              type="submit"
              texto={enviando ? 'Enviando…' : 'Recuperar'}
              colorClass="negro"
            />
          </div>

          {/* Botón nativo oculto por si BotonSencillo no rinde un <button type="submit"> */}
          <button type="submit" className="Olvidoclave-submitOculto" aria-hidden />
        </fieldset>
      </form>

      <div className="Olvidoclave-pie">
        <small>
          Te enviaremos un enlace para restablecer tu contraseña si el correo está registrado.
        </small>
      </div>
    </div>
  );
};

export default Olvidoclave;
