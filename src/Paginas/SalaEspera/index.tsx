import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExtraccionTotal from "../../Funciones/ExtraccionTotal"; // Importa la función ExtraccionTotal
import logo from "../../Imagenes/albatros.png";
import HashLoader from "react-spinners/HashLoader";
import Cookies from 'js-cookie';
import Swal from "sweetalert2";
import "./estilos.css";

const SalaEspera: React.FC = () => {

  const navigate = useNavigate();
  const nombreIntegrappCookie = Cookies.get('nombreIntegrapp');
  const { ejecutarExtraccion } = ExtraccionTotal();
  const [loading, setLoading] = useState(false); 

    // Función para manejar el cierre de sesión
    const cerrarSesion = () => {
      // Remover las cookies
      Cookies.remove('nombreIntegrapp');
      Cookies.remove('tenedorIntegrapp');
      // Redirigir al inicio y recargar la página
      navigate("/");
    };
    
  const irManifiestos = async () => {
    setLoading(true); // Mostrar el loader al iniciar la extracción
    try {
      console.log("Iniciando extracción total...");
      await ejecutarExtraccion(); // Ejecutar extracción total
      // console.log("Extracción completada.");
      navigate("/SeleccionEstados"); // Navegar después de completar la extracción
    } catch (error) {
      console.error("Error durante la extracción total:", error);
      setLoading(false); 
    }
  };

  const irFormularioHojavida = async () => {
    Swal.fire({
      icon: "warning",
      title: "👷‍♀️Estamos en construcción 🏗️",
      text: "En este botón, próximamente podrás registrar y gestionar tus vehículos",
      confirmButtonText: "Aceptar",
    });
      // navigate("/FormularioHojavida");
  };

  return (
    <div className="SalaEspera-contenedor">
      {loading ? (
        <div className="SalaEspera-loader">
          <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={loading} />
          <p>Cargando información de tus manifiestos, por favor espera...</p>
        </div>
      ) : (
        <>
          <img src={logo} alt="Logo Integra" className="SalaEspera-logo" />
          <h1 className="SalaEspera-titulo">Hola {nombreIntegrappCookie}</h1>
        
          <button className="SalaEspera-boton" onClick={irManifiestos}>
            Manifiestos
          </button>
          <button className="SalaEspera-boton" onClick={irFormularioHojavida} >
            Crea tus vehículos
          </button>

          {/* Contenedor para el botón de Cerrar Sesión alineado a la derecha */}
          <div className="SalaEspera-cerrar-sesion-container">
            <span onClick={cerrarSesion} className="SalaEspera-cerrar-sesion">Cerrar sesión</span>
          </div>

        </>
      )}
    </div>
  );
};

export default SalaEspera;
