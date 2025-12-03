import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png"; 
import "./estilos.css";

const BarraSeguridad: React.FC = () => {
  const navigate = useNavigate();
  const usuario = Cookies.get("seguridadUsuario") || "Usuario Seguridad";

  const [menuAbierto, setMenuAbierto] = useState(false);

  // Función para volver al inicio (PaginaIntegra)
  const irInicio = () => {
    navigate("/"); // Redirige a la raíz (PaginaIntegra)
  };

  const cerrarSesion = () => {
    Cookies.remove("seguridadUsuario");
    Cookies.remove("seguridadClave");
    Cookies.remove("seguridadId");
    Cookies.remove("seguridadPerfil");

    navigate("/LoginUsuariosSeguridad", { replace: true });
  };

  const handleClickOutside = () => {
    if (menuAbierto) {
      setMenuAbierto(false);
    }
  };

  return (
    <div className="barra-superior" onClick={handleClickOutside}>
      
      {/* 1. SECCIÓN IZQUIERDA: CON EVENTO ONCLICK PARA IR AL INICIO */}
      <div 
        className="barra-izquierda" 
        onClick={irInicio} 
        title="Volver al inicio"
      >
        <img src={logo} alt="Logo" className="barra-logo" />
        <div className="barra-titulos-agrupados">
          <h2 className="barra-titulo">HOJA DE VIDA VEHICULOS</h2>
          <div className="barra-subtitulos-linea">
            <span className="barra-subtitulo">INTEGR</span>
            <span className="barra-subsubtitulo"> APP</span>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DERECHA: USUARIO Y MENÚ */}
      <div className="barra-derecha">
        <div className="barra-usuario">
          👤 {usuario}
        </div>

        <div className="hamburguesa-container">
          <div
            className={`hamburguesa ${menuAbierto ? "abierta" : ""}`}
            onClick={(e) => {
              e.stopPropagation(); 
              setMenuAbierto(!menuAbierto);
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {menuAbierto && (
            <div className="menu-desplegable" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={cerrarSesion}
                className="btn-cerrar-sesion" 
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarraSeguridad;