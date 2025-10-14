// src/Paginas/Recuperar.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './estilos.css';
import BotonSencillo from '../../Componentes/BotonSencillo';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const Recuperar: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) setError('Enlace inválido o incompleto.');
  }, [token]);

  const mostrarExitoYRedirigir = async (texto: string) => {
    try {
      const Swal = (await import('sweetalert2')).default;
      // opcional: estilos globales -> import 'sweetalert2/dist/sweetalert2.min.css'
      await Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: texto || 'Tu contraseña fue restablecida con éxito.',
        confirmButtonText: 'Ir a iniciar sesión',
        confirmButtonColor: '#111827',
        timer: 2200,
        timerProgressBar: true,
      });
    } catch {
      // Fallback simple si SweetAlert2 no está disponible
      alert(texto || 'Tu contraseña fue restablecida con éxito.');
    }
    navigate('/loginpropietarios');
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!token) return setError('Token no válido.');
    if (!clave || !confirmar) return setError('Completa ambos campos.');
    if (clave !== confirmar) return setError('Las contraseñas no coinciden.');
    if (clave.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

    setEnviando(true);
    try {
      const resp = await fetch(`${API_BASE}/usuarios/recuperar/confirmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, clave_nueva: clave }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error((data as any).detail || 'Error al restablecer la contraseña.');

      const texto = (data as any).mensaje || 'Tu contraseña fue restablecida con éxito.';
      setMensaje(texto);

      // Mostrar “swager” (SweetAlert2) y redirigir
      await mostrarExitoYRedirigir(texto);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="Recuperar-contenedor">
      <h2>Restablecer Contraseña</h2>

      <form onSubmit={manejarEnvio} className="Recuperar-formulario" noValidate>
        {/* Nueva contraseña */}
        <div className="Recuperar-inputGroup">
          <label htmlFor="clave">Nueva contraseña</label>
          <div className="Recuperar-inputPassword">
            <input
              id="clave"
              type={passwordVisible ? 'text' : 'password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              disabled={enviando}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="Recuperar-eyeBtn"
              onClick={() => setPasswordVisible((v) => !v)}
              aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={passwordVisible}
              title={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              disabled={enviando}
            >
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div className="Recuperar-inputGroup">
          <label htmlFor="confirmar">Confirmar contraseña</label>
          <div className="Recuperar-inputPassword">
            <input
              id="confirmar"
              type={confirmVisible ? 'text' : 'password'}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="••••••••"
              disabled={enviando}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="Recuperar-eyeBtn"
              onClick={() => setConfirmVisible((v) => !v)}
              aria-label={confirmVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={confirmVisible}
              title={confirmVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              disabled={enviando}
            >
              {confirmVisible ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {mensaje && <p className="Recuperar-mensaje">{mensaje}</p>}
        {error && <p className="Recuperar-error">{error}</p>}

        <BotonSencillo
          type="submit"
          texto={enviando ? 'Enviando…' : 'Restablecer'}
          colorClass="negro"
        />
      </form>
    </div>
  );
};

export default Recuperar;
