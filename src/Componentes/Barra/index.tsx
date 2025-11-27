import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css";

const BarraSeguridad: React.FC = () => {
  const navigate = useNavigate();
  const usuario = Cookies.get("seguridadUsuario") || "Usuario Seguridad";

  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    Cookies.remove("seguridadUsuario");
    Cookies.remove("seguridadClave");
    Cookies.remove("seguridadId");
    Cookies.remove("seguridadPerfil");

    navigate("/LoginUsuariosSeguridad", { replace: true });
  };

  return (
    <div className="barra-superior">
      
      {/* LOGO Y TÍTULO */}
      <div className="barra-logo-container">
        <img src={logo} alt="Logo" className="barra-logo" />
        <h2 className="barra-titulo">HOJA DE VIDA VEHICULOS</h2>
        <h2 className="barra-subtitulo"> INTEGR</h2>
        <h2 className= "barra-subsubtitulo"> APP </h2>
           </div>

      {/* USUARIO */}
      <div className="barra-usuario">
        👤 {usuario}
      </div>

      {/* MENÚ HAMBURGUESA */}
      <div className="hamburguesa-container">
        <div
          className={`hamburguesa ${menuAbierto ? "abierta" : ""}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* MENÚ DESPLEGABLE */}
        {menuAbierto && (
          <div className="menu-desplegable">
            <button onClick={cerrarSesion}>Cerrar Sesión</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default BarraSeguridad;
