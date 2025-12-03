import React, { useState, useEffect, useContext } from 'react';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  FaCar, FaClipboardList, FaFileUpload, FaCheckCircle, 
  FaUserCircle, FaBars, FaEdit, FaTrashAlt, FaWhatsapp, FaEye, FaExclamationTriangle 
} from "react-icons/fa"; 
import logo from "../../Imagenes/albatros.png"; 
import Datos from '../../Componentes/Datos';
import CargaDocumento from '../../Componentes/CargaDocumento';
import VerDocumento from '../../Componentes/VerDocumento';
import { ContextoApp } from "../../Contexto/index";
import { obtenerVehiculoPorPlaca } from '../../Funciones/ObtenerInfoPlaca';
import { endpoints, tiposMapping } from '../../Funciones/documentConstants';
import "./estilos.css";

/* --- CONFIGURACIÓN --- */
const API_BASE = "http://127.0.0.1:8000";
const normalizeKey = (key: string) => key.trim().toLowerCase();

interface DocumentoItem {
  nombre: string;
  progreso: number;
  url?: string | string[];
}
interface SeccionDocumentos {
  subtitulo: string;
  items: DocumentoItem[];
}

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

const getOverallDocumentProgress = (secciones: SeccionDocumentos[]) => {
  let totalItems = 0;
  let completed = 0;
  secciones.forEach(section => {
    totalItems += section.items.length;
    section.items.forEach((item) => {
      if (item.progreso === 100) completed++;
    });
  });
  return totalItems === 0 ? 0 : Math.round((completed / totalItems) * 100);
};

