import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaTruck } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { FaUserTie } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import './estilos.css';

interface SeccionDocumentos {
  subtitulo: string;
  items: {
    nombre: string;
    progreso: number;
  }[];
}

const CreacionVehiculo: React.FC = () => {
  const imagenesSecciones: Record<string, JSX.Element> = {
    "1. Documentos para Vehículo": <FaTruck size={50} />,
    "2. Documentos para Conductor": <FaUser size={50} />,
    "3. Documentos para Tenedor": <FaUserTie size={50} />,
    "4. Documentos para Propietario": <FcBusinessman size={50} />,
  };

  const secciones: SeccionDocumentos[] = [
    {
      subtitulo: "1. Documentos para Vehículo",
      items: [
        { nombre: "Tarjeta de Propiedad", progreso: 30 },
        { nombre: "SOAT", progreso: 45 },
        { nombre: "Revisión Tecnomecánica", progreso: 75 },
        { nombre: "Tarjeta de Remolque", progreso: 20 },
        { nombre: "Fotos", progreso: 90 },
        { nombre: "Póliza de Responsabilidad Civil", progreso: 60 },
        { nombre: "Copia del Documento de Identidad", progreso: 100 }
      ]
    },
    {
      subtitulo: "2. Documentos para Conductor",
      items: [
        { nombre: "Licencia de Conducción Vigente", progreso: 85 },
        { nombre: "Planilla de EPS", progreso: 40 },
        { nombre: "Planilla de ARL", progreso: 65 }
      ]
    },
    {
      subtitulo: "3. Documentos para Tenedor",
      items: [
        { nombre: "Copia del Documento de Identidad", progreso: 100 },
        { nombre: "Certificación Bancaria", progreso: 30 },
        { nombre: "Documento que lo acredite como Tenedor", progreso: 0 },
        { nombre: "RUT", progreso: 75 }
      ]
    },
    {
      subtitulo: "4. Documentos para Propietario",
      items: [
        { nombre: "Copia del Documento de Identidad", progreso: 100 },
        { nombre: "RUT", progreso: 90 }
      ]
    }
  ];

  const [visibleSeccion, setVisibleSeccion] = useState<number | null>(null);

  const toggleSeccion = (index: number) => {
    setVisibleSeccion(visibleSeccion === index ? null : index);
  };

  const enviarVehiculo = () => {
    Swal.fire({
      title: "🚧 En construcción",
      text: "Estamos trabajando en construir este botón",
      icon: "info",
      confirmButtonText: "Ok",
    });
  };
 

  return (
    <div className='CreacionVehiculo-contenedor-principal'>
      <div className="CreacionVehiculo-titulo">
        <h1>Documentos para registrar vehículo</h1>
      </div>
      <div className="CreacionVehiculo-contenedor">
        {secciones.map((seccion, index) => {
          const promedioProgreso = Math.round(
            seccion.items.reduce((acc, item) => acc + item.progreso, 0) / seccion.items.length
          );

          return (
            <section key={index} className="CreacionVehiculo-seccion">
              <h2 
                className="CreacionVehiculo-subtitulo" 
                onClick={() => toggleSeccion(index)}
              >
                {seccion.subtitulo} ({promedioProgreso}%)
                <span className={`CreacionVehiculo-flecha ${visibleSeccion === index ? 'abierta' : ''}`}>
                  {visibleSeccion === index ? '▼' : '▶'}
                </span>
              </h2>
              {visibleSeccion === index ? (
                <ul className="CreacionVehiculo-lista">
                  {seccion.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="CreacionVehiculo-item">
                      <span>{item.nombre}</span>
                      <div className="CreacionVehiculo-item-derecha">
                        <span className="CreacionVehiculo-progreso">
                          {item.progreso}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="CreacionVehiculo-imagen">
                  {imagenesSecciones[seccion.subtitulo]}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className='CreacionVehiculo-botonFinal' onClick={enviarVehiculo}>
        Crear Vehículo          
      </div>
    </div>
  );
};

export default CreacionVehiculo;
