import { useState, useEffect } from 'react';
import municipios from "../../Componentes/Municipios/municipios.json";
import Swal from 'sweetalert2';
import './estilos.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
// --- HELPERS PARA MUNICIPIOS ---
const departamentosUnicos = [...new Set(municipios.map(m => m.DEPARTAMENTO))].sort();

const getCiudadesPorDepto = (depto: string) => {
  return municipios
    .filter(m => m.DEPARTAMENTO === depto)
    .map(m => m.CIUDAD)
    .sort();
};

const buscarDepartamentoPorCiudad = (ciudad: string) => {
  if (!ciudad) return "";
  const encontrado = municipios.find(m => m.CIUDAD === ciudad);
  return encontrado ? encontrado.DEPARTAMENTO : "";
};

// --- COMPONENTES UI ---

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', value, onChange, options, disabled, inputProps }) => (
  <div className="Datos-input-container">
    <label>{label}</label>
    {options ? (
      <select name={name} value={value} onChange={onChange} disabled={disabled}>
        <option value="">Seleccione...</option>
        {options.map((option, idx) => (
          <option key={idx} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...(inputProps || {})}
      />
    )}
  </div>
);

interface FormSectionProps {
  title: string;
  fields: { 
    label: string; 
    name: string; 
    type?: string; 
    options?: string[]; 
    inputProps?: React.InputHTMLAttributes<HTMLInputElement> 
  }[];
  formData: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}

const categoriasLicencia = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"];
const gruposSanguineos = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const epsColombia = ["Sura", "Sanitas", "Compensar", "Coomeva", "Salud Total"];
const arlColombia = ["Positiva", "Sura", "Colpatria", "Bolívar", "Axa Colpatria"];
const parentescos = ["Padre", "Madre", "Hijo(a)", "Hermano(a)", "Esposo(a)", "Abuelo(a)", "Tio(a)", "Otro"];

const FormSection: React.FC<FormSectionProps> = ({ title, fields, formData, handleChange, disabled = false }) => (
  <div className="Datos-form-section">
    <h4>{title}</h4>
    <div className="Datos-fields-container">
      {fields.map(({ label, name, type, options, inputProps }) => (
        <InputField
          key={name}
          label={label}
          name={name}
          type={type}
          value={formData[name] || ""}
          onChange={handleChange}
          options={options}
          disabled={disabled}
          inputProps={inputProps}
        />
      ))}
    </div>
  </div>
);

interface DatosProps {
  placa: string;
  onValidChange?: (isValid: boolean) => void; 
  onCedulaConductorChange?: (cedula: string) => void;
  // NUEVA PROP para manejar la redirección al guardar con éxito
  onSavedSuccess: () => void;
}

const Datos: React.FC<DatosProps> = ({ placa, onValidChange, onCedulaConductorChange, onSavedSuccess }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenedorSame, setTenedorSame] = useState<boolean>(false);

  const phoneFields = ['condCelular', 'condCelularEmergencia', 'condCelularRef', 'propCelular', 'tenedCelular'];

  const requiredFields = [
    'condPrimerApellido', 'condSegundoApellido', 'condNombres', 'condCedulaCiudadania', 'condExpedidaEn', 'condDireccion',
    'condCiudad', 'condCelular', 'condCorreo', 'condEps', 'condArl', 'condNoLicencia', 'condFechaVencimientoLic', 'condCategoriaLic',
    'condGrupoSanguineo', 'condNombreEmergencia', 'condCelularEmergencia', 'condParentescoEmergencia', 'condEmpresaRef', 'condCelularRef',
    'condCiudadRef', 'condNroViajesRef', 'condAntiguedadRef', 'condMercTransportada', 'propNombre', 'propDocumento', 'propCiudadExpDoc',
    'propCorreo', 'propCelular', 'propDireccion', 'propCiudad', 'tenedNombre', 'tenedDocumento', 'tenedCiudadExpDoc', 'tenedCorreo',
    'tenedCelular', 'tenedDireccion', 'tenedCiudad', 'vehModelo', 'vehMarca', 'vehTipoCarroceria', 'vehLinea', 'vehColor', 
    'vehEmpresaSat', 'vehUsuarioSat', 'vehClaveSat', 'RemolPlaca', 'RemolModelo', 'RemolClase', 'RemolTipoCarroceria', 
    'RemolAlto', 'RemolLargo', 'RemolAncho'
  ];

  const calcularAvance = () => {
    const total = requiredFields.length;
    const completados = requiredFields.filter(field => formData[field] && formData[field].trim() !== "").length;
    return Math.round((completados / total) * 100);
  };

  const isFormValid = () => {
    return requiredFields.every((field) => formData[field] && formData[field].trim() !== "");
  };

  useEffect(() => {
    if (onValidChange) onValidChange(isFormValid());
    if (onCedulaConductorChange) onCedulaConductorChange(formData["condCedulaCiudadania"] || "");
  }, [formData, onValidChange, onCedulaConductorChange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/vehiculos/obtener-vehiculo/${placa}`);
        if (!response.ok) throw new Error("Error al obtener la información del vehículo");
        
        const data = await response.json();
        if (data.data) {
          const loadedData = data.data;
          const departamentosCalculados: Record<string, string> = {};
          const cityToDeptoMap: Record<string, string> = {
            'condExpedidaEn': 'condDeptoExpedida', 'condCiudad': 'condDeptoCiudad', 'condCiudadRef': 'condDeptoCiudadRef',
            'propCiudadExpDoc': 'propDeptoExpedida', 'propCiudad': 'propDeptoCiudad', 'tenedCiudadExpDoc': 'tenedDeptoExpedida',
            'tenedCiudad': 'tenedDeptoCiudad'
          };

          Object.keys(cityToDeptoMap).forEach(cityField => {
             if (loadedData[cityField]) {
                departamentosCalculados[cityToDeptoMap[cityField]] = buscarDepartamentoPorCiudad(loadedData[cityField]);
             }
          });

          setFormData((prevData) => ({ ...prevData, ...loadedData, ...departamentosCalculados }));
        }
      } catch (error) { console.error("Error cargando la información del vehículo:", error); }
    };
    if (placa) fetchData();
  }, [placa]);

  // --- HANDLE CHANGE CORREGIDO ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // 1. Validaciones Numéricas para Celulares
    if (phoneFields.some(field => name.includes(field))) {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length > 10) return;
        setFormData(prev => ({ ...prev, [name]: numericValue }));
        return;
    }

    // 2. NUEVAS VALIDACIONES DE RANGOS (Modelo y Antigüedad)
    // Si el usuario intenta escribir algo fuera del rango, lo ignoramos
    if (value !== "") {
        // No permitir modelo mayor a 2026
        if (name === 'vehModelo' && parseInt(value) > 2026) return;
        
        // No permitir antigüedad mayor a 30 años
        if (name === 'condAntiguedadRef' && parseInt(value) > 30) return;
    }

    // 3. Validación Tenedor (si es igual al propietario)
    if (tenedorSame && name.startsWith("tened")) return;

    // 4. Lógica de Departamentos
    if (name.includes('Depto')) {
        let ciudadField = "";
        if (name === 'condDeptoExpedida') ciudadField = 'condExpedidaEn';
        if (name === 'condDeptoCiudad') ciudadField = 'condCiudad';
        if (name === 'condDeptoCiudadRef') ciudadField = 'condCiudadRef';
        if (name === 'propDeptoExpedida') ciudadField = 'propCiudadExpDoc';
        if (name === 'propDeptoCiudad') ciudadField = 'propCiudad';
        if (name === 'tenedDeptoExpedida') ciudadField = 'tenedCiudadExpDoc';
        if (name === 'tenedDeptoCiudad') ciudadField = 'tenedCiudad';

        setFormData(prev => ({ ...prev, [name]: value, [ciudadField]: "" }));
    } else {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleCopiarDatos = () => {
    setFormData((prevData) => ({
      ...prevData,
      tenedNombre: prevData.propNombre || "", tenedDocumento: prevData.propDocumento || "",
      tenedDeptoExpedida: prevData.propDeptoExpedida || "", tenedCiudadExpDoc: prevData.propCiudadExpDoc || "",
      tenedCorreo: prevData.propCorreo || "", tenedCelular: prevData.propCelular || "",
      tenedDireccion: prevData.propDireccion || "", tenedDeptoCiudad: prevData.propDeptoCiudad || "",
      tenedCiudad: prevData.propCiudad || ""
    }));
  };

  const toggleTenedorSame = () => {
    const newState = !tenedorSame;
    setTenedorSame(newState);
    if (newState) handleCopiarDatos();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    for (const field of phoneFields) {
        if (formData[field] && formData[field].length !== 10) {
            Swal.fire({ title: "Número incorrecto", text: `El número de celular en el campo "${field}" debe tener exactamente 10 dígitos.`, icon: "warning" });
            return;
        }
    }

    setIsLoading(true);
    try {
      const cleanedFormData = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value || ""]));
      const response = await fetch(`${API_BASE}/vehiculos/actualizar-informacion/${placa}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleanedFormData),
      });
      const result = await response.json();
      
      Swal.fire({
        title: "¡Datos Guardados!",
        text: result.message || "La información se ha actualizado correctamente.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Continuar al Paso 3",
        cancelButtonText: "Quedarme aquí",
        confirmButtonColor: '#27ae60'
      }).then((result) => {
        if (result.isConfirmed) {
            onSavedSuccess();
        }
      });

    } catch (error) { alert('Hubo un error al actualizar la información'); } finally { setIsLoading(false); }
  };

  // Definición de las secciones del formulario
  const sections = [
    {
      title: 'Información del Conductor',
      fields: [
        { label: 'Primer Apellido', name: 'condPrimerApellido' },
        { label: 'Segundo Apellido', name: 'condSegundoApellido' },
        { label: 'Nombres', name: 'condNombres' },
        { label: 'Cédula de Ciudadanía', name: 'condCedulaCiudadania' },
        { label: 'Departamento (Expedida)', name: 'condDeptoExpedida', options: departamentosUnicos },
        { label: 'Expedida en (Ciudad)', name: 'condExpedidaEn', options: getCiudadesPorDepto(formData['condDeptoExpedida']) },
        { label: 'Dirección', name: 'condDireccion' },
        { label: 'Departamento (Residencia)', name: 'condDeptoCiudad', options: departamentosUnicos },
        { label: 'Ciudad', name: 'condCiudad', options: getCiudadesPorDepto(formData['condDeptoCiudad']) },
        { label: 'Celular (10 dígitos)', name: 'condCelular', type: 'text', inputProps: { maxLength: 10, placeholder: 'Ej: 3001234567' } },
        { label: 'Correo Electrónico', name: 'condCorreo', type: 'email' },
        { label: 'EPS', name: 'condEps', options: epsColombia },
        { label: 'ARL', name: 'condArl', options: arlColombia },
        { label: 'No. Licencia', name: 'condNoLicencia', type: 'number' },
        { label: 'Fecha de Vencimiento', name: 'condFechaVencimientoLic', type: 'date' },
        { label: 'Categoría', name: 'condCategoriaLic', options: categoriasLicencia },
        { label: 'Grupo Sanguíneo RH', name: 'condGrupoSanguineo', options: gruposSanguineos },
      ],
    },
    {
      title: 'En Caso de Emergencia Avisar a',
      fields: [
        { label: 'Nombre', name: 'condNombreEmergencia' },
        { label: 'Celular (10 dígitos)', name: 'condCelularEmergencia', type: 'text', inputProps: { maxLength: 10 } },
        { label: 'Parentesco', name: 'condParentescoEmergencia', options: parentescos },
      ],
    },
    {
      title: 'Referencias Laborales',
      fields: [
        { label: 'Empresa', name: 'condEmpresaRef' },
        { label: 'Celular (10 dígitos)', name: 'condCelularRef', type: 'text', inputProps: { maxLength: 10 } },
        { label: 'Departamento', name: 'condDeptoCiudadRef', options: departamentosUnicos },
        { label: 'Ciudad', name: 'condCiudadRef', options: getCiudadesPorDepto(formData['condDeptoCiudadRef']) },
        { label: 'Nro. Viajes', name: 'condNroViajesRef', type: 'number' },
        // --- CORRECCIÓN ANTIGÜEDAD (MAX 30) ---
        { label: 'Años Antigüedad', name: 'condAntiguedadRef', type: 'number', inputProps: { min: 0, max: 30 } },
        { label: 'Merc. Transportada', name: 'condMercTransportada' },
      ],
    },
    {
      title: 'Datos del propietario',
      fields: [
        { label: 'Nombre/Razón', name: 'propNombre' },
        { label: 'Número documento', name: 'propDocumento', type: 'number' },
        { label: 'Departamento (Expedida)', name: 'propDeptoExpedida', options: departamentosUnicos },
        { label: 'Expedida en', name: 'propCiudadExpDoc', options: getCiudadesPorDepto(formData['propDeptoExpedida']) },
        { label: 'Correo', name: 'propCorreo', type: 'email' },
        { label: 'Celular (10 dígitos)', name: 'propCelular', type: 'text', inputProps: { maxLength: 10 } },
        { label: 'Dirección', name: 'propDireccion' },
        { label: 'Departamento', name: 'propDeptoCiudad', options: departamentosUnicos },
        { label: 'Ciudad', name: 'propCiudad', options: getCiudadesPorDepto(formData['propDeptoCiudad']) },
      ],
    },
    {
      title: 'Toggle Tenedor',
      fields: []
    },
    {
      title: 'Datos del Tenedor  (En caso que sea distinto al propietario)',
      fields: [
        { label: 'Nombre/Razón', name: 'tenedNombre' },
        { label: 'Número documento', name: 'tenedDocumento', type: 'number' },
        { label: 'Departamento (Expedida)', name: 'tenedDeptoExpedida', options: departamentosUnicos },
        { label: 'Expedida en', name: 'tenedCiudadExpDoc', options: getCiudadesPorDepto(formData['tenedDeptoExpedida']) },
        { label: 'Correo', name: 'tenedCorreo', type: 'email' },
        { label: 'Celular (10 dígitos)', name: 'tenedCelular', type: 'text', inputProps: { maxLength: 10 } },
        { label: 'Dirección', name: 'tenedDireccion' },
        { label: 'Departamento', name: 'tenedDeptoCiudad', options: departamentosUnicos },
        { label: 'Ciudad', name: 'tenedCiudad', options: getCiudadesPorDepto(formData['tenedDeptoCiudad']) },
      ],
    },
    {
      title: 'Datos del Vehiculo 🚛',
      fields: [
        // --- CORRECCIÓN MODELO (MAX 2026) ---
        { label: 'Modelo', name: 'vehModelo', type: 'number', inputProps: { min: 1990, max: 2026 } },
        { label: 'Marca', name: 'vehMarca' },
        { label: 'Tipo Carroceria', name: 'vehTipoCarroceria' },
        { label: 'Línea', name: 'vehLinea' },
        { label: 'Color', name: 'vehColor' },
        { label: 'Repotenciado', name: 'vehRepotenciado', options: ["Sí", "No"] },
        { label: 'Año Repotenciacion', name: 'vehAno', type: 'number', inputProps: { min: 1990, max: 2025 } },
        { label: 'Empresa Satelital', name: 'vehEmpresaSat' },
        { label: 'Usuario Satelital', name: 'vehUsuarioSat' },
        { label: 'Clave Satelital', name: 'vehClaveSat' },
      ],
    },
    {
      title: 'Datos del Remolque ⛟',
      fields: [
        { label: 'Placa Remolque', name: 'RemolPlaca' },
        { label: 'Modelo', name: 'RemolModelo', type: 'number' },
        { label: 'Clase/config', name: 'RemolClase' },
        { label: 'Tipo Carroceria', name: 'RemolTipoCarroceria' },
        { label: 'Alto (m)', name: 'RemolAlto', type: 'number', inputProps: { min: 1, max: 30 } },
        { label: 'Largo (m)', name: 'RemolLargo', type: 'number', inputProps: { min: 1, max: 30 } },
        { label: 'Ancho (m)', name: 'RemolAncho', type: 'number', inputProps: { min: 1, max: 30 } },
      ],
    },
  ];

  return (
    <div className="Datos-contenedor">
      <div className="Datos-avance-container">
        <span className="Datos-avance-texto">Avance: {calcularAvance()}%</span>
        <div className="Datos-barra-avance">
          <div className="Datos-progreso" style={{ width: `${calcularAvance()}%` }}></div>
        </div>
      </div>

      <form className="Datos-Form-datos-generales" onSubmit={handleSubmit}>
        {sections.map(({ title, fields }) => (
          <div key={title}>
            {title === "Toggle Tenedor" && (
              <div className="Datos-toggle-tenedor">
                <input type="checkbox" id="tenedorSameCheckbox" className="Datos-checkbox" checked={tenedorSame} onChange={toggleTenedorSame} />
                <label htmlFor="tenedorSameCheckbox" className="Datos-checkbox-label">
                  {tenedorSame ? "Editar datos del Tenedor" : "Rellenar los datos del tenedor con los mismos del Propietario"}
                </label>
              </div>
            )}
            {fields.length > 0 && (
              <FormSection title={title} fields={fields} formData={formData} handleChange={handleChange} disabled={title.includes("Tenedor") && tenedorSame} />
            )}
          </div>
        ))}
        <button className="Datos-botonActualizar" type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
          {isLoading ? "Guardando..." : "Guardar Datos"}
        </button>
      </form>
    </div>
  );
};

export default Datos;