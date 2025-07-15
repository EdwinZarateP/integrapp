import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../../Funciones/ApiPedidos/usuarios";
import confetti from "canvas-confetti";
import logo from '../../Imagenes/albatros.png';
import "./estilos.css";

const LoginUsuario: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Si ya existe cookie, redirige directamente
  useEffect(() => {
    const match = document.cookie.match(/(^| )usuarioPedidosCookie=([^;]+)/);
    if (match) navigate("/Pedidos", { replace: true });
  }, [navigate]);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError("");
    setCargando(true);

    try {
      const res = await loginUsuario(usuario, clave);

      // Definir fecha de expiración para dentro de 14 días
      const expiracion = new Date();
      expiracion.setDate(expiracion.getDate() + 14);
      const expires = `expires=${expiracion.toUTCString()}`;

      // Guardar cookies con expiración
      document.cookie = `usuarioPedidosCookie=${res.usuario.usuario}; path=/; ${expires}`;
      document.cookie = `regionalPedidosCookie=${res.usuario.regional}; path=/; ${expires}`;
      document.cookie = `perfilPedidosCookie=${res.usuario.perfil}; path=/; ${expires}`;

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate("/Pedidos", { replace: true });
      }, 800);
    } catch {
      setMensajeError("Usuario o clave incorrectos. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };
  

  return (
    <div className="LoginUsuario-contenedor">
      <img src={logo} alt="Logo Integra" className="LoginUsuario-Logo" />
      <h2 className="LoginUsuario-titulo">Iniciar sesión </h2>
      <form className="LoginUsuario-formulario" onSubmit={manejarLogin}>
        <input
          className="LoginUsuario-input"
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <div className="LoginUsuario-password-wrapper">
          <input
            className="LoginUsuario-input LoginUsuario-input-password"
            type={mostrarClave ? "text" : "password"}
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarClave((prev) => !prev)}
            className="LoginUsuario-ojito"
            aria-label="Mostrar u ocultar contraseña"
          >
            {mostrarClave ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          className="LoginUsuario-boton"
          type="submit"
          disabled={cargando}
        >
          {cargando ? "Verificando..." : "Ingresar"}
        </button>

        {mensajeError && (
          <p className="LoginUsuario-error">{mensajeError}</p>
        )}
      </form>
    </div>
  );
};

export default LoginUsuario;
