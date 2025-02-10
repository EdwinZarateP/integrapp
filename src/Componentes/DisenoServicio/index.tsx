import React, { useState } from "react";
import { MdWarehouse } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import { FaBoxes } from "react-icons/fa";
import "./estilos.css";

const subitems = {
  almacenamiento: ["Posiciones de estiba", "Vehiculos recibidos", "Líneas alistadas", "Cajas", "Inhouse (Sí/No)", "Auditoria Alistamiento", "Coordinador", "Auxiliares", "Operarios"],
  carga_Masiva: ["Cajas", "Inhouse (Sí/No)"],
  paqueteo: ["Cajas", "Hora Recogida", "Días al Mes"],
};

const DisenoServicio: React.FC = () => {
  const [seleccionados, setSeleccionados] = useState<{ [key: string]: string }>({});
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  const handleDragStart = (categoria: string, item: string) => {
    const prefijo = categoria.slice(0, 3).toUpperCase();
    setArrastrando(`${prefijo} - ${item}`);
  };

  const handleDrop = () => {
    if (arrastrando && !seleccionados[arrastrando]) {
      setSeleccionados((prev) => ({ ...prev, [arrastrando]: "" }));
    }
    setArrastrando(null);
  };

  const handleRemove = (item: string) => {
    setSeleccionados((prev) => {
      const newState = { ...prev };
      delete newState[item];
      return newState;
    });
  };

  const handleInputChange = (item: string, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    setSeleccionados((prev) => ({ ...prev, [item]: value }));
  };

  return (
    <div className="DisenoServicio-contenedor">
      <div className="DisenoServicio-panel-izquierdo">
        {Object.entries(subitems).map(([categoria, items]) => (
          <div key={categoria} className="DisenoServicio-categoria">
            {categoria === "almacenamiento" && <MdWarehouse />}
            {categoria === "carga_Masiva" && <FaTruck />}
            {categoria === "paqueteo" && <FaBoxes />}
            <h3>{categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h3>
            <ul>
              {items.map((item) => (
                !Object.keys(seleccionados).includes(`${categoria.slice(0, 3).toUpperCase()} - ${item}`) && (
                  <li
                    key={item}
                    draggable
                    onDragStart={() => handleDragStart(categoria, item)}
                  >
                    {item}
                  </li>
                )
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="DisenoServicio-panel-derecho" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <h3>Configura tu servicio</h3>
        <ul>
          {Object.keys(seleccionados).map((item) => (
            <li key={item} >
              {item} 
              <input className="DisenoServicio-item-configurado" type="text" value={seleccionados[item]} onChange={(e) => handleInputChange(item, e.target.value)} placeholder="Ingresa cantidad" />
              <button onClick={() => handleRemove(item)}>X</button>
            </li>
          ))}
        </ul>
        <button className="DisenoServicio-solicitar" disabled={Object.keys(seleccionados).length === 0}>
          Solicitar Cotización
        </button>
      </div>
    </div>
  );
};

export default DisenoServicio;
