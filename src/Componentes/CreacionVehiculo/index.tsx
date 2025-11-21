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


import './estilos.css';

// Interfaces para documentos y secciones
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

// Función para normalizar nombres de campos
const normalizeKey = (key: string) => key.trim().toLowerCase();

// Definición inicial de secciones para los documentos
const initialSecciones: SeccionDocumentos[] = [
  {
    subtitulo: "1. Documentos del Vehículo",
    items: [
      { nombre: "Tarjeta de Propiedad", progreso: 0 },
      { nombre: "soat", progreso: 0 },
      { nombre: "Revisión Tecnomecánica", progreso: 0 },
      { nombre: "Tarjeta de Remolque", progreso: 0 },
      { nombre: "Fotos", progreso: 0 },
      { nombre: "Póliza de Responsabilidad Civil", progreso: 0 },
    ]
  },
  {
    subtitulo: "2. Documentos del Conductor",
    items: [
      { nombre: "Documento de Identidad del Conductor", progreso: 0 },
      { nombre: "Licencia de Conducción Vigente", progreso: 0 },
      { nombre: "Planilla de EPS y ARL", progreso: 0 },
      { nombre: "Foto Conductor", progreso: 0 },
      { nombre: "Certificación Bancaria Conductor", progreso: 0 },
    ]
  },
  {
    subtitulo: "3. Documentos del Tenedor",
    items: [
      { nombre: "Documento de Identidad del Tenedor", progreso: 0 },
      { nombre: "Certificación Bancaria Tenedor", progreso: 0 },
      { nombre: "Documento que lo acredite como Tenedor", progreso: 0 },
      { nombre: "RUT Tenedor", progreso: 0 }
    ]
  },
  {
    subtitulo: "4. Documentos del Propietario",
    items: [
      { nombre: "Documento de Identidad del Propietario", progreso: 0 },
      { nombre: "Certificación Bancaria Propietario", progreso: 0 },
      { nombre: "RUT Propietario", progreso: 0 }
    ]
  }
];

// Función para calcular el avance global de documentos
const getOverallDocumentProgress = (secciones: SeccionDocumentos[]) => {
  let totalItems = 0;
  let completed = 0;
  secciones.forEach(section => {
    totalItems += section.items.length;
    section.items.forEach(item => {
      if (item.progreso === 100) {
        completed++;
      }
    });
  });
  return totalItems === 0 ? 0 : Math.round((completed / totalItems) * 100);
};

