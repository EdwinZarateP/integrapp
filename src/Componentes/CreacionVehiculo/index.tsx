import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaTruck } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { FaUserTie } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import axios from 'axios';
import CargaDocumento from '../CargaDocumento';
import './estilos.css';

const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

// Para documentos generales se usa el endpoint /subir-documento; para Fotos, el endpoint /subir-fotos.
const endpoints: Record<string, string> = {
  "Tarjeta de Propiedad": `${API_BASE_URL}/subir-documento`,
  "SOAT": `${API_BASE_URL}/subir-documento`,
  "Revisión Tecnomecánica": `${API_BASE_URL}/subir-documento`,
  "Tarjeta de Remolque": `${API_BASE_URL}/subir-documento`,
  "Fotos": `${API_BASE_URL}/subir-fotos`,
  "Póliza de Responsabilidad Civil": `${API_BASE_URL}/subir-documento`,
  "Documento de Identidad del Conductor": `${API_BASE_URL}/subir-documento`,
  "Documento de Identidad del Propietario": `${API_BASE_URL}/subir-documento`,
  "Documento de Identidad del Tenedor": `${API_BASE_URL}/subir-documento`,
  "Licencia de Conducción Vigente": `${API_BASE_URL}/subir-documento`,
  "Planilla de EPS": `${API_BASE_URL}/subir-documento`,
  "Planilla de ARL": `${API_BASE_URL}/subir-documento`,
  "Certificación Bancaria": `${API_BASE_URL}/subir-documento`,
  "Documento que lo acredite como Tenedor": `${API_BASE_URL}/subir-documento`,
  "RUT": `${API_BASE_URL}/subir-documento`
};

interface SeccionDocumentos {
  subtitulo: string;
  items: {
    nombre: string;
    progreso: number; // 0 si no está cargado, 100 si está cargado
  }[];
}

