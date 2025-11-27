import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css";

const BarraSeguridad: React.FC = () => {
  const navigate = useNavigate();
  const usuario = Cookies.get("seguridadUsuario") || "Usuario Seguridad";

  const cerrarSesion = () => {
    Cookies.remove("seguridadUsuario");
    Cookies.remove("seguridadClave");
    Cookies.remove("seguridadId");
    Cookies.remove("seguridadPerfil");

    navigate("/LoginUsuariosSeguridad", { replace: true });
  };

  return (
    <div className="barra-superior">
      {/* LOGO */}
      <div className="barra-logo-container">
        <img src={logo} alt="Logo" className="barra-logo" />
        <h2 className="barra-titulo">HOJA DE VIDA VEHICULOS</h2>
      </div>

      {/* INFORMACIÓN DEL USUARIO */}
      <div className="barra-usuario">
        👤 {usuario}
      </div>

      {/* BOTÓN CERRAR SESIÓN */}
      <button className="barra-boton-salir" onClick={cerrarSesion}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default BarraSeguridad;
