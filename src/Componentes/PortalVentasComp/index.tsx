import React, { useState } from "react";
import logo from "../../Imagenes/albatros.png";
import "./estilos.css";

const PortalVentasComp: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState("negociacion");
  const [habilitarFormulario, setHabilitarFormulario] = useState(false);

  // Estados con valores iniciales modificables
  const [tiempoContrato, setTiempoContrato] = useState("5");
  const [cortesFacturacion, setCortesFacturacion] = useState("3");
  const [jornadaTrabajo, setJornadaTrabajo] = useState("12");
  const [nivelServicio, setNivelServicio] = useState("95");

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHabilitarFormulario(e.target.value.toLowerCase() === "codigo");
  };

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
            <h3> Oferta Comercial</h3>
            {/* Input que activa/desactiva el formulario */}
            <input 
              type="text" 
              className="PortalVentasComp-input" 
              placeholder="Código de cotización"
              onChange={manejarCambioInput}
            />

            {/* Formulario solo visible si escriben "codigo" */}
            {habilitarFormulario && (
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
                  <input 
                    type="text" 
                    placeholder="Ej. 12 meses" 
                    value={tiempoContrato} 
                    onChange={(e) => setTiempoContrato(e.target.value)}
                  />
                </label>

                <label>
                  Cortes de Facturación:
                  <input 
                    type="text" 
                    placeholder="Ej. Mensual, Trimestral" 
                    value={cortesFacturacion} 
                    onChange={(e) => setCortesFacturacion(e.target.value)}
                  />
                </label>

                <label>
                  Condiciones de Cartera:
                  <textarea placeholder="Especifica las condiciones" />
                </label>

                <label>
                  Jornada de Trabajo:
                  <input 
                    type="text" 
                    placeholder="Ej. 12 horas" 
                    value={jornadaTrabajo} 
                    onChange={(e) => setJornadaTrabajo(e.target.value)}
                  />
                </label>

                <label>
                 % Nivel de Servicio:
                  <input 
                    type="text" 
                    placeholder="Ej. 95%" 
                    value={nivelServicio} 
                    onChange={(e) => setNivelServicio(e.target.value)}
                  />
                </label>

                <label>
                  Otros Servicios:
                  <textarea placeholder="Agrega otros servicios adicionales" />
                </label>

                <button type="button">Exportar a PDF</button>
              </form>
            )}
          </div>
        )}

        {seccionActiva === "creacion" && (
          <div className="PortalVentasComp-categoria-creacion">
            <div className="PortalVentasComp-categoria">
              <h3>Creación de Clientes</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalVentasComp;
