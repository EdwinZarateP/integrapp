import React, { useState } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from "../../Imagenes/AnimationPuntos.json";
import './estilos.css';

interface CargaDocumentoProps {
  documentName: string;
  endpoint: string;
  placa: string;
  onClose: () => void;
  onUploadSuccess?: (result: string | string[]) => void;
}

const CargaDocumento: React.FC<CargaDocumentoProps> = ({
  documentName,
  endpoint,
  placa,
  onClose,
  onUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Estado para mostrar los nombres de los archivos seleccionados
  const [selectedFileNames, setSelectedFileNames] = useState<string>("Ningún archivo seleccionado");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Mostramos los nombres de archivos en el span
      if (files.length > 0) {
        setSelectedFileNames(files.map(file => file.name).join(", "));
      } else {
        setSelectedFileNames("Ningún archivo seleccionado");
      }

      // Filtramos archivos válidos
      const validFiles = files.filter(file =>
        ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)
      );
      if (validFiles.length === 0) {
        alert('Solo se permiten archivos de imagen (jpg, jpeg, png) o PDF');
        return;
      }
      await handleUpload(validFiles);
    }
  };

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    const key = documentName === "Fotos" ? 'archivos' : 'archivo';
    files.forEach(file => formData.append(key, file));
    formData.append('placa', placa);
    
    // Mapeo para obtener el tipo que espera el backend
    const tiposMapping: Record<string, string> = {
      "tarjeta de propiedad": "tarjeta_propiedad",
      "soat": "soat",
      "revisión tecnomecánica": "revision_tecnomecanica",
      "tarjeta de remolque": "tarjeta_remolque",
      "fotos": "fotos",
      "póliza de responsabilidad civil": "poliza_responsabilidad",
      "documento de identidad del conductor": "documento_identidad_conductor",
      "documento de identidad del propietario": "documento_identidad_propietario",
      "documento de identidad del tenedor": "documento_identidad_tenedor",
      "licencia de conducción vigente": "licencia",
      "planilla de eps": "planilla_eps",
      "planilla de arl": "planilla_arl",
      "certificación bancaria": "certificacion_bancaria",
      "documento que lo acredite como tenedor": "documento_acreditacion_tenedor",
      "rut tenedor": "rut_tenedor",
      "rut propietario": "rut_propietario"
    };
    const lower = documentName.toLowerCase();
    const tipo = tiposMapping[lower] || lower.replace(/\s+/g, "_");
    formData.append('tipo', tipo);

    setUploading(true);
    setProgress(50);
    try {
      console.log(`Subiendo a: ${endpoint} con tipo ${tipo}`);
      const response = await axios.put(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200) {
        setProgress(100);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.urls || response.data.url);
        }
      } else {
        alert('Error al subir el documento');
      }
    } catch (error: any) {
      console.error('Error de carga:', error);
      alert(`Error al subir el documento: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="CargaDocumento-overlay">
      <div className="CargaDocumento-modal">
        <h2>Cargar {documentName}</h2>

        {/* Contenedor para nuestro input oculto y el label estilizado */}
        <div className="CargaDocumento-file-input-wrapper">
          <label
            className="CargaDocumento-btn-file"
            htmlFor="file-upload"
          >
            {documentName === "Fotos" ? "Elegir archivos" : "Elegir archivo"}
          </label>
          <span className="CargaDocumento-file-text">
            {selectedFileNames}
          </span>

          <input
            id="file-upload"
            type="file"
            accept="image/jpeg, image/png, image/jpg, application/pdf"
            multiple={documentName === "Fotos"}
            onChange={handleFileChange}
            disabled={uploading}
            className="CargaDocumento-input-hidden"
          />
        </div>

        {/* Animación y mensajes de estado */}
        {uploading && (
          <div className="CargaDocumento-uploading-container">
            <p className="CargaDocumento-mensaje-subiendo">Subiendo...</p>
            <Lottie 
              animationData={animationData} 
              style={{ height: 200, width: '100%', margin: 'auto' }} 
            />
          </div>
        )}
        {progress === 100 && !uploading && (
          <div className="CargaDocumento-mensaje-progreso">¡Carga completa!</div>
        )}

        <button className="CargaDocumento-btn-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CargaDocumento;
