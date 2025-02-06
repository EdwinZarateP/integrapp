import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTruck, FaTools, FaWhatsapp, FaBars, FaTimes } from "react-icons/fa";
import { LiaPeopleCarrySolid } from "react-icons/lia";
import { IoIosPeople } from "react-icons/io";
import { RiCustomerService2Line } from "react-icons/ri";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css";

const PaginaIntegra: React.FC = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const [whatsappLink, setWhatsappLink] = useState("https://wa.me/573125443396");

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cambiarCarruselIzquierda = () => {
    setIndiceCarrusel(indiceCarrusel === 0 ? 1 : indiceCarrusel - 1); // Lo vuelve cíclico
  };

  const cambiarCarruselDerecha = () => {
    setIndiceCarrusel(indiceCarrusel === 1 ? 0 : indiceCarrusel + 1); // Lo vuelve cíclico
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // WhatsApp Web
        setWhatsappLink(
          `https://web.whatsapp.com/send?phone=573125443396&text=${encodeURIComponent(
            "Hola, necesito ayuda"
          )}`
        );
      } else {
        // WhatsApp normal
        setWhatsappLink(
          `https://wa.me/573125443396?text=${encodeURIComponent(
            "Hola, necesito ayuda"
          )}`
        );
      }
    };

    // Ejecutar la función al montar el componente
    handleResize();

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener("resize", handleResize);

    // Limpiar el event listener al desmontar el componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="PaginaIntegra-contenedor">
      <header className="PaginaIntegra-encabezado">
        <nav className="PaginaIntegra-navegacion">
          <button className="PaginaIntegra-menu-boton" onClick={toggleMenu}>
            {menuAbierto ? <FaTimes /> : <FaBars />}
          </button>
          <ul className={`PaginaIntegra-menu ${menuAbierto ? "abierto" : ""}`}>
            <li className="PaginaIntegra-item">NOSOTROS</li>
            <li className="PaginaIntegra-item">SERVICIOS</li>
            <li className="PaginaIntegra-item">CONSULTA</li>
            <img src={logo} alt="Logo Integra" className="PaginaIntegra-logo" />
            <li className="PaginaIntegra-item">Aliados</li>
            <li className="PaginaIntegra-item">ÚNETE</li>
            <li className="PaginaIntegra-item">CONTÁCTANOS</li>
          </ul>
        </nav>
      </header>

      <div className="PaginaIntegra-busqueda">
        <div className="PaginaIntegra-busqueda-input">
          <input
            type="text"
            placeholder="Rastrea tu guía"
            className="PaginaIntegra-input"
          />
          <button className="PaginaIntegra-boton">🔍</button>
        </div>
      </div>

      <main className="PaginaIntegra-principal">
        {/* Carrusel */}
        <div className="PaginaIntegra-banner">
          <div
            className={`PaginaIntegra-item-banner ${
              indiceCarrusel === 0 ? "activo" : "inactivo"
            }`}
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://png.pngtree.com/png-clipart/20230825/original/pngtree-illustration-of-the-transport-logistics-center-and-trucks-picture-image_8494404.png")',
            }}
          >
            <h1 className="PaginaIntegra-titulo">Recolección en tu empresa</h1>
            <p className="PaginaIntegra-descripcion">
              Recogemos en el lugar que desees
            </p>
            <img src={logo} alt="Logo Integra" className="PaginaIntegra-logo2" />
          </div>
          <div
            className={`PaginaIntegra-item-banner ${
              indiceCarrusel === 1 ? "activo" : "inactivo"
            }`}
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://www.gadsoftware.com/wp-content/uploads/2024/01/Software-de-Gestion-de-Almacenes-WMS.jpg")',
            }}
          >
            <h1 className="PaginaIntegra-titulo">Almacenamiento a tu medida</h1>
            <p className="PaginaIntegra-descripcion">
              Tenemos CEDI adaptables a tu necesidad
            </p>
            <img src={logo} alt="Logo Integra" className="PaginaIntegra-logo2" />
          </div>
          <button
            className="PaginaIntegra-btn-carrusel"
            onClick={cambiarCarruselIzquierda}
          >
            ◀
          </button>
          <button
            className="PaginaIntegra-btn-carrusel"
            onClick={cambiarCarruselDerecha}
          >
            ▶
          </button>
        </div>
      </main>

      <div className="PaginaIntegra-opciones">
        <div className="PaginaIntegra-opcion">
          <IoIosPeople className="PaginaIntegra-icono" />
          <p>Portal Clientes</p>
        </div>

        <div
          className="PaginaIntegra-opcion"
          onClick={() => navigate("/InicioIntegrApp")}
        >
          <FaTruck className="PaginaIntegra-icono" />
          <p>Portal Transportadores</p>
        </div>
        <div className="PaginaIntegra-opcion">
          <LiaPeopleCarrySolid className="PaginaIntegra-icono" />
          <p>Portal ventas</p>
        </div>

        <div className="PaginaIntegra-opcion">
          <LiaPeopleCarrySolid className="PaginaIntegra-icono" />
          <p>intranet</p>
        </div>

        <div className="PaginaIntegra-opcion">
          <FaTools className="PaginaIntegra-icono" />
          <p>Más Herramientas</p>
        </div>
      </div>

      {/* Botón de WhatsApp */}
      <a
        href={whatsappLink}
        className="PaginaIntegra-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp />
      </a>

      <a
        href="https://integralogistica.com/"
        className="PaginaIntegra-pqr"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiCustomerService2Line />
      </a>
    </div>
  );
};

export default PaginaIntegra;