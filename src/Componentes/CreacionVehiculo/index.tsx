import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaTruck } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { FaUserTie } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import CargaDocumento from '../CargaDocumento';
import VerDocumento from '../VerDocumento';
import { ContextoApp } from "../../Contexto/index";
import './estilos.css';

// Función para obtener la información del vehículo por placa
export async function obtenerVehiculoPorPlaca(placa: string): Promise<any> {
  try {
    const respuesta = await fetch(`https://integrappi-dvmh.onrender.com/vehiculos/obtener-vehiculo/${placa}`, {
      cache: "no-store",
    });
    if (!respuesta.ok) {
      throw new Error("Error al obtener la información del vehículo.");
    }
    return await respuesta.json();
  } catch (error) {
    console.error("Error en la llamada a la API:", error);
    return null;
  }
}

const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

// Endpoints para cada documento
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
  "RUT Tenedor": `${API_BASE_URL}/subir-documento`,
  "RUT Propietario": `${API_BASE_URL}/subir-documento`
};

interface DocumentoItem {
  nombre: string;
  progreso: number; // 0 si no está cargado, 100 si está cargado
  url?: string | string[];
}

interface SeccionDocumentos {
  subtitulo: string;
  items: DocumentoItem[];
}

// Información del documento abierto en el visor
interface VerDocumentoInfo {
  sectionIndex: number;
  itemIndex: number;
  urls: string[];
}

const CreacionVehiculo: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }
  const { verDocumento, setVerDocumento } = almacenVariables;

  const imagenesSecciones: Record<string, JSX.Element> = {
    "1. Documentos del Vehículo": <FaTruck size={50} />,
    "2. Documentos del Conductor": <FaUser size={50} />,
    "3. Documentos del Tenedor": <FaUserTie size={50} />,
    "4. Documentos del Propietario": <FcBusinessman size={50} />,
  };

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
        { nombre: "RUT Tenedor", progreso: 0 }
      ]
    },
    {
      subtitulo: "4. Documentos del Propietario",
      items: [
        { nombre: "Documento de Identidad del Propietario", progreso: 0 },
        { nombre: "RUT Propietario", progreso: 0 }
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
  // Estado para abrir el modal VerDocumento junto con la información del item (índices y URLs)
  const [verDocumentoInfo, setVerDocumentoInfo] = useState<VerDocumentoInfo | null>(null);

  const placa = "ABC";

  const tiposMapping: Record<string, string> = {
    "tarjeta de propiedad": "tarjetaPropiedad",
    "soat": "soat",
    "revisión tecnomecánica": "revisionTecnomecica", // Nota: ajustar si es revisionTecnomecanica
    "tarjeta de remolque": "tarjetaRemolque",
    "fotos": "fotos",
    "póliza de responsabilidad civil": "polizaResponsabilidad",
    "documento de identidad del conductor": "documentoIdentidadConductor",
    "documento de identidad del propietario": "documentoIdentidadPropietario",
    "documento de identidad del tenedor": "documentoIdentidadTenedor",
    "licencia de conducción vigente": "licencia",
    "planilla de eps": "planillaEps",
    "planilla de arl": "planillaArl",
    "certificación bancaria": "certificacionBancaria",
    "documento que lo acredite como tenedor": "documentoAcreditacionTenedor",
    "rut tenedor": "rutTenedor",
    "rut propietario": "rutPropietario"
  };

  useEffect(() => {
    const cargarVehiculo = async () => {
      const data = await obtenerVehiculoPorPlaca(placa);
      if (data && data.data) {
        const vehiculo = data.data;
        setSecciones(prevSecciones =>
          prevSecciones.map(seccion => {
            const nuevosItems = seccion.items.map(item => {
              let field = "";
              const nombreLower = item.nombre.toLowerCase();
              if (nombreLower === "rut tenedor") {
                field = "rutTenedor";
              } else if (nombreLower === "rut propietario") {
                field = "rutPropietario";
              } else {
                field = tiposMapping[nombreLower] || "";
              }
              if (field) {
                if (field === "fotos") {
                  if (Array.isArray(vehiculo[field]) && vehiculo[field].length > 0) {
                    return { ...item, progreso: 100, url: vehiculo[field] };
                  }
                } else if (vehiculo[field]) {
                  return { ...item, progreso: 100, url: vehiculo[field] };
                }
              }
              return item;
            });
            return { ...seccion, items: nuevosItems };
          })
        );
      }
    };
    cargarVehiculo();
  }, [placa]);

  const toggleSeccion = (index: number) => {
    setVisibleSeccion(visibleSeccion === index ? null : index);
  };

  const handleOpenDocumento = (
    sectionIndex: number,
    itemIndex: number,
    documentName: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    const endpoint = endpoints[documentName];
    if (!endpoint) {
      alert(`No hay endpoint definido para ${documentName}`);
      return;
    }
    setSelectedDocumento({ sectionIndex, itemIndex, documentName, endpoint });
  };

  // Al hacer clic en "Ver", guardamos también el índice de la sección e item para luego actualizar el estado
  const handleVerDocumento = (
    sectionIndex: number,
    itemIndex: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    const documento = secciones[sectionIndex].items[itemIndex];
    if (documento.url) {
      const urls = (Array.isArray(documento.url) ? documento.url : [documento.url])
        .map(url => `${url}?timestamp=${new Date().getTime()}`);
      setVerDocumentoInfo({ sectionIndex, itemIndex, urls });
      setVerDocumento(true);
    } else {
      Swal.fire("Sin documento", "No se encontró la URL del documento.", "info");
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
          const _promedioProgreso = Math.round(
            seccion.items.reduce((acc, item) => acc + item.progreso, 0) / (seccion.items.length * 100) * 100
          );
          return (
            <section key={index} className="CreacionVehiculo-seccion" onClick={() => toggleSeccion(index)}>
              <h2 className="CreacionVehiculo-subtitulo">
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
                          <button onClick={(e) => handleOpenDocumento(index, itemIndex, item.nombre, e)}>
                            Cargar
                          </button>
                        ) : (
                          <button className="CreacionVehiculo-btn-ver" onClick={(e) => handleVerDocumento(index, itemIndex, e)}>
                            Ver
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
              newSecciones[selectedDocumento.sectionIndex].items[selectedDocumento.itemIndex].url = result;
              return newSecciones;
            });
            // No cerramos el toggle, lo dejamos abierto.
            setSelectedDocumento(null);
          }}
        />
      )}
      {verDocumentoInfo && verDocumento && (
        <VerDocumento
          urls={verDocumentoInfo.urls}
          onDeleteSuccess={() => {
            setSecciones((prevSecciones) => {
              const newSecciones = [...prevSecciones];
              newSecciones[verDocumentoInfo.sectionIndex].items[verDocumentoInfo.itemIndex].progreso = 0;
              newSecciones[verDocumentoInfo.sectionIndex].items[verDocumentoInfo.itemIndex].url = undefined;
              return newSecciones;
            });
            setVerDocumentoInfo(null);
            setVerDocumento(false);
          }}
          onClose={() => {
            setVerDocumentoInfo(null);
            setVerDocumento(false);
          }}
        />
      )}
    </div>
  );
};

export default CreacionVehiculo;
