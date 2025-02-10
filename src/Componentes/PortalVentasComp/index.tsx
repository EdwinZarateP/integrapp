import React, { useState } from "react";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css";

const PortalVentasComp: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState("negociacion");

  return (
    <div className="PortalVentasComp-contenedor">
      <aside className="PortalVentasComp-menu-lateral">
        <div className="PortalVentasComp-encabezado">
          <img src={logo} alt="Logo Albatros" />
          <h2>Portal Ventas</h2>
        </div>
        <ul>
          <li
            className={seccionActiva === "negociacion" ? "PortalVentasComp-activo" : ""}
            onClick={() => setSeccionActiva("negociacion")}
          >
            Herramientas de negociación
          </li>
          <li
            className={seccionActiva === "creacion" ? "PortalVentasComp-activo" : ""}
            onClick={() => setSeccionActiva("creacion")}
          >
            Creación de clientes
          </li>

        </ul>
      </aside>
      <main className="PortalVentasComp-contenido">
        
      {seccionActiva === "negociacion" && (
          <div className="PortalVentasComp-categoria-negociacion">
            <h3>Crear Oferta Comercial</h3>
            <form className="PortalVentasComp-formulario">
              <label>
                Tipo de Servicio:
                <select>
                  <option>Almacenamiento</option>
                  <option>Carga Masiva</option>
                  <option>Paqueteo</option>
                </select>
              </label>
              <label>
                Tiempos de Contrato:
                <input type="text" placeholder="Ej. 12 meses" />
              </label>
              <label>
                Cortes de Facturación:
                <input type="text" placeholder="Ej. Mensual, Trimestral" />
              </label>
              <label>
                Condiciones de Crédito:
                <textarea placeholder="Especifica las condiciones" />
              </label>
              <label>
                Otros Servicios:
                <textarea placeholder="Agrega otros servicios adicionales" />
              </label>
              <button type="button">Exportar a PDF</button>
            </form>
          </div>
        )}

        {seccionActiva === "creacion" && (
          <div className="PortalVentasComp-categoria-creacion">
          <div className="PortalVentasComp-categoria">

            <h3>Creacion de Clientes</h3>
          </div>
          
        </div>
        )}

      </main>
    </div>
  );
};

export default PortalVentasComp;