/* --- BARRA SUPERIOR --- */
const BarraConductor: React.FC = () => {
  const navigate = useNavigate();
  const rawUsuario = Cookies.get("conductorUsuario") || "";
  const nombreRealCookie = Cookies.get("conductorNombre");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const obtenerNombreMostrar = () => {
    let nombreCompleto = "";
    
    if (nombreRealCookie) {
        nombreCompleto = decodeURIComponent(nombreRealCookie); 
    } else if (rawUsuario.includes('@')) {
        nombreCompleto = rawUsuario.split('@')[0];
    } else {
        return "CONDUCTOR";
    }

    const primerNombre = nombreCompleto.replace(/[0-9.]/g, ' ').trim().split(/\s+/)[0];
    return primerNombre.toUpperCase();
  };

  const irInicio = () => { navigate("/"); };

  const cerrarSesion = () => {
    Cookies.remove("conductorUsuario");
    Cookies.remove("conductorClave");
    Cookies.remove("conductorId");
    Cookies.remove("conductorNombre");
    navigate("/LoginConductores", { replace: true });
  };

  return (
    <div className="barra-superior" onClick={() => menuAbierto && setMenuAbierto(false)}>
      <div className="barra-izquierda" onClick={irInicio} title="Volver al inicio">
        <img src={logo} alt="Logo" className="barra-logo" />
        <div className="barra-titulos-agrupados">
          <h2 className="barra-titulo">PANEL CONDUCTOR</h2>
          <div className="barra-subtitulos-linea">
            <span className="barra-subtitulo">INTEGR</span>
            <span className="barra-subsubtitulo"> APP</span>
          </div>
        </div>
      </div>
      <div className="barra-derecha">
        <div className="barra-usuario">
            <FaUserCircle size={20} />
            {obtenerNombreMostrar()}
        </div>
        <div className="hamburguesa-container">
          <FaBars size={24} onClick={(e) => { e.stopPropagation(); setMenuAbierto(!menuAbierto); }} />
          {menuAbierto && (
            <div className="menu-desplegable" onClick={(e) => e.stopPropagation()}>
              <button onClick={cerrarSesion} className="btn-cerrar-sesion">Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- COMPONENTE PRINCIPAL --- */
/* --- COMPONENTE PRINCIPAL --- */
const PanelConductoresVista: React.FC = () => {
  const navigate = useNavigate();
  
  const numeroSoporte = "573102084306"; 
  const mensajeSoporte = encodeURIComponent("Hola, necesito ayuda con la plataforma de conductores.");

  const idUsuario = Cookies.get('conductorId') || Cookies.get('tenedorIntegrapp') || '';
  useEffect(() => {
    if (!idUsuario) {
        Swal.fire({
            icon: 'warning', title: 'Acceso Denegado', text: 'Debes iniciar sesión.',
            timer: 2000, showConfirmButton: false
        }).then(() => { navigate("/LoginConductores", { replace: true }); });
    }
  }, [idUsuario, navigate]);

  if (!idUsuario) return null; 

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) throw new Error("Contexto no disponible");
  const { verDocumento, setVerDocumento } = almacenVariables;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [vehicles, setVehicles] = useState<string[]>([]); 
  
  // Estado para manejar los vehículos devueltos (Rechazados)
  const [vehiculosRechazados, setVehiculosRechazados] = useState<any[]>([]);
  // NOTA: Se eliminó historialVehiculos porque ya no se usa en el Paso 4.

  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const [newPlate, setNewPlate] = useState<string>("");
  const [datosValidos, setDatosValidos] = useState<boolean>(false);
  const [cedulaConductor, setCedulaConductor] = useState<string>("");
  const [secciones, setSecciones] = useState<SeccionDocumentos[]>(initialSecciones);
  const [visibleSeccion, setVisibleSeccion] = useState<number | null>(null);
  const [selectedDocumento, setSelectedDocumento] = useState<any>(null);
  const [verDocumentoInfo, setVerDocumentoInfo] = useState<any>(null);

  useEffect(() => { if (idUsuario) cargarDatosIniciales(); }, [idUsuario]);

  const cargarDatosIniciales = async () => {
      await fetchVehiculosPendientes();
      // Ya no cargamos historial porque no se muestra
  };

  const fetchVehiculosPendientes = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehiculos/obtener-vehiculos?id_usuario=${idUsuario}&estadoIntegra=registro_incompleto`);
      if (response.status === 404) { 
          setVehicles([]); 
          setVehiculosRechazados([]);
          return; 
      }
      
      const data = await response.json();
      if (data.vehiculos && Array.isArray(data.vehiculos)) {
        const plates = data.vehiculos.map((veh: any) => veh.placa);
        setVehicles(plates);

        // Filtramos los que tienen observaciones para la lista de rechazados
        const rechazados = data.vehiculos.filter((v: any) => v.observaciones && v.observaciones.trim() !== "");
        setVehiculosRechazados(rechazados);

        if (plates.length > 0 && !selectedPlate) setSelectedPlate(plates[0]);
      } else { 
          setVehicles([]);
          setVehiculosRechazados([]);
      }
    } catch (error) { console.error("Error fetching pendientes", error); }
  };

  const handleCreateVehicle = async () => {
    if (!newPlate.trim()) return Swal.fire("Error", "Ingrese una placa válida", "error");
    try {
      const formData = new FormData();
      formData.append("id_usuario", idUsuario);
      formData.append("placa", newPlate.trim().toUpperCase());
      const response = await fetch(`${API_BASE}/vehiculos/crear`, { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok) {
        Swal.fire("Éxito", "Vehículo creado", "success");
        setVehicles(prev => !prev.includes(data.placa) ? [...prev, data.placa] : prev);
        // fetchHistorialCompleto(); -> Eliminado
        setSelectedPlate(data.placa);
        setNewPlate("");
      } else { Swal.fire("Error", data.detail || "Error al crear", "error"); }
    } catch (error) { Swal.fire("Error", "Error de conexión", "error"); }
  };

  useEffect(() => {
    const cargarInfo = async () => {
      if (!selectedPlate) { setSecciones(initialSecciones); return; }
      try {
        const data = await obtenerVehiculoPorPlaca(selectedPlate);
        if (data && data.data) {
          const vehiculo = data.data;
          setSecciones(prev => prev.map(sec => ({
            ...sec,
            items: sec.items.map(item => {
              const field = tiposMapping[normalizeKey(item.nombre)] || "";
              if (field === "fotos" && Array.isArray(vehiculo.fotos) && vehiculo.fotos.length > 0) {
                 return { ...item, progreso: 100, url: vehiculo.fotos };
              }
              if (field && vehiculo[field]) {
                 return { ...item, progreso: 100, url: vehiculo[field] };
              }
              return { ...item, progreso: 0, url: undefined };
            })
          })));
        }
      } catch (error) { console.error(error); }
    };
    cargarInfo();
  }, [selectedPlate]);

  const changeStep = (step: number) => {
    if (step > 1 && !selectedPlate) {
        Swal.fire("Atención", "Debe seleccionar o crear una placa primero.", "warning");
        return;
    }
    if (step === 3 && currentStep === 2 && !datosValidos) {
       Swal.fire("Formulario Incompleto", "Por favor diligencie todos los campos obligatorios.", "warning");
       return;
    }
    setCurrentStep(step);
  };

  const toggleSeccion = (idx: number) => setVisibleSeccion(visibleSeccion === idx ? null : idx);
  
  const handleOpenDoc = (sIdx: number, iIdx: number, name: string) => {
    const endpoint = endpoints[normalizeKey(name)];
    if(endpoint) setSelectedDocumento({ sectionIndex: sIdx, itemIndex: iIdx, documentName: name, endpoint });
    else Swal.fire("Error", "Configuración de documento no encontrada", "error");
  };

  const eliminarDocumento = (sectionIdx: number, itemIdx: number) => {
     Swal.fire({
        title: '¿Eliminar documento?', text: "Tendrás que cargarlo de nuevo.", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar'
     }).then((result) => {
        if (result.isConfirmed) {
            const newSec = [...secciones];
            newSec[sectionIdx].items[itemIdx].progreso = 0;
            newSec[sectionIdx].items[itemIdx].url = undefined;
            setSecciones(newSec);
            Swal.fire('Borrado', 'El documento ha sido eliminado.', 'success');
        }
     });
  };

  const handleFinalizar = async () => {
     if (!cedulaConductor) return Swal.fire("Error", "No se ha capturado la cédula del conductor.", "error");
     const progreso = getOverallDocumentProgress(secciones);
     if (progreso < 100) return Swal.fire("Incompleto", "Faltan documentos por cargar.", "warning");

     try {
        Swal.fire({ title: 'Enviando...', didOpen: () => Swal.showLoading() });
        const formData = new FormData();
        formData.append("placa", selectedPlate || "");
        formData.append("nuevo_estado", "completado_revision");
        formData.append("usuario_id", idUsuario);

        const response = await fetch(`${API_BASE}/vehiculos/actualizar-estado`, { method: "PUT", body: formData });
        if (!response.ok) throw new Error("Error al actualizar estado");

        Swal.fire("¡Enviado!", "El vehículo ha pasado a revisión.", "success").then(() => {
             const pendientesActualizados = vehicles.filter(v => v !== selectedPlate);
             setVehicles(pendientesActualizados);
             setVehiculosRechazados(prev => prev.filter(v => v.placa !== selectedPlate));
             // fetchHistorialCompleto(); -> Eliminado
             if (pendientesActualizados.length > 0) setSelectedPlate(pendientesActualizados[0]);
             else setSelectedPlate(null);
             setCurrentStep(1);
        });
     } catch (error) {
         console.error(error);
         Swal.fire("Error", "No se pudo finalizar el proceso.", "error");
     }
  };

  const esRechazado = (placa: string | null) => {
    if (!placa) return false;
    return vehiculosRechazados.some(v => v.placa === placa);
  };

  return (
    <div className="bg-conductor">
      <BarraConductor />
      <div className="layout-conductor">
        <div className="sidebar-conductor">
          {/* ARRAY DE PASOS: SOLO 1, 2 Y 3 */}
          {[1, 2, 3].map(step => (
            <button key={step} className={`btn-sidebar-step ${currentStep === step ? "active" : ""}`} onClick={() => changeStep(step)}>
                <div className="step-indicator">{step}</div>
                <span>
                    {step === 1 && "Crear/Seleccionar"}
                    {step === 2 && "Datos Básicos"}
                    {step === 3 && "Documentación"}
                </span>
            </button>
          ))}
        </div>

        <div className="contenido-conductor-container">
          {/* PASO 1 */}
          {currentStep === 1 && (
            <div className="step-content fade-in">
              <div className="step-header">
                <h2><FaCar /> Gestión de Vehículo</h2>
                <p>Crea una nueva placa o continúa con una pendiente.</p>
              </div>
              <div className="panel-creacion">
                <div className="input-group-crear">
                    <input type="text" placeholder="Ej: ABC1234" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} className="input-moderno"/>
                    <button className="btn-moderno-accion" onClick={handleCreateVehicle}>Crear Placa</button>
                </div>
                
                {selectedPlate && !esRechazado(selectedPlate) ? (
                    <div className="seleccion-actual">
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <small style={{color:'#666'}}>Vehículo pendiente actual:</small>
                            <strong style={{fontSize: '1.2rem', color: '#1565c0'}}>{selectedPlate}</strong>
                        </div>
                        <button className="btn-continuar" onClick={() => changeStep(2)}>Continuar &rarr;</button>
                    </div>
                ) : (
                    !esRechazado(selectedPlate) && (
                        <div style={{marginTop: '30px', textAlign: 'center', color: '#999', padding: '20px', border: '2px dashed #eee', borderRadius: '10px'}}>
                            {vehicles.length === 0 ? <p>¡Todo al día! No tienes vehículos pendientes.</p> : <p>Seleccione un vehículo.</p>}
                        </div>
                    )
                )}

                {/* SECCIÓN DE VEHÍCULOS RECHAZADOS */}
                {vehiculosRechazados.length > 0 && (
                    <div className="seccion-rechazados">
                        <h3 className="titulo-rechazados"><FaExclamationTriangle /> Vehículos Devueltos / Rechazados</h3>
                        <div className="lista-rechazados">
                            {vehiculosRechazados.map((veh, idx) => (
                                <div key={idx} className="card-rechazado">
                                    <div className="info-rechazado">
                                        <div className="placa-rechazada-header">
                                            <strong>{veh.placa}</strong>
                                        </div>
                                        <p className="observacion-texto">"{veh.observaciones}"</p>
                                    </div>
                                    <button 
                                        className="btn-corregir" 
                                        onClick={() => {
                                            setSelectedPlate(veh.placa);
                                            // Redirige al Paso 3 (Documentación)
                                            changeStep(3); 
                                        }}
                                    >
                                        <FaEdit /> Corregir
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {currentStep === 2 && (
            <div className="step-content fade-in">
               <div className="step-header">
                <h2><FaClipboardList /> Información Detallada</h2>
                <p>Diligencia el formulario para la placa <strong>{selectedPlate}</strong>.</p>
              </div>
              {selectedPlate ? (
                <div className="contenedor-formulario-fijo">
                    <Datos placa={selectedPlate} onValidChange={setDatosValidos} onCedulaConductorChange={setCedulaConductor}/>
                </div>
              ) : ( <div className="alert-box">Seleccione un vehículo en el Paso 1.</div> )}
            </div>
          )}

          {/* PASO 3 */}
          {currentStep === 3 && (
            <div className="step-content fade-in">
               <div className="step-header">
                <h2><FaFileUpload /> Carga de Documentos</h2>
                <div className="progreso-header">
                    <span>Avance: {getOverallDocumentProgress(secciones)}%</span>
                    <div className="barra-progreso-bg">
                        <div className="barra-progreso-fill" style={{width: `${getOverallDocumentProgress(secciones)}%`}}></div>
                    </div>
                </div>
              </div>
              {selectedPlate ? (
                <div className="lista-documentos-container">
                    {secciones.map((seccion, idx) => (
                        <div key={idx} className="seccion-doc-card">
                            <div className="seccion-header" onClick={() => toggleSeccion(idx)}>
                                <h4>{seccion.subtitulo}</h4>
                                <span>{visibleSeccion === idx ? "▼" : "▶"}</span>
                            </div>
                            {visibleSeccion === idx && (
                                <div className="seccion-body">
                                    {seccion.items.map((item, iIdx) => (
                                        <div key={iIdx} className="doc-item-row">
                                            <span className="doc-name">{item.progreso === 100 && <FaCheckCircle className="text-success"/>} {item.nombre}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {item.progreso < 100 ? (
                                                    <button 
                                                        className="btn-doc-action upload"
                                                        onClick={() => handleOpenDoc(idx, iIdx, item.nombre)}
                                                    >
                                                        Cargar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button 
                                                            className="btn-doc-action view"
                                                            title="Ver documento"
                                                            onClick={() => {
                                                                const urlsParaVer = Array.isArray(item.url) ? item.url : [item.url as string];
                                                                setVerDocumentoInfo({ sectionIndex: idx, itemIndex: iIdx, urls: urlsParaVer });
                                                                setVerDocumento(true);
                                                            }}
                                                        >
                                                            <FaEye /> Ver
                                                        </button>
                                                        <button 
                                                            className="btn-doc-action delete"
                                                            title="Eliminar documento"
                                                            onClick={() => eliminarDocumento(idx, iIdx)}
                                                        >
                                                            <FaTrashAlt />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <button className="btn-finalizar" onClick={handleFinalizar}>Finalizar Registro</button>
                </div>
              ) : ( <div className="alert-box">Seleccione un vehículo en el Paso 1.</div> )}
            </div>
          )}

        </div>
      </div>

      {/* BOTÓN WHATSAPP FLOTANTE USANDO CLASE CSS */}
      <a 
        href={`https://wa.me/${numeroSoporte}?text=${mensajeSoporte}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp-flotante"
      >
        <FaWhatsapp size={26} />
        Chat Soporte
      </a>

      {/* MODALES */}
      {selectedDocumento && selectedPlate && (
        <CargaDocumento
          documentName={selectedDocumento.documentName}
          endpoint={selectedDocumento.endpoint}
          placa={selectedPlate}
          onClose={() => setSelectedDocumento(null)}
          onUploadSuccess={(result: string | string[]) => {
             const newSec = [...secciones];
             newSec[selectedDocumento.sectionIndex].items[selectedDocumento.itemIndex].progreso = 100;
             newSec[selectedDocumento.sectionIndex].items[selectedDocumento.itemIndex].url = result;
             setSecciones(newSec);
             setSelectedDocumento(null);
          }}
        />
      )}
      {verDocumentoInfo && verDocumento && (
         <VerDocumento 
            urls={verDocumentoInfo.urls} 
            placa={selectedPlate || ""} 
            onClose={() => { setVerDocumentoInfo(null); setVerDocumento(false); }}
            onDeleteSuccess={() => { /* Lógica refresh */ }}
         />
      )}
    </div>
  );
};

export default PanelConductoresVista;