const CreacionVehiculo: React.FC = () => {
  const imagenesSecciones: Record<string, JSX.Element> = {
    "1. Documentos del Vehículo": <FaTruck size={50} />,
    "2. Documentos del Conductor": <FaUser size={50} />,
    "3. Documentos del Tenedor": <FaUserTie size={50} />,
    "4. Documentos del Propietario": <FcBusinessman size={50} />,
  };

  // Definimos las secciones y documentos (ajusta los progresos iniciales según convenga)
  const [secciones, setSecciones] = useState<SeccionDocumentos[]>([
    {
      subtitulo: "1. Documentos del Vehículo",
      items: [
        { nombre: "Tarjeta de Propiedad", progreso: 0 },
        { nombre: "SOAT", progreso: 0 },
        { nombre: "Revisión Tecnomecánica", progreso: 0 },
        { nombre: "Tarjeta de Remolque", progreso: 0 },
        { nombre: "Fotos", progreso: 0 },
        { nombre: "Póliza de Responsabilidad Civil", progreso: 0 },
        { nombre: "Documento de Identidad del Conductor", progreso: 0 }
      ]
    },
    {
      subtitulo: "2. Documentos del Conductor",
      items: [
        { nombre: "Licencia de Conducción Vigente", progreso: 0 },
        { nombre: "Planilla de EPS", progreso: 0 },
        { nombre: "Planilla de ARL", progreso: 0 }
      ]
    },
    {
      subtitulo: "3. Documentos del Tenedor",
      items: [
        { nombre: "Documento de Identidad del Tenedor", progreso: 0 },
        { nombre: "Certificación Bancaria", progreso: 0 },
        { nombre: "Documento que lo acredite como Tenedor", progreso: 0 },
        { nombre: "RUT", progreso: 0 }
      ]
    },
    {
      subtitulo: "4. Documentos del Propietario",
      items: [
        { nombre: "Documento de Identidad del Propietario", progreso: 0 },
        { nombre: "RUT", progreso: 0 }
      ]
    }
  ]);

  const [visibleSeccion, setVisibleSeccion] = useState<number | null>(null);
  const [selectedDocumento, setSelectedDocumento] = useState<{
    sectionIndex: number;
    itemIndex: number;
    documentName: string;
    endpoint: string;
  } | null>(null);

  // Placa ficticia para la demo.
  const placa = "ABC";

  const toggleSeccion = (index: number) => {
    setVisibleSeccion(visibleSeccion === index ? null : index);
  };

  // Al hacer clic en "Cargar" se abre el modal para subir el documento
  const handleOpenDocumento = (
    sectionIndex: number,
    itemIndex: number,
    documentName: string
  ) => {
    const endpoint = endpoints[documentName];
    if (!endpoint) {
      alert(`No hay endpoint definido para ${documentName}`);
      return;
    }
    setSelectedDocumento({ sectionIndex, itemIndex, documentName, endpoint });
  };

  // Mapeo para obtener el tipo esperado por el backend
  const tiposMapping: Record<string, string> = {
    "tarjeta de propiedad": "tarjeta_propiedad",
    "soat": "soat",
    "revisión tecnomecánica": "revision_tecnomecanica",
    "tarjeta de remolque": "tarjeta_remolque",
    "fotos": "fotos",
    "póliza de responsabilidad civil": "poliza_responsabilidad",
    "documento de identidad del conductor": "documento_identidad_conductor",
    "documento de identidad del propietario": "documento_identidad_propietario",
    "documento de identidad del tenedor": "documento_identidad_tenedor",
    "licencia de conducción vigente": "licencia",
    "planilla de eps": "planilla_eps",
    "planilla de arl": "planilla_arl",
    "certificación bancaria": "certificacion_bancaria",
    "documento que lo acredite como tenedor": "documento_acreditacion_tenedor",
    "rut": "rut"
  };

  // Llama al endpoint de eliminación
  const handleDeleteDocumento = async (
    sectionIndex: number,
    itemIndex: number,
    documentName: string
  ) => {
    try {
      const lower = documentName.toLowerCase();
      const tipo = tiposMapping[lower] || lower.replace(/\s+/g, "_");
      const deleteEndpoint = `${API_BASE_URL}/eliminar-documento?placa=${placa}&tipo=${tipo}`;
      const response = await axios.delete(deleteEndpoint);
      if (response.status === 200) {
        Swal.fire("Eliminado", `${documentName} eliminado correctamente`, "success");
        setSecciones((prev) => {
          const newSecciones = [...prev];
          newSecciones[sectionIndex].items[itemIndex].progreso = 0;
          return newSecciones;
        });
      }
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      Swal.fire("Error", "No se pudo eliminar el documento", "error");
    }
  };

  const enviarVehiculo = () => {
    Swal.fire({
      title: "🚧 En construcción",
      text: "Estamos trabajando en construir este botón",
      icon: "info",
      confirmButtonText: "Ok"
    });
  };

  return (
    <div className="CreacionVehiculo-contenedor-principal">
      <div className="CreacionVehiculo-titulo">
        <h1>Documentos para registrar vehículo</h1>
      </div>
      <div className="CreacionVehiculo-contenedor">
        {secciones.map((seccion, index) => {
          // Calculamos el avance total (promedio) de la sección
          const _promedioProgreso = Math.round(
            seccion.items.reduce((acc, item) => acc + item.progreso, 0) / (seccion.items.length * 100) * 100
          );
          return (
            <section key={index} className="CreacionVehiculo-seccion">
              <h2
                className="CreacionVehiculo-subtitulo"
                onClick={() => toggleSeccion(index)}
              >
                {seccion.subtitulo} ({_promedioProgreso}%)
                <span className={`CreacionVehiculo-flecha ${visibleSeccion === index ? "abierta" : ""}`}>
                  {visibleSeccion === index ? "▼" : "▶"}
                </span>
              </h2>
              {visibleSeccion === index ? (
                <ul className="CreacionVehiculo-lista">
                  {seccion.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="CreacionVehiculo-item">
                      <span>{item.nombre}</span>
                      <div className="CreacionVehiculo-item-derecha">
                        {item.progreso < 100 ? (
                          <button onClick={() => handleOpenDocumento(index, itemIndex, item.nombre)}>
                            Cargar
                          </button>
                        ) : (
                          <button className="btn-eliminar" onClick={() => handleDeleteDocumento(index, itemIndex, item.nombre)}>
                            Eliminar
                          </button>
                        )}
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
      <div className="CreacionVehiculo-botonFinal" onClick={enviarVehiculo}>
        Crear Vehículo
      </div>
      {selectedDocumento && (
        <CargaDocumento
          documentName={selectedDocumento.documentName}
          endpoint={selectedDocumento.endpoint}
          placa={placa}
          onClose={() => setSelectedDocumento(null)}
          onUploadSuccess={(result: string | string[]) => {
            console.log("Documento subido:", result);
            setSecciones((prevSecciones) => {
              const newSecciones = [...prevSecciones];
              newSecciones[selectedDocumento.sectionIndex].items[selectedDocumento.itemIndex].progreso = 100;
              return newSecciones;
            });
            setSelectedDocumento(null);
          }}
        />
      )}
    </div>
  );
};

export default CreacionVehiculo;
