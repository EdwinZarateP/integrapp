import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png"; // Asegúrate que esta ruta es correcta
import "./estilos.css";

const BarraSeguridad: React.FC = () => {
  const navigate = useNavigate();
  // Se obtiene el nombre del usuario, con un valor por defecto
  const usuario = Cookies.get("seguridadUsuario") || "Usuario Seguridad";

  // Estado para controlar la visibilidad del menú desplegable
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra la sesión, limpia las cookies y navega al login
  const cerrarSesion = () => {
    Cookies.remove("seguridadUsuario");
    Cookies.remove("seguridadClave");
    Cookies.remove("seguridadId");
    Cookies.remove("seguridadPerfil");

    navigate("/LoginUsuariosSeguridad", { replace: true });
  };

  // Función para cerrar el menú si se hace clic fuera de él
  const handleClickOutside = () => {
    if (menuAbierto) {
      setMenuAbierto(false);
    }
  };

  return (
    <div className="barra-superior" onClick={handleClickOutside}>
      
      {/* 1. SECCIÓN IZQUIERDA: LOGO Y TÍTULOS */}
      <div className="barra-izquierda">
        <img src={logo} alt="Logo" className="barra-logo" />
        <div className="barra-titulos-agrupados">
          <h2 className="barra-titulo">HOJA DE VIDA VEHICULOS</h2>
          {/* <--- CAMBIO AQUÍ: Agrupamos INTEGR APP en una línea con una clase nueva ---> */}
          <div className="barra-subtitulos-linea">
            <span className="barra-subtitulo">INTEGR</span>
            <span className="barra-subsubtitulo"> APP</span>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DERECHA: USUARIO Y MENÚ */}
      <div className="barra-derecha">
        {/* Nombre de Usuario (visible permanentemente) */}
        <div className="barra-usuario">
          👤 {usuario}
        </div>

        {/* Contenedor del Menú Desplegable */}
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

          {/* MENÚ DESPLEGABLE */}
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