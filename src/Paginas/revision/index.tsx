import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSearch, FaTimes, FaExclamationTriangle } from "react-icons/fa"; 
import HvVehiculos from "../../Componentes/HvVehiculos"; 
import BarraSuperiorSeguridad from "../../Componentes/Barra";
import "./estilos.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* -------------------------------------------------------------------------- */
/* 1. CONFIGURACIÓN EXACTA DE REQUISITOS          */
/* -------------------------------------------------------------------------- */

// A. Documentos 
const DOCUMENTOS_REQUERIDOS = [
  { key: "documentoIdentidadConductor", label: "Cédula de Ciudadanía" },
  { key: "licencia", label: "Licencia de Conducción" },
  { key: "tarjetaPropiedad", label: "Tarjeta de Propiedad" },
  { key: "soat", label: "SOAT" },
  { key: "revisionTecnomecanica", label: "Revisión Tecnomecánica" },
];

// Lista para visualizar TODOS los documentos posibles en las tarjetas de abajo
const TODOS_LOS_DOCUMENTOS_DISPLAY = [
    { key: "documentoIdentidadConductor", label: "Cédula Conductor" },
    { key: "licencia", label: "Licencia Conducción" },
    { key: "tarjetaPropiedad", label: "Tarjeta Propiedad" },
    { key: "soat", label: "SOAT" },
    { key: "revisionTecnomecanica", label: "Tecnomecánica" },
    { key: "tarjetaRemolque", label: "Tarjeta Remolque" },
    { key: "polizaResponsabilidad", label: "Póliza Resp." },
    { key: "condFoto", label: "Foto Conductor" },
    { key: "planillaEpsArl", label: "Planilla EPS/ARL" },
    { key: "documentoIdentidadTenedor", label: "Cédula Tenedor" },
    { key: "documentoIdentidadPropietario", label: "Cédula Propietario" },
    { key: "rutPropietario", label: "RUT Propietario" },
    { key: "rutTenedor", label: "RUT Tenedor" },
    { key: "condCertificacionBancaria", label: "Cert. Bancaria Cond." },
    { key: "propCertificacionBancaria", label: "Cert. Bancaria Prop." },
    { key: "tenedCertificacionBancaria", label: "Cert. Bancaria Tened." },
    { key: "fotos", label: "Foto Vehículo" } 
];

// B. Campos de Texto (Texto plano en BD)
const CAMPOS_TEXTO_REQUERIDOS = [
  // Conductor
  { key: 'condPrimerApellido', label: '1er Apellido Conductor' },
  { key: 'condSegundoApellido', label: '2do Apellido Conductor' },
  { key: 'condNombres', label: 'Nombres Conductor' },
  { key: 'condCedulaCiudadania', label: 'Cédula Conductor' },
  { key: 'condExpedidaEn', label: 'Ciudad Exp. Cédula' },
  { key: 'condDireccion', label: 'Dirección Conductor' },
  { key: 'condCiudad', label: 'Ciudad Residencia' },
  { key: 'condCelular', label: 'Celular Conductor' },
  { key: 'condCorreo', label: 'Correo Conductor' },
  { key: 'condEps', label: 'EPS' },
  { key: 'condArl', label: 'ARL' },
  { key: 'condNoLicencia', label: 'No. Licencia' },
  { key: 'condFechaVencimientoLic', label: 'Vencimiento Licencia' },
  { key: 'condCategoriaLic', label: 'Categoría Licencia' },
  { key: 'condGrupoSanguineo', label: 'Grupo Sanguíneo' },
  
  // Emergencia y Referencias
  { key: 'condNombreEmergencia', label: 'Nombre Emergencia' },
  { key: 'condCelularEmergencia', label: 'Celular Emergencia' },
  { key: 'condParentescoEmergencia', label: 'Parentesco Emergencia' },
  { key: 'condEmpresaRef', label: 'Empresa Referencia' },
  { key: 'condCelularRef', label: 'Celular Referencia' },
  { key: 'condCiudadRef', label: 'Ciudad Referencia' },
  { key: 'condNroViajesRef', label: 'Nro. Viajes Ref' },
  { key: 'condAntiguedadRef', label: 'Antigüedad Ref' },
  { key: 'condMercTransportada', label: 'Mercancía Transportada' },

  // Propietario
  { key: 'propNombre', label: 'Nombre Propietario' },
  { key: 'propDocumento', label: 'Doc. Propietario' },
  { key: 'propCiudadExpDoc', label: 'Ciudad Exp. Doc Prop' },
  { key: 'propCorreo', label: 'Correo Propietario' },
  { key: 'propCelular', label: 'Celular Propietario' },
  { key: 'propDireccion', label: 'Dirección Propietario' },
  { key: 'propCiudad', label: 'Ciudad Propietario' },

  // Tenedor
  { key: 'tenedNombre', label: 'Nombre Tenedor' },
  { key: 'tenedDocumento', label: 'Doc. Tenedor' },
  { key: 'tenedCiudadExpDoc', label: 'Ciudad Exp. Doc Tenedor' },
  { key: 'tenedCorreo', label: 'Correo Tenedor' },
  { key: 'tenedCelular', label: 'Celular Tenedor' },
  { key: 'tenedDireccion', label: 'Dirección Tenedor' },
  { key: 'tenedCiudad', label: 'Ciudad Tenedor' },

  // Vehículo
  { key: 'vehModelo', label: 'Modelo Vehículo' },
  { key: 'vehMarca', label: 'Marca Vehículo' },
  { key: 'vehTipoCarroceria', label: 'Carrocería Vehículo' },
  { key: 'vehLinea', label: 'Línea Vehículo' },
  { key: 'vehColor', label: 'Color Vehículo' },
  // Satelital
  { key: 'vehEmpresaSat', label: 'Empresa Satelital' },
  { key: 'vehUsuarioSat', label: 'Usuario Satelital' },
  { key: 'vehClaveSat', label: 'Clave Satelital' },
];

