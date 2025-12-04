import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSearch, FaTimes } from "react-icons/fa"; 

/* Componentes y Estilos */
import BarraSuperiorSeguridad from "../../Componentes/Barra";
import "./estilos.css";

/* -------------------------------------------------------------------------- */
/* CONFIGURACIÓN DE LA API                                                    */
/* -------------------------------------------------------------------------- */
const API_BASE = "http://127.0.0.1:8000";

/* -------------------------------------------------------------------------- */
/* INTERFACES Y TIPOS                                                         */
/* -------------------------------------------------------------------------- */

export interface Vehiculo {
  _id: string;
  placa: string;
  estadoIntegra: string;
  idUsuario: string;
  estudioSeguridad?: string;
  observaciones?: string;
  condNombres?: string;
  condPrimerApellido?: string;
  condSegundoApellido?: string;
  condCedulaCiudadania?: string;
  [key: string]: any;
}

type Vista = "registro_incompleto" | "completado_revision" | "aprobados";

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                                                       */
/* -------------------------------------------------------------------------- */

const RevisionVehiculos: React.FC = () => {
  const navigate = useNavigate();

  /* --- Estados de Datos --- */
  const [vehiculosIncompletos, setVehiculosIncompletos] = useState<Vehiculo[]>([]);
  const [vehiculosCompletados, setVehiculosCompletados] = useState<Vehiculo[]>([]);
  const [vehiculosAprobados, setVehiculosAprobados] = useState<Vehiculo[]>([]);

  /* --- Estados de Interfaz --- */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>("registro_incompleto");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 20;

  /* --- ESTADOS DE BÚSQUEDA --- */
  const [inputIncompletos, setInputIncompletos] = useState("");
  const [inputCompletados, setInputCompletados] = useState("");
  const [inputAprobados, setInputAprobados] = useState("");

  const [searchQueryIncompletos, setSearchQueryIncompletos] = useState("");
  const [searchQueryCompletados, setSearchQueryCompletados] = useState("");
  const [searchQueryAprobados, setSearchQueryAprobados] = useState("");

  /* -------------------------------------------------------------------------- */
  /* CICLO DE VIDA Y CARGA DE DATOS                                           */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const idUsuario = Cookies.get("seguridadId");
    if (!idUsuario) {
      console.warn("Acceso denegado: Credenciales no encontradas.");
      navigate("/LoginUsuariosSeguridad");
    } else {
      cargarPendientesYRevision(idUsuario);
    }
  }, [navigate]);

  const cargarPendientesYRevision = async (idUsuario: string) => {
    try {
      const res = await axios.get<{ message: string; vehicles: Vehiculo[] }>(
        `${API_BASE}/vehiculos/obtener-vehiculos-incompletos`,
        { params: { id_usuario: idUsuario } }
      );
      const list = res.data.vehicles || [];
      setVehiculosIncompletos(list.filter((v) => v.estadoIntegra === "registro_incompleto"));
      setVehiculosCompletados(list.filter((v) => v.estadoIntegra === "completado_revision"));
    } catch (error) {
      console.error("Error al cargar pendientes:", error);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* EFECTO: BUSQUEDA EN APROBADOS (VERDE)                                    */
  /* -------------------------------------------------------------------------- */
  
  useEffect(() => {
    if (vista === "aprobados") {
        fetchAprobadosBackend(searchQueryAprobados);
    }
  }, [vista, searchQueryAprobados]);

  const fetchAprobadosBackend = async (query: string) => {
      try {
          console.log(`📡 Buscando aprobados en backend: "${query}"`);
          const res = await axios.get<{ vehiculos: Vehiculo[] }>(
              `${API_BASE}/vehiculos/obtener-aprobados-paginados`, 
              { params: { search: query, limit: 10 } }
          );
          setVehiculosAprobados(res.data.vehiculos || []);
      } catch (error) {
          console.error("Error buscando aprobados:", error);
      }
  };

  /* -------------------------------------------------------------------------- */
  /* FUNCIONES DE BÚSQUEDA Y LIMPIEZA                                         */
  /* -------------------------------------------------------------------------- */

  const ejecutarBusquedaIncompletos = () => setSearchQueryIncompletos(inputIncompletos);
  const ejecutarBusquedaCompletados = () => setSearchQueryCompletados(inputCompletados);
  const ejecutarBusquedaAprobados = () => setSearchQueryAprobados(inputAprobados);

  const limpiarIncompletos = () => {
    setInputIncompletos("");
    setSearchQueryIncompletos("");
  };
  const limpiarCompletados = () => {
    setInputCompletados("");
    setSearchQueryCompletados("");
  };
  const limpiarAprobados = () => {
    setInputAprobados("");
    setSearchQueryAprobados("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  /* -------------------------------------------------------------------------- */
  /* LÓGICA DE APROBACIÓN Y RECHAZO                                           */
  /* -------------------------------------------------------------------------- */

  const aprobarVehiculo = async (veh: Vehiculo) => {
    // CAMBIO REALIZADO: Unificación de modales. 
    // Ahora muestra input de archivo y textarea de comentario al mismo tiempo.
    const { value: formValues } = await Swal.fire({
      title: `Aprobar Vehículo`,
      text: `Gestionar aprobación para placa: ${veh.placa}`,
      // Inyectamos HTML con ambos inputs
      html: `
        <div style="text-align: left; margin-bottom: 5px;">
            <label style="font-weight:600; font-size: 0.9rem;">1. Cargar Estudio de Seguridad (Opcional)</label>
            <input type="file" id="swal-file" class="swal2-file" />
        </div>
        <div style="text-align: left;">
            <label style="font-weight:600; font-size: 0.9rem;">2. Comentario / Observación (Opcional)</label>
            <textarea id="swal-comment" class="swal2-textarea" placeholder="Escribe un comentario aquí si es necesario..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Aprobar Vehículo",
      confirmButtonColor: "#28a745", // Verde
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#6c757d",
      
      preConfirm: () => {
        const fileInput = document.getElementById("swal-file") as HTMLInputElement;
        const commentInput = document.getElementById("swal-comment") as HTMLInputElement;
        
        return {
           file: (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null,
           comment: commentInput ? commentInput.value : ""
        };
      }
    });

    // Si el usuario cancela, no hacemos nada
    if (!formValues) return;

    const { file, comment } = formValues;

    try {
        // Mostramos cargando
        Swal.fire({ title: 'Procesando...', text: 'Actualizando información...', didOpen: () => Swal.showLoading() });

        // 1. Si hay archivo, lo subimos primero
        if (file) {
            const formDataArchivo = new FormData();
            formDataArchivo.append("archivo", file);
            formDataArchivo.append("placa", veh.placa);
            await axios.put(`${API_BASE}/vehiculos/subir-estudio-seguridad`, formDataArchivo);
        }

        // 2. Ejecutamos la aprobación (enviando el comentario si existe)
        await ejecutarAprobacion(veh, comment);

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Ocurrió un error al procesar la aprobación o subir el archivo.", "error");
    }
  };

  // Función auxiliar para llamar al backend de aprobación
  const ejecutarAprobacion = async (veh: Vehiculo, observaciones: string) => {
      try {
        const seguridadId = Cookies.get("seguridadId") || "";
        const formDataEstado = new FormData();
        formDataEstado.append("placa", veh.placa);
        formDataEstado.append("nuevo_estado", "aprobado");
        formDataEstado.append("usuario_id", seguridadId);
        
        // Si hay observaciones capturadas en el modal, las enviamos
        if (observaciones) {
            formDataEstado.append("observaciones", observaciones);
        }

        await axios.put(`${API_BASE}/vehiculos/actualizar-estado`, formDataEstado);
        
        // Éxito
        Swal.fire("Aprobado", `El vehículo ${veh.placa} ha sido aprobado exitosamente.`, "success");

        // Actualizar estados locales
        setVehiculosCompletados(prev => prev.filter(v => v._id !== veh._id));
        fetchAprobadosBackend(""); 
        if (expandedId === veh._id) setExpandedId(null);
        setVista("aprobados");
      } catch (error) {
        throw error; // Lanzamos el error para que lo capture el bloque try/catch principal
      }
  };

  const rechazarVehiculo = async (veh: Vehiculo) => {
    const { value: observaciones } = await Swal.fire({
      title: `Devolver a Registro Incompleto ${veh.placa}`,
      input: 'textarea',
      inputPlaceholder: 'Ingrese las observaciones...',
      showCancelButton: true,
      confirmButtonText: 'Devolver',
      confirmButtonColor: '#e74c3c',
      preConfirm: (t) => t || Swal.showValidationMessage('Requerido')
    });

    if (!observaciones) return;

    try {
      Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
      const seguridadId = Cookies.get("seguridadId") || "";
      const formData = new FormData();
      formData.append("placa", veh.placa);
      formData.append("nuevo_estado", "registro_incompleto");
      formData.append("usuario_id", seguridadId);
      formData.append("observaciones", observaciones);

      await axios.put(`${API_BASE}/vehiculos/actualizar-estado`, formData);
      const tenedor = veh.tenedor || veh.idUsuario;
      axios.post(`${API_BASE}/revision/enviar-observaciones?tenedor=${tenedor}`, { observaciones }).catch(console.warn);

      Swal.fire("Devuelto", "Vehículo devuelto exitosamente.", "success");
      setVehiculosCompletados(prev => prev.filter(v => v._id !== veh._id));
      const vehActualizado = { ...veh, estadoIntegra: "registro_incompleto", observaciones };
      setVehiculosIncompletos(prev => [...prev, vehActualizado]);

      if (expandedId === veh._id) setExpandedId(null);
      setVista("registro_incompleto");
    } catch {
      Swal.fire("Error", "Error al procesar devolución.", "error");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* UI HELPERS                                                                 */
  /* -------------------------------------------------------------------------- */

  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const RenderDatosVehiculo = ({ veh }: { veh: Vehiculo }) => {
    
    // Lógica de estilos para las observaciones
    const isAprobado = veh.estadoIntegra === "aprobado" || vista === "aprobados";
    const estiloObservacion = isAprobado 
        ? { backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724' } // Verde (Aprobado)
        : { backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404' }; // Amarillo (Alerta)
    
    const tituloObservacion = isAprobado ? "✅ Observación de Aprobación:" : "⚠️ Últimas Observaciones:";

    return (
        <div className="detalle-completo">
          
          {/* 1. Información Básica */}
          <h4 className="titulo-seccion">📌 Información Básica del Registro</h4>
          <div className="datos-grid">
            <p><strong>Placa:</strong> {veh.placa}</p>
            <p><strong>Estado:</strong> {veh.estadoIntegra}</p>
            <p><strong>ID Usuario (Registro):</strong> {veh.idUsuario}</p>
            <p><strong>Usuario Integra (Auditor):</strong> {veh.usuarioIntegra || "No asignado"}</p>
            
            {/* Visualización condicional de observaciones (Verde o Amarillo) */}
            {veh.observaciones && (
                <p style={{ gridColumn: '1 / -1', ...estiloObservacion }}>
                  <strong>{tituloObservacion}</strong> {veh.observaciones}
                </p>
            )}
          </div>

          {/* 2. DATOS DEL CONDUCTOR */}
          <h4 className="titulo-seccion">👤 Datos del Conductor</h4>
          <div className="datos-grid">
            <p><strong>Nombre Completo:</strong> {veh.condNombres} {veh.condPrimerApellido} {veh.condSegundoApellido}</p>
            <p><strong>Cédula:</strong> {veh.condCedulaCiudadania}</p>
            <p><strong>Expedida En:</strong> {veh.condExpedidaEn}</p>
            <p><strong>Dirección:</strong> {veh.condDireccion}</p>
            <p><strong>Ciudad:</strong> {veh.condCiudad}</p>
            <p><strong>Celular:</strong> {veh.condCelular}</p>
            <p><strong>Correo:</strong> {veh.condCorreo}</p>
            <p><strong>EPS:</strong> {veh.condEps}</p>
            <p><strong>ARL:</strong> {veh.condArl}</p>
            <p><strong>Grupo Sanguíneo:</strong> {veh.condGrupoSanguineo}</p>
          </div>
          <div className="datos-grid">
            <p><strong>Licencia No:</strong> {veh.condNoLicencia}</p>
            <p><strong>Vencimiento Licencia:</strong> {veh.condFechaVencimientoLic}</p>
            <p><strong>Categoría Licencia:</strong> {veh.condCategoriaLic}</p>
          </div>
          
          {/* Referencias y Emergencia */}
          <h5 className="titulo-subseccion">📞 Contacto Emergencia & Referencias</h5>
          <div className="datos-grid">
            <p><strong>Nombre Emergencia:</strong> {veh.condNombreEmergencia}</p>
            <p><strong>Celular Emergencia:</strong> {veh.condCelularEmergencia}</p>
            <p><strong>Parentesco:</strong> {veh.condParentescoEmergencia}</p>
            <p><strong>Empresa Ref:</strong> {veh.condEmpresaRef}</p>
            <p><strong>Celular Ref:</strong> {veh.condCelularRef}</p>
            <p><strong>Ciudad Ref:</strong> {veh.condCiudadRef}</p>
            <p><strong>Nro Viajes Ref:</strong> {veh.condNroViajesRef}</p>
            <p><strong>Antigüedad Ref:</strong> {veh.condAntiguedadRef}</p>
            <p><strong>Mercancía:</strong> {veh.condMercTransportada}</p>
          </div>

          {/* 3. DATOS DEL PROPIETARIO */}
          <h4 className="titulo-seccion">🔑 Datos del Propietario</h4>
          <div className="datos-grid">
            <p><strong>Nombre:</strong> {veh.propNombre}</p>
            <p><strong>Documento:</strong> {veh.propDocumento}</p>
            <p><strong>Ciudad Exp:</strong> {veh.propCiudadExpDoc}</p>
            <p><strong>Celular:</strong> {veh.propCelular}</p>
            <p><strong>Correo:</strong> {veh.propCorreo}</p>
            <p><strong>Dirección:</strong> {veh.propDireccion}</p>
            <p><strong>Ciudad:</strong> {veh.propCiudad}</p>
          </div>

          {/* 4. DATOS DEL TENEDOR */}
          <h4 className="titulo-seccion">🤝 Datos del Tenedor</h4>
          <div className="datos-grid">
            <p><strong>Nombre:</strong> {veh.tenedNombre}</p>
            <p><strong>Documento:</strong> {veh.tenedDocumento}</p>
            <p><strong>Ciudad Exp:</strong> {veh.tenedCiudadExpDoc}</p>
            <p><strong>Celular:</strong> {veh.tenedCelular}</p>
            <p><strong>Correo:</strong> {veh.tenedCorreo}</p>
            <p><strong>Dirección:</strong> {veh.tenedDireccion}</p>
            <p><strong>Ciudad:</strong> {veh.tenedCiudad}</p>
          </div>

          {/* 5. DATOS DEL VEHÍCULO */}
          <h4 className="titulo-seccion">🚚 Datos del Vehículo</h4>
          <div className="datos-grid">
            <p><strong>Placa:</strong> {veh.placa}</p>
            <p><strong>Marca:</strong> {veh.vehMarca}</p>
            <p><strong>Línea:</strong> {veh.vehLinea}</p>
            <p><strong>Modelo:</strong> {veh.vehModelo}</p>
            <p><strong>Año:</strong> {veh.vehAno}</p>
            <p><strong>Color:</strong> {veh.vehColor}</p>
            <p><strong>Carrocería:</strong> {veh.vehTipoCarroceria}</p>
            <p><strong>Repotenciado:</strong> {veh.vehRepotenciado}</p>
          </div>
          
          {/* Datos Satelitales */}
          <div className="datos-grid mt-2 bg-gray-50 p-2 rounded">
            <p><strong>Empresa Satélite:</strong> {veh.vehEmpresaSat}</p>
            <p><strong>Usuario Satélite:</strong> {veh.vehUsuarioSat}</p>
            <p><strong>Clave Satélite:</strong> {veh.vehClaveSat}</p>
          </div>

          {/* 6. DATOS DEL REMOLQUE (Si aplica) */}
          {(veh.RemolPlaca || veh.tarjetaRemolque) && (
            <>
              <h4 className="titulo-seccion">🚛 Datos del Remolque</h4>
              <div className="datos-grid">
                <p><strong>Placa Remolque:</strong> {veh.RemolPlaca}</p>
                <p><strong>Modelo:</strong> {veh.RemolModelo}</p>
                <p><strong>Clase:</strong> {veh.RemolClase}</p>
                <p><strong>Carrocería:</strong> {veh.RemolTipoCarroceria}</p>
                <p><strong>Alto:</strong> {veh.RemolAlto}</p>
                <p><strong>Largo:</strong> {veh.RemolLargo}</p>
                <p><strong>Ancho:</strong> {veh.RemolAncho}</p>
              </div>
            </>
          )}

          {/* 7. DOCUMENTOS */}
          <h4 className="titulo-seccion">📄 Documentos y Fotos</h4>
          
          <div className="box-estudio-seguridad">
              {veh.estudioSeguridad ? (
                <div className="flex items-center gap-4 w-full">
                  <span className="font-bold text-blue-800">Estudio de Seguridad:</span>
                  <a href={veh.estudioSeguridad} target="_blank" rel="noopener noreferrer" className="btn-ver-doc-seguridad">
                    VER DOCUMENTO
                  </a>
                </div>
              ) : <span className="text-red-500 font-bold">Sin estudio de seguridad cargado.</span>}
          </div>

          {veh.documentos && Object.keys(veh.documentos).length > 0 ? (
            <div className="grid-documentos">
              {Object.entries(veh.documentos).map(([nombre, url]) => (
                <div key={nombre} className="documento-card" onClick={() => window.open(url as string, "_blank")}>
                  <p className="font-medium capitalize">{nombre.replace(/([A-Z])/g, " $1")}</p>
                  <span className="text-xs text-blue-600">Ver</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 italic">No hay documentos adjuntos adicionales.</p>}
        </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* FILTRADO LOCAL (ROJA Y AMARILLA)                                         */
  /* -------------------------------------------------------------------------- */

  const filtrarLocales = (lista: Vehiculo[], busqueda: string) => {
    if (!busqueda) return lista;
    const lowerQ = busqueda.toLowerCase();
    return lista.filter((veh) => {
      const placaMatch = veh.placa?.toLowerCase().includes(lowerQ);
      const cedulaMatch = veh.condCedulaCiudadania?.toString().toLowerCase().includes(lowerQ);
      return placaMatch || cedulaMatch;
    });
  };

  const filteredIncompletos = useMemo(() => 
    filtrarLocales(vehiculosIncompletos, searchQueryIncompletos), 
  [vehiculosIncompletos, searchQueryIncompletos]);

  const filteredCompletados = useMemo(() => 
    filtrarLocales(vehiculosCompletados, searchQueryCompletados), 
  [vehiculosCompletados, searchQueryCompletados]);
  
  const totalPages = Math.ceil(filteredCompletados.length / vehiclesPerPage);
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * vehiclesPerPage;
    return filteredCompletados.slice(startIndex, startIndex + vehiclesPerPage);
  }, [filteredCompletados, currentPage, vehiclesPerPage]);

  /* -------------------------------------------------------------------------- */
  /* RENDERIZADO VISUAL                                                       */
  /* -------------------------------------------------------------------------- */

  return (
    <div>
      <BarraSuperiorSeguridad /> 
      <div className="layout-revision">
        <div className="panel-lateral">
          <button className={`btn-menu ${vista === "registro_incompleto" ? "active" : ""} color-rojo`} onClick={() => setVista("registro_incompleto")}>
            Registros Incompletos <span className="contador-vehiculos">({vehiculosIncompletos.length})</span>
          </button>
          <button className={`btn-menu ${vista === "completado_revision" ? "active" : ""} color-amarillo`} onClick={() => setVista("completado_revision")}>
            Pendientes por Aprobar <span className="contador-vehiculos">({vehiculosCompletados.length})</span>
          </button>
          <button className={`btn-menu ${vista === "aprobados" ? "active" : ""} color-verde`} onClick={() => setVista("aprobados")}>
            Aprobados
          </button>
        </div>

        <div className="contenedor-principal">
          
          {/* VISTA ROJA */}
          {vista === "registro_incompleto" && (
            <>
              <h2>Registros Incompletos</h2>
              <div className="dropdown-contenedor">
                <label>Buscar por Placa o Cédula:</label>
                <div className="busqueda-wrapper">
                  <input 
                    type="text" 
                    className="input-busqueda" 
                    placeholder="Ej: KUT45E o 12345678" 
                    value={inputIncompletos} 
                    onChange={(e) => setInputIncompletos(e.target.value)} 
                    onKeyDown={(e) => handleKeyDown(e, ejecutarBusquedaIncompletos)}
                  />
                  {inputIncompletos && (
                    <button className="btn-clear" onClick={limpiarIncompletos} title="Limpiar"><FaTimes /></button>
                  )}
                  <button className="btn-lupa" onClick={ejecutarBusquedaIncompletos} title="Buscar"><FaSearch /></button>
                </div>
              </div>
              {filteredIncompletos.length === 0 && <p style={{marginTop: 20}}>No hay vehículos.</p>}
              {filteredIncompletos.map((veh) => (
                <div key={veh._id} className="vehiculo-card">
                  <div className="vehiculo-header" onClick={() => toggleExpand(veh._id)}>
                    <h3>{veh.placa} - {veh.condNombres || 'SIN NOMBRE'}</h3>
                    <span className="toggle-icon">{expandedId === veh._id ? "▲" : "▼"}</span>
                  </div>
                  {expandedId === veh._id && <div className="vehiculo-body"><RenderDatosVehiculo veh={veh} /></div>}
                </div>
              ))}
            </>
          )}

          {/* VISTA AMARILLA */}
          {vista === "completado_revision" && (
            <>
              <h2>Pendientes por Aprobar</h2>
              <div className="dropdown-contenedor">
                <div className="busqueda-wrapper">
                  <input 
                    type="text" 
                    className="input-busqueda" 
                    placeholder="Buscar por Placa o Cédula..." 
                    value={inputCompletados} 
                    onChange={(e) => setInputCompletados(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, ejecutarBusquedaCompletados)}
                  />
                  {inputCompletados && (
                    <button className="btn-clear" onClick={limpiarCompletados} title="Limpiar"><FaTimes /></button>
                  )}
                  <button className="btn-lupa" onClick={ejecutarBusquedaCompletados} title="Buscar"><FaSearch /></button>
                </div>
              </div>
              {paginatedVehicles.map((veh) => (
                <div key={veh._id} className="vehiculo-card completado">
                  <div className="vehiculo-header" onClick={() => toggleExpand(veh._id)}>
                    <h3>{veh.placa} - {veh.condNombres || 'SIN NOMBRE'}</h3>
                    <span className="toggle-icon">{expandedId === veh._id ? "▲" : "▼"}</span>
                  </div>
                  {expandedId === veh._id && (
                    <div className="vehiculo-body">
                      <RenderDatosVehiculo veh={veh} />
                      <div className="acciones mt-4 border-t pt-4">
                        <button className="btn-aprobar" onClick={() => aprobarVehiculo(veh)}>Aprobar vehículo</button>
                        <button className="btn-rechazar" onClick={() => rechazarVehiculo(veh)}>Rechazar Vehículo</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {totalPages > 1 && (
                <div className="paginacion-contenedor">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Ant</button>
                  <span>{currentPage} / {totalPages}</span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sig</button>
                </div>
              )}
            </>
          )}

          {/* VISTA VERDE */}
          {vista === "aprobados" && (
            <>
              <h2>Vehículos Aprobados (Recientes)</h2>
              <div className="dropdown-contenedor">
                <div className="busqueda-wrapper">
                  <input 
                    type="text" 
                    className="input-busqueda" 
                    placeholder="Buscar en BD por Placa o Cédula..." 
                    value={inputAprobados} 
                    onChange={(e) => setInputAprobados(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, ejecutarBusquedaAprobados)}
                  />
                  {inputAprobados && (
                    <button className="btn-clear" onClick={limpiarAprobados} title="Limpiar"><FaTimes /></button>
                  )}
                  <button className="btn-lupa" onClick={ejecutarBusquedaAprobados} title="Buscar"><FaSearch /></button>
                </div>
                <p style={{fontSize: '0.85rem', color: '#666', marginTop: 5}}>
                  {searchQueryAprobados ? `Resultados para: "${searchQueryAprobados}"` : "Mostrando los 10 últimos aprobados."}
                </p>
              </div>
              
              {vehiculosAprobados.length === 0 && <p>No se encontraron resultados.</p>}
              
              {vehiculosAprobados.map((veh) => (
                  <div key={veh._id} className="vehiculo-card aprobado">
                    <div className="vehiculo-header aprobado-header" onClick={() => toggleExpand(veh._id)}>
                        <h3>{veh.placa} - {veh.condNombres || 'SIN NOMBRE'}</h3>
                        <span className="toggle-icon">{expandedId === veh._id ? "▲" : "▼"}</span>
                    </div>
                    {expandedId === veh._id && (
                        <div className="vehiculo-body">
                           <RenderDatosVehiculo veh={veh} />
                        </div>
                    )}
                  </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevisionVehiculos;