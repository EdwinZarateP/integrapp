// documentConstants.ts
const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

// Endpoints para cada documento
export const endpoints: Record<string, string> = {
  "Tarjeta de Propiedad": `${API_BASE_URL}/subir-documento`,
  "SOAT": `${API_BASE_URL}/subir-documento`,
  "Revisión Tecnomecánica": `${API_BASE_URL}/subir-documento`,
  "Tarjeta de Remolque": `${API_BASE_URL}/subir-documento`,
  "Fotos": `${API_BASE_URL}/subir-fotos`,
  "Póliza de Responsabilidad Civil": `${API_BASE_URL}/subir-documento`,
  "Documento de Identidad del Conductor": `${API_BASE_URL}/subir-documento`,
  "Documento de Identidad del Propietario": `${API_BASE_URL}/subir-documento`,
  "Documento de Identidad del Tenedor": `${API_BASE_URL}/subir-documento`,
  "Licencia de Conducción Vigente": `${API_BASE_URL}/subir-documento`,
  "Planilla de EPS": `${API_BASE_URL}/subir-documento`,
  "Planilla de ARL": `${API_BASE_URL}/subir-documento`,
  "Certificación Bancaria": `${API_BASE_URL}/subir-documento`,
  "Documento que lo acredite como Tenedor": `${API_BASE_URL}/subir-documento`,
  "RUT Tenedor": `${API_BASE_URL}/subir-documento`,
  "RUT Propietario": `${API_BASE_URL}/subir-documento`
};

// Mapeo de nombres de documentos a sus campos en el backend
export const tiposMapping: Record<string, string> = {
  "tarjeta de propiedad": "tarjetaPropiedad",
  "soat": "soat",
  "revisión tecnomecánica": "revisionTecnomecanica", // Ajustar si en tu backend se llama "revisionTecnomecanica"
  "tarjeta de remolque": "tarjetaRemolque",
  "fotos": "fotos",
  "póliza de responsabilidad civil": "polizaResponsabilidad",
  "documento de identidad del conductor": "documentoIdentidadConductor",
  "documento de identidad del propietario": "documentoIdentidadPropietario",
  "documento de identidad del tenedor": "documentoIdentidadTenedor",
  "licencia de conducción vigente": "licencia",
  "planilla de eps": "planillaEps",
  "planilla de arl": "planillaArl",
  "certificación bancaria": "certificacionBancaria",
  "documento que lo acredite como tenedor": "documentoAcreditacionTenedor",
  "rut tenedor": "rutTenedor",
  "rut propietario": "rutPropietario"
};
