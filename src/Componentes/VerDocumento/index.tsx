import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../../Imagenes/AnimationPuntos.json";
import { ContextoApp } from "../../Contexto/index";
import "./estilos.css";

interface VerDocumentoProps {
  urls: string[];
  onDeleteSuccess: () => void;
  onClose: () => void;
}

const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

const VerDocumento: React.FC<VerDocumentoProps> = ({ urls, onDeleteSuccess, onClose }) => {
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }
  const { verDocumento } = almacenVariables;
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCargando(false);
    }, 500);
  }, []);

  if (!verDocumento) return null;

  const obtenerTipoDocumentoDesdeUrl = (url: string): string | null => {
    const mappingTipos: Record<string, string> = {
      "tarjetaPropiedad": "tarjetaPropiedad",
      "soat": "soat",
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
      "certificacionBancaria": "certificacionBancaria",
      "documentoAcreditacionTenedor": "documentoAcreditacionTenedor",
      "rutTenedor": "rutTenedor",
      "rutPropietario": "rutPropietario"
    };

    const partes = url.split("/").pop()?.split("_");
    const nombreArchivo = partes ? partes[0] : null;
    if (!nombreArchivo) return null;
    console.log("Nombre extraído:", nombreArchivo);
    if (nombreArchivo.toLowerCase() === "foto") {
      return "fotos";
    }
    return mappingTipos[nombreArchivo] || null;
  };

  const handleEliminarImagen = async (url: string) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar imagen?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (confirmacion.isConfirmed) {
      try {
        const placa = "ABC";
        const tipoDocumento = obtenerTipoDocumentoDesdeUrl(url);
        if (!tipoDocumento) {
          throw new Error("No se pudo determinar el tipo de documento.");
        }
        const urlLimpia = url.split("?")[0];
        let deleteEndpoint = "";
        if (tipoDocumento === "fotos") {
          deleteEndpoint = `${API_BASE_URL}/eliminar-foto?placa=${placa}&url=${encodeURIComponent(urlLimpia)}`;
        } else {
          deleteEndpoint = `${API_BASE_URL}/eliminar-documento?placa=${placa}&tipo=${tipoDocumento}`;
        }
        console.log("🔹 Enviando solicitud DELETE a:", deleteEndpoint);
        const response = await axios.delete(deleteEndpoint);
        if (response.status === 200) {
          Swal.fire("Eliminado", "La imagen ha sido eliminada", "success");
          onDeleteSuccess();
        } else {
          throw new Error("No se pudo eliminar la imagen.");
        }
      } catch (error) {
        console.error("❌ Error al eliminar la imagen:", error);
        Swal.fire("Error", "No se pudo eliminar la imagen", "error");
      }
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
            {urls.map((url, index) => (
              <div key={index} className="VerDocumento-imagen-container">
                <img 
                  src={`${url}?t=${new Date().getTime()}`} 
                  alt={`Documento ${index + 1}`} 
                  className="VerDocumento-imagen" 
                />
                <button className="VerDocumento-boton-eliminar" onClick={() => handleEliminarImagen(url)}>🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerDocumento;
