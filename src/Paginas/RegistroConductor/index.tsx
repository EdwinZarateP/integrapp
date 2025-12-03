import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../Imagenes/albatros.png';
import confetti from 'canvas-confetti';
import './estilos.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

const REGIONALES = [
  'FUNZA', 'BARRANQUILLA', 'BUCARAMANGA', 'GIRARDOTA', 'CALI'
];

const RegistroConductor: React.FC = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  
  // 1. NUEVO ESTADO: Para controlar si se está enviando la info
  const [cargando, setCargando] = useState(false);
  
  const [formData, setFormData] = useState({
      nombre: '',
      cedula: '',
      telefono: '',
      regional: '',
      email: '',
      password: ''
  });

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiamos el error si el usuario empieza a escribir de nuevo
    if (errorMensaje) setErrorMensaje('');
  };

  const lanzarConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const manejarEnvioFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Evitar doble envío si ya está cargando
    if (cargando) return;

    // Validaciones básicas
    if (!formData.email.includes('@')) {
      setErrorMensaje('Por favor, ingresa un email válido.');
      return;
    }

    if (!formData.regional) {
      setErrorMensaje('Por favor, selecciona una regional.');
      return;
    }

    setErrorMensaje('');
    setCargando(true); // Bloqueamos el botón

    try {
      const payload = {
        nombre: formData.nombre,
        usuario: formData.email,
        celular: formData.telefono,
        regional: formData.regional,
        correo: formData.email,
        clave: formData.password,
        perfil: 'CONDUCTOR'
      };

      const response = await fetch(`${API_BASE}/baseusuarios/`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 2. MEJORA EN LA VALIDACIÓN DE DUPLICADOS
        // Verificamos si el mensaje incluye palabras clave o es exactamente el mensaje del backend
        const detalleError = errorData.detail || '';
        
        if (detalleError === "El usuario ya existe" || detalleError.includes("existe") || response.status === 409) {
             throw new Error("Este correo electrónico ya está registrado en el sistema.");
        }
        
        throw new Error(detalleError || 'Error al registrar el conductor');
      }

      // Éxito
      lanzarConfetti();
      setTimeout(() => {
        navigate('/LoginConductores');
      }, 1500);

    } catch (error: any) {
      console.error("Error al registrar:", error);
      setErrorMensaje(error.message || 'Error desconocido');
    } finally {
      // Liberamos el botón tanto si hubo éxito como si hubo error (excepto si redirigimos, pero no afecta)
      setCargando(false); 
    }
  };

  return (
    <div className="RegConductor-Contenedor">
      <img src={logo} alt="Logo Integra" className="RegConductor-Logo" />
      <div className="RegConductor-Titulo">
        <h1>Integr</h1>
        <h1>App</h1>
      </div>
      
      <h2 className="RegConductor-Subtitulo">Registro de Conductor</h2>

      {errorMensaje && <p className="RegConductor-Error">{errorMensaje}</p>}

      <form className="RegConductor-Formulario" onSubmit={manejarEnvioFormulario}>
        
        {/* ... (Inputs de Nombre, Cédula, Celular, Regional se mantienen igual) ... */}
        
        <div className="RegConductor-InputGroup">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
                id="nombre" name="nombre" type="text" placeholder="Ej: Juan Pérez" className="RegConductor-Input"
                value={formData.nombre} onChange={manejarCambio} required disabled={cargando}
            />
        </div>

        <div className="RegConductor-InputGroup">
            <label htmlFor="cedula">Cédula de Ciudadanía</label>
            <input
                id="cedula" name="cedula" type="number" placeholder="Ej: 123456789" className="RegConductor-Input"
                value={formData.cedula} onChange={manejarCambio} required disabled={cargando}
            />
        </div>

        <div className="RegConductor-InputGroup">
            <label htmlFor="telefono">Celular</label>
            <input
                id="telefono" name="telefono" type="tel" placeholder="Ej: 3001234567" className="RegConductor-Input"
                value={formData.telefono} onChange={manejarCambio} required disabled={cargando}
            />
        </div>

        <div className="RegConductor-InputGroup">
            <label htmlFor="regional">Regional</label>
            <select
                id="regional" name="regional" className="RegConductor-Input RegConductor-Select"
                value={formData.regional} onChange={manejarCambio} required disabled={cargando}
            >
                <option value="">Seleccione una regional</option>
                {REGIONALES.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                ))}
            </select>
        </div>

        <div className="RegConductor-InputGroup">
            <label htmlFor="email">Correo Electrónico (Usuario)</label>
            <input
                id="email" name="email" type="email"
                placeholder="conductor@ejemplo.com"
                className="RegConductor-Input"
                value={formData.email} onChange={manejarCambio} required
                disabled={cargando} // Deshabilitar input si está cargando
            />
        </div>

        <div className="RegConductor-InputGroup">
          <label htmlFor="password">Contraseña</label>
          <div className="RegConductor-InputWrapper">
            <input
              id="password" name="password"
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Crea una contraseña segura"
              className="RegConductor-Input"
              value={formData.password} onChange={manejarCambio} required
              disabled={cargando}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="RegConductor-VerBtn"
              disabled={cargando}
            >
              {passwordVisible ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* 3. BOTÓN DINÁMICO: Muestra texto diferente si está cargando */}
        <button 
            type="submit" 
            className="RegConductor-Boton"
            disabled={cargando}
            style={{ opacity: cargando ? 0.7 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
        >
            {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
        
        <div style={{textAlign: 'center', marginTop: '10px'}}>
             <span className="RegConductor-LinkLogin" onClick={() => !cargando && navigate('/LoginConductores')}>
                 ¿Ya tienes cuenta? Inicia sesión
             </span>
        </div>

      </form>
    </div>
  );
};

export default RegistroConductor;