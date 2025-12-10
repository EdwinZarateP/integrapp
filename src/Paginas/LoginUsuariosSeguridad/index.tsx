import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css"; 

// 1. Importamos el componente del Header
import HeaderLogo from "../../Componentes/HeaderLogo";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

interface UsuarioBackend {
  id: string;
  nombre: string;
  usuario: string; 
  correo: string;  
  perfil: string;
}

interface RespuestaBackend {
  mensaje: string;
  usuario: UsuarioBackend;
}

const LoginUsuariosSeguridad = () => {
  // CAMBIO 1: Estado 'usuario' ahora es 'correo'
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 1. Cargar cookies al abrir
  useEffect(() => {
    // CAMBIO 2: Leemos la cookie de correo
    const savedCorreo = Cookies.get("seguridadCorreo");
    const savedPass = Cookies.get("seguridadClave");
    const savedId = Cookies.get("seguridadId");
    const savedPerfil = Cookies.get("seguridadPerfil");

    if (savedCorreo) setCorreo(savedCorreo);
    if (savedPass) setClave(savedPass);

    // Si ya hay login → entrar automático
    if (savedId && savedPerfil) {
      navigate("/revision", { replace: true });
    }
  }, [navigate]);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post<RespuestaBackend>(
        `${API_BASE}/baseusuarios/loginseguridad`,
        { correo, clave }
      );

      const data = response.data.usuario;

      // 🔹 Guardar cookies por 30 días
      Cookies.set("seguridadNombre", data.nombre, { expires: 30 });
      Cookies.set("seguridadCorreo", data.correo, { expires: 30 });
      Cookies.set("seguridadClave", clave, { expires: 30 });
      Cookies.set("seguridadId", data.id, { expires: 30 });
      Cookies.set("seguridadPerfil", data.perfil, { expires: 30 });

      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate("/revision", { replace: true });
      }, 800);

    } catch (err) {
      console.error(err);
      setError("Correo o clave incorrectos, o no tiene permisos.");
    }
  };

  return (
    <div className="LoginSeguridad-contenedor" style={{ position: 'relative' }}>
      
      {/* HEADER LOGO */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 10 }}>
        <HeaderLogo />
      </div>

      {/* ELEMENTOS FUERA DE LA TARJETA */}
      <img src={logo} alt="logo" className="LoginSeguridad-logo" />

      <div className="LoginSeguridad-titulo-brand">
        <span>Ingreso</span>
        <span>Seguridad</span>
      </div>

      {/* TARJETA BLANCA (FORMULARIO) */}
      <form className="LoginSeguridad-formulario" onSubmit={manejarLogin}>
        
        {/* CAMBIO 5: Input visualmente cambiado a Correo */}
        <label className="LoginSeguridad-etiqueta">Correo Electrónico</label>
        <div className="LoginSeguridad-inputWrapper">
            <input
            type="email" // Tipo email para mejor validación en móviles
            placeholder="ejemplo@integral.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="LoginSeguridad-input"
            required
            />
        </div>

        {/* Input Clave (Igual que antes) */}
        <label className="LoginSeguridad-etiqueta">Clave</label>
        <div className="LoginSeguridad-inputWrapper">
          <input
            type={mostrarClave ? "text" : "password"}
            placeholder="Ingrese su contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="LoginSeguridad-input"
          />
          
          <button
            type="button"
            onClick={() => setMostrarClave(!mostrarClave)}
            style={{
                top: "15%",
                position: "absolute",
                right: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
                color: "#888",
                display: "flex",
                alignItems: "center"
            }}
          >
            {mostrarClave ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Botón Ingresar */}
        <button type="submit" className="LoginSeguridad-boton">
          Ingresar
        </button>

        {/* Error */}
        {error && <p className="LoginSeguridad-mensajeError">{error}</p>}
      </form>
    </div>
  );
};

export default LoginUsuariosSeguridad;