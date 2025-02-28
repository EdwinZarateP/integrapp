import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaTruck } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { FaUserTie } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import CargaDocumento from '../CargaDocumento';
import VerDocumento from '../VerDocumento';
import { ContextoApp } from "../../Contexto/index";
import { obtenerVehiculoPorPlaca } from '../../Funciones/ObtenerInfoPlaca';
import { endpoints, tiposMapping } from '../../Funciones/documentConstants';
import Cookies from 'js-cookie';
import './estilos.css';

interface DocumentoItem {
  nombre: string;
  progreso: number; // 0 si no está cargado, 100 si está cargado
  url?: string | string[];
}

interface SeccionDocumentos {
  subtitulo: string;
  items: DocumentoItem[];
}

interface VerDocumentoInfo {
  sectionIndex: number;
  itemIndex: number;
  urls: string[];
}

const initialSecciones: SeccionDocumentos[] = [
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
];

const CreacionVehiculo: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }
  const { verDocumento, setVerDocumento } = almacenVariables;

  // Obtenemos el idUsuario desde las cookies
  const idUsuario = Cookies.get('tenedorIntegrapp');

  // Estados para la creación y selección de vehículos
  const [newPlate, setNewPlate] = useState<string>("");
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);

  // Estados para el manejo de documentos
  const [secciones, setSecciones] = useState<SeccionDocumentos[]>(initialSecciones);
  const [visibleSeccion, setVisibleSeccion] = useState<number | null>(null);
  const [selectedDocumento, setSelectedDocumento] = useState<{
    sectionIndex: number;
    itemIndex: number;
    documentName: string;
    endpoint: string;
  } | null>(null);
  const [verDocumentoInfo, setVerDocumentoInfo] = useState<VerDocumentoInfo | null>(null);

  // Función para crear un vehículo (POST a /vehiculos/crear)
  const handleCreateVehicle = async () => {
    if (!newPlate.trim()) {
      Swal.fire("Error", "Ingrese una placa válida", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id_usuario", idUsuario || "");
      const plateUpper = newPlate.trim().toUpperCase();
      formData.append("placa", plateUpper);
      const response = await fetch("https://integrappi-dvmh.onrender.com/vehiculos/crear", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        Swal.fire("Éxito", "Vehículo creado exitosamente", "success");
        setVehicles(prev => {
          if (!prev.includes(plateUpper)) return [...prev, plateUpper];
          return prev;
        });
        setSelectedPlate(plateUpper);
        setNewPlate("");
      } else {
        const data = await response.json();
        Swal.fire("Error", data.detail || "Error al crear vehículo", "error");
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", "Error en la conexión", "error");
    }
  };

  // Función para obtener los vehículos creados para el usuario
  const fetchVehicles = async () => {
    if (!idUsuario) return;
    try {
      const response = await fetch(`https://integrappi-dvmh.onrender.com/vehiculos/obtener-vehiculos?id_usuario=${idUsuario}`);
      if (response.ok) {
        const data = await response.json();
        if (data.vehicles && Array.isArray(data.vehicles)) {
          const plates = data.vehicles.map((veh: any) => veh.placa);
          setVehicles(plates);
          if (plates.length > 0 && !selectedPlate) {
            setSelectedPlate(plates[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
    }
  };

  // Al cargar el componente, verificamos si ya existen vehículos para el usuario
  useEffect(() => {
    fetchVehicles();
  }, [idUsuario]);

  // Cada vez que se cambia la placa seleccionada, se carga la información del vehículo
  useEffect(() => {
    const cargarVehiculo = async () => {
      if (!selectedPlate) {
        setSecciones(initialSecciones); // Resetear secciones si no hay placa seleccionada
        return;
      }
      try {
        const data = await obtenerVehiculoPorPlaca(selectedPlate);
        if (data && data.data) {
          const vehiculo = data.data;
          setSecciones(prevSecciones =>
            prevSecciones.map(seccion => ({
              ...seccion,
              items: seccion.items.map(item => {
                const field = tiposMapping[item.nombre.toLowerCase()] || "";
                if (field) {
                  if (field === "fotos") {
                    if (Array.isArray(vehiculo[field]) && vehiculo[field].length > 0) {
                      return {
                        ...item,
                        progreso: 100,
                        url: vehiculo[field],
                      };
                    } else {
                      return { ...item, progreso: 0, url: undefined };
                    }
                  } else if (vehiculo[field]) {
                    return {
                      ...item,
                      progreso: 100,
                      url: vehiculo[field],
                    };
                  }
                }
                return { ...item, progreso: 0, url: undefined };
              }),
            }))
          );
        } else {
          setSecciones(initialSecciones);
        }
      } catch (error) {
        console.error("Error al cargar el vehículo:", error);
        setSecciones(initialSecciones);
      }
    };
    cargarVehiculo();
  }, [selectedPlate]);

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
        <h1>Registrar Vehículos</h1>
      </div>

      {/* Sección para crear un vehículo nuevo */}
      <div className="CreacionVehiculo-crear">
        <input
          type="text"
          placeholder="Ingrese placa (ej. ABC123)"
          value={newPlate}
          onChange={(e) => setNewPlate(e.target.value)}
        />
        <button onClick={handleCreateVehicle}>Crear Vehículo</button>
      </div>

      {/* Dropdown para seleccionar un vehículo creado */}
      {vehicles.length > 0 && (
        <div className="CreacionVehiculo-seleccion">
          <label>Vehículo:</label>
          <select
            value={selectedPlate || ""}
            onChange={(e) => setSelectedPlate(e.target.value)}
          >
            <option value="" disabled>
              Seleccione una placa
            </option>
            {vehicles.map((plate, idx) => (
              <option key={idx} value={plate}>
                {plate}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Interfaz de edición de documentos, visible si hay vehículo seleccionado */}
      {selectedPlate && (
        <>
          <div className="CreacionVehiculo-contenedor">
            {secciones.map((seccion, index) => {
              const _promedioProgreso = Math.round(
                seccion.items.reduce((acc, item) => acc + item.progreso, 0) /
                  (seccion.items.length * 100) *
                  100
              );
              return (
                <section
                  key={index}
                  className="CreacionVehiculo-seccion"
                  onClick={() => toggleSeccion(index)}
                >
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
                      {index === 0 && <FaTruck size={50} />}
                      {index === 1 && <FaUser size={50} />}
                      {index === 2 && <FaUserTie size={50} />}
                      {index === 3 && <FcBusinessman size={50} />}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          <div className="CreacionVehiculo-botonFinal" onClick={enviarVehiculo}>
            Crear Vehículo
          </div>
        </>
      )}

      {selectedDocumento && (
        <CargaDocumento
          documentName={selectedDocumento.documentName}
          endpoint={selectedDocumento.endpoint}
          placa={selectedPlate as string}
          onClose={() => setSelectedDocumento(null)}
          onUploadSuccess={(result: string | string[]) => {
            console.log("Documento subido:", result);
            setSecciones((prevSecciones) => {
              const newSecciones = [...prevSecciones];
              newSecciones[selectedDocumento.sectionIndex].items[selectedDocumento.itemIndex].progreso = 100;
              newSecciones[selectedDocumento.sectionIndex].items[selectedDocumento.itemIndex].url = result;
              return newSecciones;
            });
            setSelectedDocumento(null);
          }}
        />
      )}

      {verDocumentoInfo && verDocumento && (
        <VerDocumento
          urls={verDocumentoInfo.urls}
          placa={selectedPlate as string}
          onDeleteSuccess={(nuevasUrls) => {
            setSecciones((prevSecciones) => {
              const newSecciones = [...prevSecciones];
              const itemRef = newSecciones[verDocumentoInfo.sectionIndex].items[verDocumentoInfo.itemIndex];
              if (nuevasUrls.length === 0) {
                itemRef.progreso = 0;
                itemRef.url = undefined;
              } else {
                itemRef.progreso = 100;
                itemRef.url = nuevasUrls;
              }
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
