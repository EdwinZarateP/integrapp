import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
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
}

const LoginUsuariosSeguridad = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 1. Cargar cookies al abrir
  useEffect(() => {
    const savedUser = Cookies.get("seguridadUsuario");
    const savedPass = Cookies.get("seguridadClave");
    const savedId = Cookies.get("seguridadId");
    const savedPerfil = Cookies.get("seguridadPerfil");

    if (savedUser) setUsuario(savedUser);
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
        { usuario, clave }
      );

      const data = response.data.usuario;

      // 🔹 Guardar cookies por 30 días
      Cookies.set("seguridadUsuario", data.usuario, { expires: 30 });
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
      setError("Usuario o clave incorrectos.");
    }
  };

  return (
    <div className="LoginSeguridad-contenedor">
      
      {/* 1. ELEMENTOS FUERA DE LA TARJETA BLANCA */}
      
      {/* Logo */}
      <img src={logo} alt="logo" className="LoginSeguridad-logo" />

      {/* Título de Marca (IntegrApp) con colores separados */}
      <div className="LoginSeguridad-titulo-brand">
        <span>Integr</span>
        <span>App</span>
      </div>

      {/* Subtítulo */}
      <h2 className="LoginSeguridad-subtitulo">Ingreso Seguridad</h2>

      {/* 2. TARJETA BLANCA (FORMULARIO) */}
      <form className="LoginSeguridad-formulario" onSubmit={manejarLogin}>
        
        {/* Input Usuario */}
        <label className="LoginSeguridad-etiqueta">Usuario</label>
        <div className="LoginSeguridad-inputWrapper">
            <input
            type="text"
            placeholder="Ingrese su usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="LoginSeguridad-input"
            />
        </div>

        {/* Input Clave */}
        <label className="LoginSeguridad-etiqueta">Clave</label>
        <div className="LoginSeguridad-inputWrapper">
          <input
            type={mostrarClave ? "text" : "password"}
            placeholder="Ingrese su contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="LoginSeguridad-input"
          />
          
          {/* Botón del ojito */}
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

        {/* Error dentro de la tarjeta */}
        {error && <p className="LoginSeguridad-mensajeError">{error}</p>}
      </form>
    </div>
  );
};

export default LoginUsuariosSeguridad;