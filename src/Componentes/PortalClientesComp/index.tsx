import React, { useState } from "react";
import { MdWarehouse } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import logo from "../../Imagenes/albatros.png";
import { FaBoxes } from "react-icons/fa";
import "./estilos.css";

const PortalClientesComp: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState("diseno");

  return (
    <div className="PortalClientesComp-contenedor">
      <aside className="PortalClientesComp-menu-lateral">
        <div className="PortalClientesComp-encabezado">
          <img src={logo} alt="Logo Albatros" />
          <h2>Portal Clientes</h2>
        </div>
        <ul>
          <li
            className={seccionActiva === "diseno" ? "PortalClientesComp-activo" : ""}
            onClick={() => setSeccionActiva("diseno")}
          >
            Diseña tu servicio
          </li>
          <li
            className={seccionActiva === "crea" ? "PortalClientesComp-activo" : ""}
            onClick={() => setSeccionActiva("crea")}
          >
            Crea tu servicio
          </li>
          <li>Crear solicitud de servicio</li>
          <li>Contacta con un asesor</li>
          <li>Consulta estado de tu servicio</li>
          <li
            className={seccionActiva === "indicadores" ? "PortalClientesComp-activo" : ""}
            onClick={() => setSeccionActiva("indicadores")}
          >
            Informes e indicadores
          </li>
          <li>Facturación y cartera</li>
          <li>PQR</li>
          <li>Bot de servicio</li>
        </ul>
      </aside>
      <main className="PortalClientesComp-contenido">
        
        {seccionActiva === "diseno" && (
          <div className="PortalClientesComp-categoria-diseno">
            <div className="PortalClientesComp-categoria">
                <MdWarehouse />
              <h3>Almacenamiento</h3>
            </div>
            <div className="PortalClientesComp-categoria">
                <FaTruck />
              <h3>Carga Masiva</h3>
            </div>
            <div className="PortalClientesComp-categoria">
                <FaBoxes />
              <h3>Paqueteo</h3>
            </div>
            <button>Cotiza</button>
          </div>
        )}

        {seccionActiva === "crea" && (
          <div className="PortalClientesComp-categoria-crea">
          <div className="PortalClientesComp-categoria">

            <h3>Creacion de servicio</h3>
          </div>
          
        </div>
        )}

        {seccionActiva === "indicadores" && (
          <div className="PortalClientesComp-categoria-indicadores">
            <h3>Informes e Indicadores</h3>
            <img src="https://scopi.com.br/wp-content/uploads/2023/12/iStock-1253379369.jpg" alt="Indicadores" />                      
        </div>
        )}


      </main>
    </div>
  );
};

export default PortalClientesComp;