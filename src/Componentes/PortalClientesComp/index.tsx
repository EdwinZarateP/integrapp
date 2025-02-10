import { useState } from "react";
import logo from "../../Imagenes/albatros.png";
import DisenoServicio from "../../Componentes/DisenoServicio/index"
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
            <DisenoServicio/>
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