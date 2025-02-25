import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../../Imagenes/AnimationPuntos.json";
import { ContextoApp } from "../../Contexto/index";
import "./estilos.css";

interface VerDocumentoProps {
  urls: string[]; // Lista de URLs de imágenes
}

const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

const VerDocumento: React.FC<VerDocumentoProps> = ({ urls }) => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const { verDocumento, setVerDocumento } = almacenVariables;
  const [cargando, setCargando] = useState(true); // Estado para manejar la animación de carga

  useEffect(() => {
    // Simula la carga del componente
    setTimeout(() => {
      setCargando(false);
    }, 1000); // 1 segundo de espera antes de mostrar las imágenes
  }, []);

  if (!verDocumento) return null; // No renderizar si `verDocumento` es false

  // Función para eliminar una imagen
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
        const placa = "ABC"; // ⚠️ Ajusta esto si tienes la placa en contexto
        const tipoDocumento = obtenerTipoDocumentoDesdeUrl(url);
  
        if (!tipoDocumento) {
          throw new Error("No se pudo determinar el tipo de documento.");
        }
  
        const deleteEndpoint = `${API_BASE_URL}/eliminar-documento?placa=${placa}&tipo=${tipoDocumento}`;
        console.log("🔹 Enviando solicitud DELETE a:", deleteEndpoint);
  
        const response = await axios.delete(deleteEndpoint);
  
        if (response.status === 200) {
          Swal.fire("Eliminado", "La imagen ha sido eliminada", "success");
          setVerDocumento(false); 
          window.location.reload();
        } else {
          throw new Error("No se pudo eliminar la imagen.");
        }
      } catch (error) {
        console.error("❌ Error al eliminar la imagen:", error);
        Swal.fire("Error", "No se pudo eliminar la imagen", "error");
      }
    }
  };
  
  // Función para obtener el tipo de documento desde la URL de la imagen
  const obtenerTipoDocumentoDesdeUrl = (url: string): string | null => {
    const mappingTipos: Record<string, string> = {
      "tarjeta": "tarjeta_propiedad",
      "soat": "soat",
      "revision": "revision_tecnomecanica",
      "tecnomecanica": "revision_tecnomecanica",
      "remolque": "tarjeta_remolque",
      "poliza": "poliza_responsabilidad",
      "conductor": "documento_identidad_conductor",
      "licencia": "licencia",
      "eps": "planilla_eps",
      "arl": "planilla_arl",
      "tenedor": "documento_identidad_tenedor",
      "bancaria": "certificacion_bancaria",
      "acreditacion": "documento_acreditacion_tenedor",
      "rut_tenedor": "rut_tenedor",
      "propietario": "documento_identidad_propietario",
      "rut_propietario": "rut_propietario"
    };
  
    const nombreArchivo = url.split("/").pop()?.split("_")[0]; // Extrae la parte antes del "_"
    if (!nombreArchivo) return null;
  
    return mappingTipos[nombreArchivo] || null;
  };
  

  return (
    <div className="VerDocumento-overlay">
      <div className="VerDocumento-contenedor">
        <button className="VerDocumento-boton-cerrar" onClick={()=>setVerDocumento(false)}>✖</button>

        {/* Mostrar animación de carga si aún está cargando */}
        {cargando ? (
          <div className="VerDocumento-carga">
            <Lottie animationData={animationData} style={{ height: 200, width: "100%", margin: "auto" }} />
            <p className="VerDocumento-texto-carga">Cargando documento...</p>
          </div>
        ) : (
          <div className="VerDocumento-galeria">
            {urls.map((url, index) => (
              <div key={index} className="VerDocumento-imagen-container">
                <img src={url} alt={`Documento ${index + 1}`} className="VerDocumento-imagen" />
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