export interface Vehiculo {
  _id: string;
  placa: string;
  estadoIntegra: string;
  idUsuario: string;
  estudioSeguridad?: string;
  observaciones?: string;
  [key: string]: any;
}

type Vista = "registro_incompleto" | "completado_revision" | "aprobados";

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                                                       */
/* -------------------------------------------------------------------------- */

const RevisionVehiculos: React.FC = () => {
  const navigate = useNavigate();

  const [vehiculosIncompletos, setVehiculosIncompletos] = useState<Vehiculo[]>([]);
  const [vehiculosCompletados, setVehiculosCompletados] = useState<Vehiculo[]>([]);
  const [vehiculosAprobados, setVehiculosAprobados] = useState<Vehiculo[]>([]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>("registro_incompleto");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 20;

  const [inputIncompletos, setInputIncompletos] = useState("");
  const [inputCompletados, setInputCompletados] = useState("");
  const [inputAprobados, setInputAprobados] = useState("");

  const [searchQueryIncompletos, setSearchQueryIncompletos] = useState("");
  const [searchQueryCompletados, setSearchQueryCompletados] = useState("");
  const [searchQueryAprobados, setSearchQueryAprobados] = useState("");

  /* -------------------------------------------------------------------------- */
  /* CARGA DE DATOS                                                             */
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
  /* FUNCIONES DE BÚSQUEDA                                                    */
  /* -------------------------------------------------------------------------- */

  const ejecutarBusquedaIncompletos = () => setSearchQueryIncompletos(inputIncompletos);
  const ejecutarBusquedaCompletados = () => setSearchQueryCompletados(inputCompletados);
  const ejecutarBusquedaAprobados = () => setSearchQueryAprobados(inputAprobados);
  const limpiarIncompletos = () => { setInputIncompletos(""); setSearchQueryIncompletos(""); };
  const limpiarCompletados = () => { setInputCompletados(""); setSearchQueryCompletados(""); };
  const limpiarAprobados = () => { setInputAprobados(""); setSearchQueryAprobados(""); };
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => { if (e.key === 'Enter') action(); };

  /* -------------------------------------------------------------------------- */
  /* APROBACIÓN / RECHAZO                                                     */
  /* -------------------------------------------------------------------------- */
  const aprobarVehiculo = async (veh: Vehiculo) => {
    const { value: formValues } = await Swal.fire({
      title: `Aprobar Vehículo`,
      text: `Gestionar aprobación para placa: ${veh.placa}`,
      html: `
        <div style="text-align: left; margin-bottom: 5px;">
            <label style="font-weight:600; font-size: 0.9rem;">
                1. Cargar Estudio de Seguridad <span style="color:red">* (Obligatorio)</span>
            </label>
            <input type="file" id="swal-file" class="swal2-file" />
        </div>
        <div style="text-align: left;">
            <label style="font-weight:600; font-size: 0.9rem;">2. Comentario / Observación (Opcional)</label>
            <textarea id="swal-comment" class="swal2-textarea" placeholder="Observaciones..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Aprobar Vehículo",
      confirmButtonColor: "#28a745",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#6c757d",
      preConfirm: () => {
        const fileInput = document.getElementById("swal-file") as HTMLInputElement;
        const commentInput = document.getElementById("swal-comment") as HTMLInputElement;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            Swal.showValidationMessage('⚠️ Es obligatorio cargar el archivo del Estudio de Seguridad.');
            return false; 
        }
        return { file: fileInput.files[0], comment: commentInput ? commentInput.value : "" };
      }
    });

    if (!formValues) return; 
    const { file, comment } = formValues;

    try {
        Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
        const formDataArchivo = new FormData();
        formDataArchivo.append("archivo", file);
        formDataArchivo.append("placa", veh.placa);
        await axios.put(`${API_BASE}/vehiculos/subir-estudio-seguridad`, formDataArchivo);
        await ejecutarAprobacion(veh, comment);
    } catch (error) {
        Swal.fire("Error", "Ocurrió un error al aprobar.", "error");
    }
  };

  const ejecutarAprobacion = async (veh: Vehiculo, observaciones: string) => {
      try {
        const seguridadId = Cookies.get("seguridadId") || "";
        const formDataEstado = new FormData();
        formDataEstado.append("placa", veh.placa);
        formDataEstado.append("nuevo_estado", "aprobado");
        formDataEstado.append("usuario_id", seguridadId);
        if (observaciones) formDataEstado.append("observaciones", observaciones);

        await axios.put(`${API_BASE}/vehiculos/actualizar-estado`, formDataEstado);
        
        Swal.fire("Aprobado", `El vehículo ${veh.placa} ha sido aprobado.`, "success");
        setVehiculosCompletados(prev => prev.filter(v => v._id !== veh._id));
        fetchAprobadosBackend(""); 
        if (expandedId === veh._id) setExpandedId(null);
        setVista("aprobados");
      } catch (error) { throw error; }
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

  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));
  const handlePageChange = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };

  /* -------------------------------------------------------------------------- */
  /* RENDER DATOS                  */
  /* -------------------------------------------------------------------------- */

  const RenderDatosVehiculo = ({ veh }: { veh: Vehiculo }) => {
    
    // 1. REVISAR CAMPOS DE TEXTO
    const faltantesTexto = CAMPOS_TEXTO_REQUERIDOS.filter(req => {
        const val = veh[req.key];
        return !val || val.toString().trim() === "";
    });

    // 2. REVISAR DOCUMENTOS 
    const faltantesDocs = DOCUMENTOS_REQUERIDOS.filter(req => {
        const urlDoc = veh[req.key]; 
        return !urlDoc || urlDoc === "";
    });

    // 3. REVISAR FIRMA
    const faltaFirma = !veh.firmaUrl;
    const totalFaltantes = faltantesTexto.length + faltantesDocs.length + (faltaFirma ? 1 : 0);

    // Lógica Estilos
    const isAprobado = veh.estadoIntegra === "aprobado" || vista === "aprobados";
    const estiloObservacion = isAprobado 
        ? { backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724' }
        : { backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404' };
    const tituloObservacion = isAprobado ? "✅ Observación de Aprobación:" : "⚠️ Últimas Observaciones:";

    const mostrarInfoFaltante = () => {
        let htmlContent = `<div style="text-align: left; font-size: 0.9rem; max-height: 400px; overflow-y: auto;">`;
        
        if (faltantesDocs.length > 0 || faltaFirma) {
            htmlContent += `<h5 style="color:#c0392b; border-bottom:1px solid #ddd; margin-top:10px;">📄 Documentos Faltantes</h5><ul style="padding-left: 20px;">`;
            htmlContent += faltantesDocs.map(d => `<li>${d.label}</li>`).join('');
            if(faltaFirma) htmlContent += `<li><strong>✍️ Firma Digital del Conductor</strong></li>`;
            htmlContent += `</ul>`;
        }

        if (faltantesTexto.length > 0) {
            htmlContent += `<h5 style="color:#d35400; border-bottom:1px solid #ddd; margin-top:15px;">📝 Datos Faltantes</h5><ul style="padding-left: 20px;">`;
            htmlContent += faltantesTexto.map(t => `<li>${t.label}</li>`).join('');
            htmlContent += `</ul>`;
        }
        htmlContent += `</div>`;

        Swal.fire({
            title: `<strong>Faltan ${totalFaltantes} Datos/Documentos</strong>`,
            html: htmlContent,
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#e67e22',
            width: '600px'
        });
    };

    return (
        <div className="detalle-completo">
          
          <h4 className="titulo-seccion">📌 Información Básica del Registro</h4>
          <div className="datos-grid">
            <p><strong>Placa:</strong> {veh.placa}</p>
            <p><strong>Estado:</strong> {veh.estadoIntegra}</p>
            
            {/* Botón de Faltantes */}
            {veh.estadoIntegra === 'registro_incompleto' && totalFaltantes > 0 && (
                <button className="btn-info-faltante" onClick={mostrarInfoFaltante}>
                    <FaExclamationTriangle className="icon-alert" />
                    <span>Ver Información Faltante ({totalFaltantes})</span>
                </button>
            )}
            
            {veh.observaciones && (
                <p style={{ gridColumn: '1 / -1', ...estiloObservacion }}>
                  <strong>{tituloObservacion}</strong> {veh.observaciones}
                </p>
            )}
          </div>

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
          
          <div className="datos-grid mt-2 bg-gray-50 p-2 rounded">
            <p><strong>Empresa Satélite:</strong> {veh.vehEmpresaSat}</p>
            <p><strong>Usuario Satélite:</strong> {veh.vehUsuarioSat}</p>
            <p><strong>Clave Satélite:</strong> {veh.vehClaveSat}</p>
          </div>

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

          <div className="grid-documentos">
             {/* Firma */}
             {veh.firmaUrl && (
                <div className="documento-card" onClick={() => window.open(veh.firmaUrl, "_blank")}>
                  <p>✍️ Firma Conductor</p>
                  <span className="text-xs text-blue-600">Ver</span>
                </div>
             )}
             
             {/* Renderizado de tarjetas de documentos presentes */}
             {TODOS_LOS_DOCUMENTOS_DISPLAY.map((doc) => {
                 const url = veh[doc.key]; // Buscamos si existe la URL en el objeto raiz
                 
                 // Caso especial: 'fotos' es un array en tu JSON
                 if (doc.key === "fotos" && Array.isArray(veh.fotos) && veh.fotos.length > 0) {
                     return (
                         <div key="foto-veh" className="documento-card" onClick={() => window.open(veh.fotos[0], "_blank")}>
                            <p>📸 Foto Vehículo</p>
                            <span className="text-xs text-blue-600">Ver</span>
                         </div>
                     );
                 }

                 if (url && typeof url === 'string') {
                     return (
                        <div key={doc.key} className="documento-card" onClick={() => window.open(url, "_blank")}>
                          <p className="font-medium">{doc.label}</p>
                          <span className="text-xs text-blue-600">Ver</span>
                        </div>
                     );
                 }
                 return null;
             })}
          </div>
          
          {/* Si no se renderizó ninguna card de arriba (verificación simple) */}
          {/* Nota: Esta lógica visual es simplificada, si no hay nada se verá vacío. */}
        </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* FILTROS Y RENDERIZADO                                                    */
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
          
          {/* ROJO */}
          {vista === "registro_incompleto" && (
            <>
              <h2>Registros Incompletos</h2>
              <div className="dropdown-contenedor">
                <label>Buscar por Placa o Cédula:</label>
                <div className="busqueda-wrapper">
                  <input type="text" className="input-busqueda" placeholder="Ej: KUT45E o 12345678" value={inputIncompletos} onChange={(e) => setInputIncompletos(e.target.value)} onKeyDown={(e) => handleKeyDown(e, ejecutarBusquedaIncompletos)}/>
                  {inputIncompletos && <button className="btn-clear" onClick={limpiarIncompletos}><FaTimes /></button>}
                  <button className="btn-lupa" onClick={ejecutarBusquedaIncompletos}><FaSearch /></button>
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

          {/* AMARILLO */}
          {vista === "completado_revision" && (
            <>
              <h2>Pendientes por Aprobar</h2>
              <div className="dropdown-contenedor">
                <div className="busqueda-wrapper">
                  <input type="text" className="input-busqueda" placeholder="Buscar por Placa o Cédula..." value={inputCompletados} onChange={(e) => setInputCompletados(e.target.value)} onKeyDown={(e) => handleKeyDown(e, ejecutarBusquedaCompletados)}/>
                  {inputCompletados && <button className="btn-clear" onClick={limpiarCompletados}><FaTimes /></button>}
                  <button className="btn-lupa" onClick={ejecutarBusquedaCompletados}><FaSearch /></button>
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

          {/* VERDE */}
          {vista === "aprobados" && (
            <>
              <h2>Vehículos Aprobados (Recientes)</h2>
              <div className="dropdown-contenedor">
                <div className="busqueda-wrapper">
                  <input type="text" className="input-busqueda" placeholder="Buscar en BD..." value={inputAprobados} onChange={(e) => setInputAprobados(e.target.value)} onKeyDown={(e) => handleKeyDown(e, ejecutarBusquedaAprobados)}/>
                  {inputAprobados && <button className="btn-clear" onClick={limpiarAprobados}><FaTimes /></button>}
                  <button className="btn-lupa" onClick={ejecutarBusquedaAprobados}><FaSearch /></button>
                </div>
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
                           <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                                <HvVehiculos vehiculo={veh} />
                           </div>
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