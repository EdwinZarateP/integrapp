import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../../Imagenes/AnimationPuntos.json";
import { ContextoApp } from "../../Contexto/index";
import "./estilos.css";

interface VerDocumentoProps {
  urls: string[];
  placa: string;
  onDeleteSuccess: (nuevasUrls: string[]) => void;
  onClose: () => void;
}

const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

const VerDocumento: React.FC<VerDocumentoProps> = ({ urls, placa, onDeleteSuccess, onClose }) => {
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }
  const { verDocumento } = almacenVariables;

  // Estado local para manejar los documentos
  const [documentos, setDocumentos] = useState<string[]>(urls);
  const [cargando, setCargando] = useState(true);

  // Actualiza documentos cuando cambian las URLs
  useEffect(() => {
    setDocumentos(urls);
  }, [urls]);

  // Simula breve delay de carga
  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!verDocumento) return null;

  /**
   * Detecta si la URL es una imagen (png, jpg, jpeg, webp)
   * Ignoramos parámetros de query (por ej. "?t=123")
   */
  const esImagen = (url: string): boolean => {
    const urlSinQuery = url.split("?")[0].toLowerCase();
    const extensiones = [".png", ".jpg", ".jpeg", ".webp"];
    return extensiones.some(ext => urlSinQuery.endsWith(ext));
  };

  /**
   * Extrae el nombre del archivo sin query
   */
  const obtenerNombreArchivo = (url: string): string => {
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split("/").pop() || "Documento.pdf";
  };

  /**
   * Determina el tipo de documento según el nombre original
   * (tal como en tu código original).
   */
  const obtenerTipoDocumentoDesdeUrl = (url: string): string | null => {
    const mappingTipos: Record<string, string> = {
      "tarjetaPropiedad": "tarjetaPropiedad",
      "SOAT": "soat",
      "revisionTecnomecanica": "revisionTecnomecanica",
      "tarjetaRemolque": "tarjetaRemolque",
      "fotos": "fotos",
      "polizaResponsabilidad": "polizaResponsabilidad",
      "documentoIdentidadConductor": "documentoIdentidadConductor",
      "documentoIdentidadPropietario": "documentoIdentidadPropietario",
      "documentoIdentidadTenedor": "documentoIdentidadTenedor",
      "licencia": "licencia",
      "planillaEps": "planillaEps",
      "planillaArl": "planillaArl",
      "condCertificacionBancaria": "condCertificacionBancaria",
      "propCertificacionBancaria": "propCertificacionBancaria",
      "tenedCertificacionBancaria": "tenedCertificacionBancaria",
      "documentoAcreditacionTenedor": "documentoAcreditacionTenedor",
      "rutTenedor": "rutTenedor",
      "rutPropietario": "rutPropietario"
    };

    // Tomamos la parte antes del guion bajo "_"
    const partes = url.split("/").pop()?.split("_");
    const nombreArchivo = partes ? partes[0] : null;
    if (!nombreArchivo) return null;

    // Si empieza con "Foto" => "fotos"
    if (nombreArchivo.toLowerCase() === "foto") {
      return "fotos";
    }
    // Si coincide con mapping, devolvemos ese tipo
    return mappingTipos[nombreArchivo] || null;
  };

  /**
   * Eliminar documento (imagen o PDF)
   */
  const handleEliminarDocumento = async (urlAEliminar: string) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar documento?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar"
    });
    if (!confirmacion.isConfirmed) return;

    try {
      const urlLimpia = urlAEliminar.split("?")[0];
      const tipoDocumento = obtenerTipoDocumentoDesdeUrl(urlLimpia);

      if (!tipoDocumento) {
        // Si no coincide con nada, asume que es un PDF
        // (o puedes mostrar error si prefieres)
        // throw new Error("No se pudo determinar el tipo de documento.");
        // Fallback: lo tratamos como 'pdf'
        console.warn("Tipo de documento no detectado; usando PDF por defecto.");
        // Llamamos a /eliminar-documento con tipo=pdf
        const response = await axios.delete(
          `${API_BASE_URL}/eliminar-documento?placa=${placa}&tipo=pdf`
        );
        if (response.status === 200) {
          Swal.fire("Eliminado", "El documento ha sido eliminado", "success");
          const nuevas = documentos.filter((doc) => doc !== urlAEliminar);
          setDocumentos(nuevas);
          onDeleteSuccess(nuevas);
        } else {
          throw new Error("No se pudo eliminar el documento.");
        }
        return;
      }

      // Si es "fotos", va a eliminar-foto
      // si no, va a eliminar-documento
      let deleteEndpoint = "";
      if (tipoDocumento === "fotos") {
        deleteEndpoint = `${API_BASE_URL}/eliminar-foto?placa=${placa}&url=${encodeURIComponent(urlLimpia)}`;
      } else {
        deleteEndpoint = `${API_BASE_URL}/eliminar-documento?placa=${placa}&tipo=${tipoDocumento}`;
      }

      const response = await axios.delete(deleteEndpoint);
      if (response.status === 200) {
        Swal.fire("Eliminado", "El documento ha sido eliminado", "success");
        const nuevas = documentos.filter((doc) => doc !== urlAEliminar);
        setDocumentos(nuevas);
        onDeleteSuccess(nuevas);
      } else {
        throw new Error("No se pudo eliminar el documento.");
      }
    } catch (error) {
      console.error("❌ Error al eliminar el documento:", error);
      Swal.fire("Error", "No se pudo eliminar el documento", "error");
    }
  };

  return (
    <div className="VerDocumento-overlay">
      <div className="VerDocumento-contenedor">
        <button className="VerDocumento-boton-cerrar" onClick={onClose}>✖</button>

        {cargando ? (
          <div className="VerDocumento-carga">
            <Lottie animationData={animationData} style={{ height: 200, width: "100%", margin: "auto" }} />
            <p className="VerDocumento-texto-carga">Cargando documento...</p>
          </div>
        ) : (
          <div className="VerDocumento-galeria">
            {documentos.map((url, index) => (
              <div key={index} className="VerDocumento-imagen-container">
                {esImagen(url) ? (
                  // Mostrar imagen
                  <>
                    <img
                      src={`${url}?t=${new Date().getTime()}`}
                      alt={`Documento ${index + 1}`}
                      className="VerDocumento-imagen"
                    />
                    <button
                      className="VerDocumento-boton-eliminar"
                      onClick={() => handleEliminarDocumento(url)}
                    >
                      🗑
                    </button>
                  </>
                ) : (
                  // Archivos PDF u otros => mostrar nombre y botón Descargar
                  <div className="VerDocumento-pdf-line">
                    <span className="VerDocumento-pdf-nombre">{obtenerNombreArchivo(url)}</span>
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="VerDocumento-pdf-descargar"
                    >
                      Descargar
                    </a>
                    <button
                      className="VerDocumento-boton-eliminar"
                      onClick={() => handleEliminarDocumento(url)}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerDocumento;
