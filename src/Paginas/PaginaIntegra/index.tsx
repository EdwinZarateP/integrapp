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

  const cambiarCarrusel = (direccion: "izquierda" | "derecha") => {
    setIndiceCarrusel((prev) =>
      direccion === "izquierda" ? (prev === 0 ? 1 : prev - 1) : (prev === 1 ? 0 : prev + 1)
    );
  };

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setWhatsappLink(
        isDesktop
          ? `https://web.whatsapp.com/send?phone=573125443396&text=${encodeURIComponent(
              "Hola, necesito ayuda"
            )}`
          : `https://wa.me/573125443396?text=${encodeURIComponent(
              "Hola, necesito ayuda"
            )}`
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
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
        <div className="PaginaIntegra-banner">
          {[0, 1].map((index) => (
            <div
              key={index}
              className={`PaginaIntegra-item-banner ${
                indiceCarrusel === index ? "activo" : "inactivo"
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${
                  index === 0
                    ? "https://png.pngtree.com/png-clipart/20230825/original/pngtree-illustration-of-the-transport-logistics-center-and-trucks-picture-image_8494404.png"
                    : "https://www.gadsoftware.com/wp-content/uploads/2024/01/Software-de-Gestion-de-Almacenes-WMS.jpg"
                })`,
              }}
            >
              <h1 className="PaginaIntegra-titulo">
                {index === 0 ? "Recolección en tu empresa" : "Almacenamiento a tu medida"}
              </h1>
              <p className="PaginaIntegra-descripcion">
                {index === 0
                  ? "Recogemos en el lugar que desees"
                  : "Tenemos CEDI adaptables a tu necesidad"}
              </p>
              <img src={logo} alt="Logo Integra" className="PaginaIntegra-logo2" />
            </div>
          ))}
          <button
            className="PaginaIntegra-btn-carrusel izquierda"
            onClick={() => cambiarCarrusel("izquierda")}
          >
            ◀
          </button>
          <button
            className="PaginaIntegra-btn-carrusel derecha"
            onClick={() => cambiarCarrusel("derecha")}
          >
            ▶
          </button>
        </div>
      </main>

      <div className="PaginaIntegra-opciones">
        {[
          { icon: <IoIosPeople />, text: "Portal Clientes", onClick: () => navigate("/PortalClientes") },
          { icon: <FaTruck />, text: "Portal Transportadores", onClick: () => navigate("/") },
          { icon: <LiaPeopleCarrySolid />, text: "Portal ventas", onClick: () => navigate("/PortalVentas") },          
          { icon: <LiaPeopleCarrySolid />, text: "Intranet" },
          { icon: <FaTools />, text: "Más Herramientas" },
        ].map((opcion, index) => (
          <div
            key={index}
            className="PaginaIntegra-opcion"
            onClick={opcion.onClick}
          >
            {opcion.icon}
            <p>{opcion.text}</p>
          </div>
        ))}
      </div>

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