const CreacionVehiculo: React.FC = () => {
  /***********************
   * Contexto y cookies
   ***********************/
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Envuelve este componente en un proveedor de contexto.");
  }
  const { verDocumento, setVerDocumento } = almacenVariables;
  const idUsuario = Cookies.get('tenedorIntegrapp') || '';

  /***********************
   * Estados para el paso actual y para la gestión del vehículo
   ***********************/
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [newPlate, setNewPlate] = useState<string>("");
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const [cedulaConductor, setCedulaConductor] = useState<string>("");

  /***********************
   * Estado para controlar la validez del formulario (Paso 2)
   ***********************/
  const [datosValidos, setDatosValidos] = useState<boolean>(false);

  /***********************
   * Estados para la carga y gestión de documentos (Pasos 2 y 3)
   ***********************/
  const [secciones, setSecciones] = useState<SeccionDocumentos[]>(initialSecciones);
  const [visibleSeccion, setVisibleSeccion] = useState<number | null>(null);
  const [selectedDocumento, setSelectedDocumento] = useState<{
    sectionIndex: number;
    itemIndex: number;
    documentName: string;
    endpoint: string;
  } | null>(null);
  const [verDocumentoInfo, setVerDocumentoInfo] = useState<VerDocumentoInfo | null>(null);

  /***********************
   * Lógica para crear y seleccionar vehículo (Paso 1)
   ***********************/
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
        `https://integrappi-dvmh.onrender.com/vehiculos/obtener-vehiculos?id_usuario=${idUsuario}&estadoIntegra=creado`
      );

      if (response.status === 404) {
        setVehicles([]);
        setSelectedPlate(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      console.log('Respuesta backend:', data);

      // OJO: aquí va data.vehiculos
      if (data.vehiculos && Array.isArray(data.vehiculos)) {
        const plates = data.vehiculos.map((veh: any) => veh.placa);
        setVehicles(plates);

        if (plates.length > 0 && !selectedPlate) {
          setSelectedPlate(plates[0]);
        } else if (plates.length === 0) {
          setSelectedPlate(null);
        }
      } else {
        setVehicles([]);
        setSelectedPlate(null);
      }
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
    }
  };



  useEffect(() => {
    fetchVehicles();
  }, []);

  /***********************
   * Lógica para obtener documentos al seleccionar una placa
   ***********************/
  useEffect(() => {
    const cargarVehiculo = async () => {
      if (!selectedPlate) {
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
                const field = tiposMapping[normalizeKey(item.nombre)] || "";
                if (field) {
                  if (field === "fotos") {
                    return {
                      ...item,
                      progreso: Array.isArray(vehiculo[field]) && vehiculo[field].length > 0 ? 100 : 0,
                      url: vehiculo[field] || undefined
                    };
                  } else if (vehiculo[field]) {
                    return { ...item, progreso: 100, url: vehiculo[field] };
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

  /***********************
   * Funciones para navegar entre pasos
   ***********************/
  const goToNextStep = () => {
    if (currentStep === 1 && (!selectedPlate || selectedPlate.trim() === "")) {
      Swal.fire("Atención", "Debe crear o seleccionar un vehículo primero.", "warning");
      return;
    }
    if (currentStep === 2 && !datosValidos) {
      Swal.fire("Atención", "Debe diligenciar todos los campos del formulario.", "warning");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /***********************
   * Lógica para la carga y visualización de documentos
   ***********************/
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
    const normalizedKey = normalizeKey(documentName);
    const endpoint = endpoints[normalizedKey];

    if (!endpoint) {
      Swal.fire("Error", `No hay endpoint definido para ${documentName}`, "error");
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

const enviarVehiculo = async () => {
  try {
    if (!cedulaConductor) {
      Swal.fire(
        "Error",
        "No se encontró la cédula del conductor. Verifique el Paso 2.",
        "error"
      );
      return;
    }

    // 1. VALIDAR PROGRESO
    const progreso = getOverallDocumentProgress(secciones);
    if (progreso < 100) {
      Swal.fire(
        "Documentos incompletos",
        "Aún faltan documentos por cargar.",
        "warning"
      );
      return; // detiene el flujo si faltan documentos
    }

    // 2. VERIFICAR BIOMETRÍA
    const verificarBiometria = async (documento: string): Promise<boolean> => {
      try {
        const respuesta = await fetch(
          "https://integrappi-dvmh.onrender.com/verificacion/verificar",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Si tu backend espera "tenedor", aquí le mandas la cédula del conductor
            body: JSON.stringify({ tenedor: documento }),
          }
        );

        const data = await respuesta.json();

        if (!data.existe) {
          Swal.fire(
            "Pendientes Huellas Digitales",
            "El CONDUCTOR no ha registrado las huellas digitales, por favor acercarse a uno de los CEDIS para proceder.",
            "info"
          );
          return false;
        }

        if (!data.data.imagen_url || data.data.imagen_url.length === 0) {
          Swal.fire(
            "Advertencia",
            "⚠ El conductor existe pero NO tiene huellas registradas.",
            "warning"
          );
          return false;
        }

        return true; // ✅ Conductor tiene huellas
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Error al verificar biometría del conductor", "error");
        return false;
      }
    };

    const tieneBiometria = await verificarBiometria(cedulaConductor);
    if (!tieneBiometria) return; // detiene flujo si no tiene biometría


    // 3. ACTUALIZAR ESTADO A REVISIÓN
    const formData = new FormData();
    formData.append("placa", selectedPlate ?? "");
    formData.append("nuevo_estado", "revision");
    formData.append("usuario_id", idUsuario);

    const response = await fetch(
      "https://integrappi-dvmh.onrender.com/vehiculos/actualizar-estado",
      {
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error backend:", errorText);
      Swal.fire(
        "Error",
        "Hubo un problema al pasar el vehículo a revisión.",
        "error"
      );
      return;
    }

    // 4. ÉXITO
    Swal.fire(
      "Vehículo en revisión",
      "El usuario tiene biometría registrada y el vehículo fue enviado a revisión correctamente.",
      "success"
    );

  } catch (error) {
    console.error("Error en enviarVehiculo:", error);
    Swal.fire("Error", "Ocurrió un problema inesperado.", "error");
  }
};


  /***********************
   * Render principal del componente
   ***********************/
  return (
    <div className="CreacionVehiculo-contenedor-principal">
      {/* Barra de pasos */}
      <div className="CreacionVehiculo-Pasos-contenedor">
        <div className={`CreacionVehiculo-Paso-item ${currentStep === 1 ? 'activo' : ''}`}
          onClick={() => setCurrentStep(1)}>
          Paso 1
        </div>
        <div className={`CreacionVehiculo-Paso-item ${currentStep === 2 ? 'activo' : ''}`}
          onClick={() => {
            if (selectedPlate) {
              setCurrentStep(2);
            } else {
              Swal.fire("Atención", "Debe crear o seleccionar un vehículo antes de avanzar.", "warning");
            }
          }}>
          Paso 2
        </div>
        <div className={`CreacionVehiculo-Paso-item ${currentStep === 3 ? 'activo' : ''} ${!datosValidos ? 'deshabilitado' : ''}`}
          onClick={() => {
            if (!datosValidos) {
              Swal.fire("Atención", "Debe diligenciar todos los campos del formulario del Paso 2 para continuar.", "warning");
              return;
            }
            if (selectedPlate) {
              setCurrentStep(3);
            } else {
              Swal.fire("Atención", "Debe crear o seleccionar un vehículo antes de avanzar.", "warning");
            }
          }}>
          Paso 3
        </div>
      </div>

      {/* Contenido según el paso seleccionado */}
      {currentStep === 1 && (
        <div className="CreacionVehiculo-Paso-contenido">
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
          <button className="CreacionVehiculo-Boton-siguiente" onClick={goToNextStep}>
            Siguiente
          </button>
        </div>
      )}

      {currentStep === 2 && selectedPlate && (
        <div className="CreacionVehiculo-Paso-contenido">
          <h3>Diligencia datos para {selectedPlate}</h3>
          <Datos
            placa={selectedPlate}
            onValidChange={setDatosValidos}
            onCedulaConductorChange={setCedulaConductor} // 👈 aquí sube la cédula
          />

          <div className="CreacionVehiculo-Botones-navegacion">
            <button onClick={goToPrevStep}>Atrás</button>
            <button onClick={goToNextStep} disabled={!datosValidos}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && selectedPlate && (
        <div className="CreacionVehiculo-Paso-contenido">
          <h3>Carga de Documentos para {selectedPlate}</h3>
          {/* Barra de avance de documentos sticky en la parte superior */}
          <div className="CreacionVehiculo-avance-container">
            <span className="CreacionVehiculo-avance-texto">
              Carga Documentos: {getOverallDocumentProgress(secciones)}%
            </span>
            <div className="CreacionVehiculo-barra-avance">
              <div
                className="CreacionVehiculo-barra-progreso"
                style={{ width: `${getOverallDocumentProgress(secciones)}%` }}
              />
            </div>
          </div>
          <div className="CreacionVehiculo-contenedor">
            {secciones.map((seccion, index) => {
              const _promedioProgreso = Math.round(
                (seccion.items.reduce((acc, item) => acc + item.progreso, 0) /
                  (seccion.items.length * 100)) * 100
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
                      {index === 0 && <FaTruck size={50} />}
                      {index === 1 && <FaUser size={50} />}
                      {index === 2 && <FaUserTie size={50} />}
                      {index === 3 && <FcBusinessman size={50} />}
                    </div>
                  )}
                </section>
              );
            })}
          <div className="CreacionVehiculo-Botones-navegacion">
          <button onClick={goToPrevStep}>Atrás</button>
          <button onClick={enviarVehiculo}>
           Finalizar Registro
         </button>
         </div>
          </div>
        </div>
      )}

      {/* Modal de carga de documentos */}
      {selectedDocumento && selectedPlate && (
        <CargaDocumento
          documentName={selectedDocumento.documentName}
          endpoint={selectedDocumento.endpoint}
          placa={selectedPlate}
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

      {/* Modal para ver documentos */}
      {verDocumentoInfo && verDocumento && (
        <VerDocumento
          urls={verDocumentoInfo.urls}
          placa={selectedPlate as string}
          onDeleteSuccess={(nuevasUrls) => {
            setSecciones((prevSecciones) => {
              const newSecciones = [...prevSecciones];
              const itemRef = newSecciones[verDocumentoInfo.sectionIndex].items[verDocumentoInfo.itemIndex];
              if (!nuevasUrls || nuevasUrls.length === 0) {
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
