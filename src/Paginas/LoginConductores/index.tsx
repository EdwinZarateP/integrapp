import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import confetti from "canvas-confetti";
import { useNavigate, Link } from "react-router-dom"; 
import logo from "../../Imagenes/albatros.png"; 
import HeaderLogo from "../../Componentes/HeaderLogo"; 
import "./estilos.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

interface UsuarioBackend {
  id: string;
  usuario: string;
  perfil: string;
}

interface RespuestaBackend {
  mensaje: string;
  usuario: UsuarioBackend;
  token?: string; 
}

const LoginConductores = () => {
  // Estado visual (lo que el usuario escribe)
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // 1. Cargar cookies al abrir
  useEffect(() => {
    const savedUser = Cookies.get("conductorUsuario");
    const savedPass = Cookies.get("conductorClave");
    const savedId = Cookies.get("conductorId");
    const savedPerfil = Cookies.get("conductorPerfil");

    if (savedUser) setUsuario(savedUser);
    if (savedPass) setClave(savedPass);

    // Login automático si ya existen credenciales válidas
    if (savedId && savedPerfil && savedUser && savedPass) {
      if (savedPerfil === "CONDUCTOR" || savedPerfil === "ADMIN") {
        navigate("/PanelConductores", { replace: true });
      }
    }
  }, [navigate]);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // --- LÓGICA AGREGADA ---
      // Normalizamos el correo: quitamos espacios y convertimos a minúsculas
      const usuarioNormalizado = usuario.trim().toLowerCase();

      const response = await axios.post<RespuestaBackend>(
        `${API_BASE}/baseusuarios/loginConductor`, 
        { 
          usuario: usuarioNormalizado, // Enviamos el normalizado
          clave 
        }
      );

      const data = response.data.usuario || response.data;
      const perfilUsuario = data.perfil ? data.perfil.toString().toUpperCase() : "";

      // 2. Validación estricta de Perfil
      if (perfilUsuario !== "CONDUCTOR" && perfilUsuario !== "ADMIN") {
        setError("🚫 Acceso denegado. Este sistema es exclusivo para Conductores.");
        return; 
      }

      // 3. Guardar cookies (Guardamos el usuario ya normalizado)
      Cookies.set("conductorUsuario", usuarioNormalizado, { expires: 30 });
      Cookies.set("conductorClave", clave, { expires: 30 });
      Cookies.set("conductorId", data.id.toString(), { expires: 30 });
      Cookies.set("conductorPerfil", perfilUsuario, { expires: 30 });

      // Efecto de éxito
      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Redirección
      setTimeout(() => {
        navigate("/PanelConductores", { replace: true });
      }, 800);

    } catch (err: any) {
      console.error(err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // Limpieza de seguridad
        Cookies.remove("conductorClave");
        Cookies.remove("conductorId");
        Cookies.remove("conductorPerfil");
        
        setClave(""); 
        setError("Correo o contraseña incorrectos.");
        
      } else if (err.response && err.response.status === 404) {
        setError("Conductor no encontrado.");
      } else {
        setError("Error de conexión con el servidor.");
      }
    }
  };

  return (
    <div className="LoginConductores-contenedor" style={{ position: 'relative' }}>
      
      {/* Header fijo */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 10 }}>
          <HeaderLogo />
      </div>

      <img src={logo} alt="logo" className="LoginConductores-Logo" style={{ marginTop: '80px' }} />
      
      <div className="LoginConductores-titulo-app">
          <h1>Ingreso</h1>
          <h1>Conductores</h1>
      </div>
      
      <form className="LoginConductores-formulario" onSubmit={manejarLogin}>
        <div className="LoginConductores-grupo-input">
            {/* Etiqueta actualizada para reflejar que es el correo */}
            <label>Correo Electrónico</label>
            <input
            type="email" // Cambiado a email para mejor UX en móviles
            placeholder="ejemplo@correo.com"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="LoginConductores-input"
            required
            autoComplete="email"
            />
        </div>

        <div className="LoginConductores-grupo-input">
            <label>Contraseña</label>
            <div className="LoginConductores-password-wrapper">
            <input
                type={mostrarClave ? "text" : "password"}
                placeholder="Contraseña"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="LoginConductores-input"
                required
            />
            <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="LoginConductores-ojito"
                tabIndex={-1}
            >
                {mostrarClave ? "🙈" : "👁️"}
            </button>
            </div>
        </div>

        <button type="submit" className="LoginConductores-boton">
          Ingresar
        </button>
      </form>

      <div className="LoginConductores-links">
        <Link to="/RegistroConductor" className="LoginConductores-link">
            Registrarse
        </Link>
        <Link to="/OlvidoClaveConductor" className="LoginConductores-link">
            Olvidé la clave
        </Link>
      </div>

      {error && <p className="LoginConductores-error">{error}</p>}
    </div>
  );
};

export default LoginConductores;