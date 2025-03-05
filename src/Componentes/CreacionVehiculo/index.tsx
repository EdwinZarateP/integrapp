import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaTruck } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { FaUserTie } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import Cookies from 'js-cookie';
import Datos from '../Datos/index';
import CargaDocumento from '../CargaDocumento';
import VerDocumento from '../VerDocumento';
import { ContextoApp } from "../../Contexto/index";
import { obtenerVehiculoPorPlaca } from '../../Funciones/ObtenerInfoPlaca';
import { endpoints, tiposMapping } from '../../Funciones/documentConstants';

import './estilos.css'; // Usa el mismo CSS base, o sepáralo en tabsSteps.css, etc.

// Interfaces
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
  // Obtenemos variables de contexto
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Envuelve este componente en un proveedor de contexto.");
  }
  const { verDocumento, setVerDocumento } = almacenVariables;

  // Recoge el idUsuario de las cookies
  const idUsuario = Cookies.get('tenedorIntegrapp') || '';

  // States para manejar el paso actual (1 o 2)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // States de creación/selec. de vehículo (Paso 1)
  const [newPlate, setNewPlate] = useState<string>("");
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);

  // States de documentos (Paso 2)
  const [secciones, setSecciones] = useState<SeccionDocumentos[]>(initialSecciones);
  const [visibleSeccion, setVisibleSeccion] = useState<number | null>(null);
  const [selectedDocumento, setSelectedDocumento] = useState<{
    sectionIndex: number;
    itemIndex: number;
    documentName: string;
    endpoint: string;
  } | null>(null);
  const [verDocumentoInfo, setVerDocumentoInfo] = useState<VerDocumentoInfo | null>(null);

  // ========= LÓGICA PARA CREAR/SELECCIONAR VEHÍCULO ==========

  const handleCreateVehicle = async () => {
    if (!newPlate.trim()) {
      Swal.fire("Error", "Ingrese una placa válida", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id_usuario", idUsuario);
      const plateUpper = newPlate.trim().toUpperCase();
      formData.append("placa", plateUpper);

      const response = await fetch("https://integrappi-dvmh.onrender.com/vehiculos/crear", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        Swal.fire("Éxito", "Vehículo creado exitosamente", "success");
        setVehicles((prev) => {
          if (!prev.includes(plateUpper)) return [...prev, plateUpper];
          return prev;
        });
        setSelectedPlate(plateUpper);
        setNewPlate("");
      } else if (data.detail === "La placa ya está registrada.") {
        Swal.fire("Advertencia", "Esta placa ya está registrada. Intente con otra.", "warning");
      } else {
        Swal.fire("Error", data.detail || "Error al crear vehículo", "error");
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", "Error en la conexión", "error");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        `https://integrappi-dvmh.onrender.com/vehiculos/obtener-vehiculos?id_usuario=${idUsuario}`
      );
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

  // Cargar la lista de vehículos al montar el componente
  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, []);

  // ========== LÓGICA PARA OBTENER DOCUMENTOS (CUANDO SE SELECCIONA PLACA) ==========

  useEffect(() => {
    const cargarVehiculo = async () => {
      if (!selectedPlate) {
        // Si no hay placa seleccionada, resetear la estructura de secciones
        setSecciones(initialSecciones);
        return;
      }
      try {
        const data = await obtenerVehiculoPorPlaca(selectedPlate);
        if (data && data.data) {
          const vehiculo = data.data;
          setSecciones((prevSecciones) =>
            prevSecciones.map((seccion) => ({
              ...seccion,
              items: seccion.items.map((item) => {
                const field = tiposMapping[item.nombre.toLowerCase()] || "";
                if (field) {
                  if (field === "fotos") {
                    // Manejo de fotos (array)
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
                    // El campo existe y contiene una URL
                    return {
                      ...item,
                      progreso: 100,
                      url: vehiculo[field],
                    };
                  }
                }
                // Por defecto, sin datos
                return { ...item, progreso: 0, url: undefined };
              }),
            }))
          );
        } else {
          // Si no hay datos del vehículo, resetear secciones
          setSecciones(initialSecciones);
        }
      } catch (error) {
        console.error("Error al cargar el vehículo:", error);
        setSecciones(initialSecciones);
      }
    };
    cargarVehiculo();
  }, [selectedPlate]);

  // ========== LÓGICA DE STEPS (PASOS) ==========

  const goToNextStep = () => {
    // Validar solamente si se está en el paso 1 y no hay placa seleccionada
    if (currentStep === 1 && !selectedPlate) {
      Swal.fire("Atención", "Debe crear o seleccionar un vehículo primero.", "warning");
      return;
    }
  
    // Si estamos en step 1 y ya hay placa, avanza a step 2
    // Si estamos en step 2, avanza a step 3
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    // Retrocede un paso mientras no estemos en el 1
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };  

  // ========== LÓGICA PARA LA CARGA Y VISUALIZACIÓN DE DOCUMENTOS ==========

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
      const urls = (Array.isArray(documento.url) ? documento.url : [documento.url]).map(
        (url) => `${url}?timestamp=${new Date().getTime()}`
      );
      setVerDocumentoInfo({ sectionIndex, itemIndex, urls });
      setVerDocumento(true);
    } else {
      Swal.fire("Sin documento", "No se encontró la URL del documento.", "info");
    }
  };

  const enviarVehiculo = () => {
    // Aquí iría la lógica final para enviar o guardar
    Swal.fire({
      title: "🚧 En construcción",
      text: "Estamos trabajando en construir este botón",
      icon: "info",
      confirmButtonText: "Ok",
    });
  };

  // ========== RENDER PRINCIPAL ==========

  return (
    <div className="CreacionVehiculo-contenedor-principal">

      {/* Pestañas o Barra de pasos */}
      <div className="Pasos-contenedor">
        <div
          className={`Paso-item ${currentStep === 1 ? 'activo' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          Paso 1
        </div>
        <div
          className={`Paso-item ${currentStep === 2 ? 'activo' : ''}`}
          onClick={() => {
            if (selectedPlate) {
              setCurrentStep(2);
            } else {
              Swal.fire("Atención", "Debe crear o seleccionar un vehículo antes de avanzar.", "warning");
            }
          }}
        >
          Paso 2
        </div>
        <div
          className={`Paso-item ${currentStep === 3 ? 'activo' : ''}`}
          onClick={() => {
            if (selectedPlate) {
              setCurrentStep(3);
            } else {
              Swal.fire("Atención", "Debe crear o seleccionar un vehículo antes de avanzar.", "warning");
            }
          }}
        >
          Paso 3
        </div>
      </div>

      {/* Contenido paso 1: Crear o seleccionar vehículo */}
      {currentStep === 1 && (
        <div className="Paso-contenido">
          <h3>Crear o Seleccionar una placa</h3>
          <div className="CreacionVehiculo-crear">
            <input
              type="text"
              placeholder="Ingrese placa (ej. ABC123)"
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value)}
            />
            <button onClick={handleCreateVehicle}>Crear placa</button>
          </div>

          {vehicles.length > 0 && (
            <div className="CreacionVehiculo-seleccion">
              <label>Placa:</label>
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

          <button className="Boton-siguiente" onClick={goToNextStep}>
            Siguiente
          </button>
        </div>
      )}

       {/* Contenido paso 2: llenar formulario */}
       {currentStep === 2 && (
      <div className="Paso-contenido">
      {/* === FORMULARIO COMPLETO === */}
        <Datos />
        <button className="Boton-siguiente" onClick={goToNextStep}>
          Siguiente
        </button>
    </div>
  )}


      {/* Contenido paso 3: Carga de documentos */}
      {currentStep === 3 && selectedPlate && (
        <div className="Paso-contenido">
          <h2>3. Carga de Documentos para {selectedPlate}</h2>
          <div className="CreacionVehiculo-contenedor">
            {secciones.map((seccion, index) => {
              const _promedioProgreso = Math.round(
                (seccion.items.reduce((acc, item) => acc + item.progreso, 0) /
                  (seccion.items.length * 100)) *
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
                    <span
                      className={`CreacionVehiculo-flecha ${
                        visibleSeccion === index ? "abierta" : ""
                      }`}
                    >
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
                              <button
                                onClick={(e) =>
                                  handleOpenDocumento(
                                    index,
                                    itemIndex,
                                    item.nombre,
                                    e
                                  )
                                }
                              >
                                Cargar
                              </button>
                            ) : (
                              <button
                                className="CreacionVehiculo-btn-ver"
                                onClick={(e) => handleVerDocumento(index, itemIndex, e)}
                              >
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

          <div className="Botones-navegacion">
            <button onClick={goToPrevStep}>Atrás</button>
            <button onClick={enviarVehiculo}>Finalizar Registro</button>
          </div>
        </div>
      )}

      {/* Modal de carga de documentos */}
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
              newSecciones[selectedDocumento.sectionIndex].items[
                selectedDocumento.itemIndex
              ].progreso = 100;
              newSecciones[selectedDocumento.sectionIndex].items[
                selectedDocumento.itemIndex
              ].url = result;
              return newSecciones;
            });
            setSelectedDocumento(null);
          }}
        />
      )}

      {/* Modal para ver documentos */}
      {verDocumentoInfo && verDocumento && (
        <VerDocumento
          urls={verDocumentoInfo.urls}
          placa={selectedPlate as string}
          onDeleteSuccess={(nuevasUrls) => {
            setSecciones((prevSecciones) => {
              const newSecciones = [...prevSecciones];
              const itemRef =
                newSecciones[verDocumentoInfo.sectionIndex].items[
                  verDocumentoInfo.itemIndex
                ];
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
