import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png"; 
import HeaderLogo from "../../Componentes/HeaderLogo";
import "./estilos.css"; 

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// Definimos las interfaces para TypeScript
interface RespuestaVerificacion {
  existe: boolean;
  mensaje?: string;
}
interface RespuestaCodigo {
  valido: boolean;
}

const OlvidoClaveConductor = () => {
  const [usuario, setUsuario] = useState("");
  const [codigo, setCodigo] = useState(""); 
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  
  // Paso 1: Usuario, Paso 2: Código, Paso 3: Nueva Clave
  const [step, setStep] = useState(1); 
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // --- PASO 1: Verificar Usuario y Enviar Código ---
  const enviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    try {
      const response = await axios.post<RespuestaVerificacion>(`${API_BASE}/baseusuarios/verificarRecuperacion`, {
        usuario: usuario,
        perfil: "CONDUCTOR" 
      });

      if (response.data.existe) {
        setStep(2); 
        setMensaje("¡Usuario encontrado! Hemos enviado un código de verificación a tu correo.");
      } else {
        setError("El usuario no existe o no es conductor.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Usuario no encontrado.");
      } else {
        setError("Error al enviar el código. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PASO 2: Validar el Código Ingresado ---
  const validarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    try {
        const response = await axios.post<RespuestaCodigo>(`${API_BASE}/baseusuarios/validarCodigoRecuperacion`, {
            usuario: usuario,
            codigo: codigo,
            perfil: "CONDUCTOR"
        });

        if (response.data.valido) {
            setStep(3);
            setMensaje("Código correcto. Ahora crea tu nueva contraseña.");
        } else {
            setError("El código ingresado es incorrecto o ha expirado.");
        }
    } catch (err: any) {
        console.error(err);
        setError("Error al validar el código.");
    } finally {
        setLoading(false);
    }
  };

  // --- PASO 3: Actualizar la contraseña ---
  const cambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (nuevaClave !== confirmarClave) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (nuevaClave.length < 4) {
      setError("La contraseña es muy corta.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE}/baseusuarios/cambiarClaveConductor`, {
        usuario: usuario,
        nuevaClave: nuevaClave,
        codigo: codigo, 
        perfil: "CONDUCTOR" 
      });

      setMensaje("¡Contraseña actualizada con éxito!");
      setTimeout(() => navigate("/LoginConductores"), 2000);

    } catch (err: any) {
      console.error(err);
      setError("No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormulario = () => {
    switch(step) {
      case 1:
        return (
          <form onSubmit={enviarCodigo} style={{ width: '100%' }}>
            <div className="LoginConductores-grupo-input">
                <label>Usuario / Cédula</label>
                <input
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="LoginConductores-input"
                  required
                  autoFocus
                />
            </div>
            <button type="submit" className="LoginConductores-boton" disabled={loading}>
              {loading ? "Buscando..." : "Enviar Código"}
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={validarCodigo} style={{ width: '100%' }}>
             <div className="alert-box" style={{ marginBottom: '15px' }}>
                Código enviado al correo asociado a: <strong>{usuario}</strong>
             </div>
            <div className="LoginConductores-grupo-input">
                <label>Código de Verificación</label>
                <input
                  type="text"
                  placeholder="Ingrese el código (Ej: 1234)"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="LoginConductores-input"
                  required
                  autoFocus
                />
            </div>
            <button type="submit" className="LoginConductores-boton" disabled={loading}>
              {loading ? "Verificando..." : "Validar Código"}
            </button>
            <p style={{textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', cursor: 'pointer', color: '#666'}} onClick={() => setStep(1)}>
               ¿No recibiste el código? Volver
            </p>
          </form>
        );
      case 3:
        return (
          <form onSubmit={cambiarClave} style={{ width: '100%' }}>
            <div className="LoginConductores-grupo-input">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={nuevaClave}
                  onChange={(e) => setNuevaClave(e.target.value)}
                  className="LoginConductores-input"
                  required
                />
            </div>
            <div className="LoginConductores-grupo-input">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="Repita la contraseña"
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                  className="LoginConductores-input"
                  required
                />
            </div>
            <button type="submit" className="LoginConductores-boton" disabled={loading}>
              {loading ? "Actualizando..." : "Confirmar Cambio"}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="LoginConductores-contenedor" style={{ position: 'relative' }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 10 }}>
          <HeaderLogo />
      </div>

      <img src={logo} alt="logo" className="LoginConductores-Logo" style={{ marginTop: '80px' }} />
      
      <div className="LoginConductores-titulo-app">
          <h1>Recuperar</h1>
          <h1>Acceso Conductor</h1>
      </div>
      
      <div className="LoginConductores-formulario">
        {renderFormulario()}

        {error && <p className="LoginConductores-error" style={{ marginTop: '15px' }}>{error}</p>}
        {mensaje && <p className="text-success" style={{ marginTop: '15px', color: '#27ae60', fontWeight: 'bold', textAlign: 'center' }}>{mensaje}</p>}

        <div className="LoginConductores-links" style={{ marginTop: '20px', justifyContent: 'center' }}>
          <Link to="/LoginConductores" className="LoginConductores-link">
              ← Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OlvidoClaveConductor;