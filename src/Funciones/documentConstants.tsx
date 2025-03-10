// documentConstants.ts
const API_BASE_URL = "https://integrappi-dvmh.onrender.com/vehiculos";

// Función para normalizar claves
const normalizeKey = (key: string) => key.trim().toLowerCase();

// Endpoints normalizados
export const endpoints: Record<string, string> = Object.fromEntries(
  Object.entries({
    "Tarjeta de Propiedad": `${API_BASE_URL}/subir-documento`,
    "soat": `${API_BASE_URL}/subir-documento`,
    "Revisión Tecnomecánica": `${API_BASE_URL}/subir-documento`,
    "Tarjeta de Remolque": `${API_BASE_URL}/subir-documento`,
    "Fotos": `${API_BASE_URL}/subir-fotos`,
    "Póliza de responsabilidad civil": `${API_BASE_URL}/subir-documento`,
    "Documento de Identidad del Conductor": `${API_BASE_URL}/subir-documento`,
    "Documento de Identidad del Propietario": `${API_BASE_URL}/subir-documento`,
    "Documento de Identidad del Tenedor": `${API_BASE_URL}/subir-documento`,
    "Licencia de Conducción Vigente": `${API_BASE_URL}/subir-documento`,
    "Planilla de EPS y ARL": `${API_BASE_URL}/subir-documento`,
    "Planilla de EPS": `${API_BASE_URL}/subir-documento`,
    "Planilla de ARL": `${API_BASE_URL}/subir-documento`,
    "Foto Conductor": `${API_BASE_URL}/subir-documento`,
    "Certificación Bancaria Conductor": `${API_BASE_URL}/subir-documento`,
    "Certificación Bancaria Propietario": `${API_BASE_URL}/subir-documento`,
    "Certificación Bancaria Tenedor": `${API_BASE_URL}/subir-documento`,
    "Documento que lo acredite como Tenedor": `${API_BASE_URL}/subir-documento`,
    "RUT Tenedor": `${API_BASE_URL}/subir-documento`,
    "RUT Propietario": `${API_BASE_URL}/subir-documento`
  }).map(([key, value]) => [normalizeKey(key), value])
);

// Mapeo de nombres de documentos a sus campos en el backend
export const tiposMapping: Record<string, string> = Object.fromEntries(
  Object.entries({
    "Tarjeta de Propiedad": "tarjetaPropiedad",
    "soat": "soat",
    "Revisión Tecnomecánica": "revisionTecnomecanica",
    "Tarjeta de Remolque": "tarjetaRemolque",
    "Fotos": "fotos",
    "Póliza de responsabilidad civil": "polizaResponsabilidad",
    "Documento de Identidad del Conductor": "documentoIdentidadConductor",
    "Documento de Identidad del Propietario": "documentoIdentidadPropietario",
    "Documento de Identidad del Tenedor": "documentoIdentidadTenedor",
    "Licencia de Conducción Vigente": "licencia",
    "Planilla de EPS y ARL": "planillaEpsArl",
    "Foto Conductor": "condFoto",
    "Certificación Bancaria Conductor": "condCertificacionBancaria",
    "Certificación Bancaria Propietario": "propCertificacionBancaria",
    "Certificación Bancaria Tenedor": "tenedCertificacionBancaria",
    "Documento que lo acredite como Tenedor": "documentoAcreditacionTenedor",
    "RUT Tenedor": "rutTenedor",
    "RUT Propietario": "rutPropietario"
  }).map(([key, value]) => [normalizeKey(key), value])
);