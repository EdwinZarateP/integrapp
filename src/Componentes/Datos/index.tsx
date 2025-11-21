import { useState, useEffect } from 'react';
import municipios from "../../Componentes/Municipios/municipios.json";
import Swal from 'sweetalert2';
import './estilos.css';

// Extensión de las props para inputs para permitir atributos extra
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[]; // Si tiene opciones, renderiza un <select>
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

// Componente para renderizar cada campo de entrada
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

// Interfaz para cada sección del formulario
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

// Componente para renderizar una sección completa (título y campos)
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

// Interfaz de las props del componente Datos
interface DatosProps {
  placa: string;
  onValidChange?: (isValid: boolean) => void; 
  onCedulaConductorChange?: (cedula: string) => void; 
}

const Datos: React.FC<DatosProps> = ({ placa, onValidChange, onCedulaConductorChange  }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenedorSame, setTenedorSame] = useState<boolean>(false);


  // Definición de campos obligatorios
  const requiredFields = [
    // Información del Conductor
    'condPrimerApellido', 'condSegundoApellido', 'condNombres',
    'condCedulaCiudadania', 'condExpedidaEn', 'condDireccion',
    'condCiudad', 'condCelular', 'condCorreo', 'condEps', 'condArl',
    'condNoLicencia', 'condFechaVencimientoLic', 'condCategoriaLic',
    'condGrupoSanguineo',
    // En caso de emergencia
    'condNombreEmergencia', 'condCelularEmergencia', 'condParentescoEmergencia',
    // Referencias Laborales
    'condEmpresaRef', 'condCelularRef', 'condCiudadRef', 'condNroViajesRef', 'condAntiguedadRef', 'condMercTransportada',
    // Datos del Propietario
    'propNombre', 'propDocumento', 'propCiudadExpDoc', 'propCorreo', 'propCelular', 'propDireccion', 'propCiudad',
    // Datos del Tenedor (aunque se pueda copiar, se valida igualmente)
    'tenedNombre', 'tenedDocumento', 'tenedCiudadExpDoc', 'tenedCorreo', 'tenedCelular', 'tenedDireccion', 'tenedCiudad',
    // Datos del Vehículo
    'vehModelo', 'vehMarca', 'vehTipoCarroceria', 'vehLinea', 'vehColor', 'vehRepotenciado', 'vehAno', 'vehEmpresaSat', 'vehUsuarioSat', 'vehClaveSat',
    // Datos del Remolque
    'RemolPlaca', 'RemolModelo', 'RemolClase', 'RemolTipoCarroceria', 'RemolAlto', 'RemolLargo', 'RemolAncho'
  ];

  // Cálculo del avance general (porcentaje de campos diligenciados)
  const calcularAvance = () => {
    const total = requiredFields.length;
    const completados = requiredFields.filter(field => formData[field] && formData[field].trim() !== "").length;
    return Math.round((completados / total) * 100);
  };

  // Función para validar que todos los campos requeridos tengan datos
  const isFormValid = () => {
    return requiredFields.every((field) => formData[field] && formData[field].trim() !== "");
  };

  useEffect(() => {
    if (onValidChange) {
      onValidChange(isFormValid());
    }

    // 👉 Enviar la cédula del conductor hacia arriba
    if (onCedulaConductorChange) {
      onCedulaConductorChange(formData["condCedulaCiudadania"] || "");
    }
  }, [formData, onValidChange, onCedulaConductorChange]);

  // Carga inicial de datos del vehículo mediante la placa
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://integrappi-dvmh.onrender.com/vehiculos/obtener-vehiculo/${placa}`);
        if (!response.ok) {
          throw new Error("Error al obtener la información del vehículo");
        }
        const data = await response.json();
        if (data.data) {
          setFormData((prevData) => ({
            ...prevData,
            ...data.data
          }));
        }
      } catch (error) {
        console.error("Error cargando la información del vehículo:", error);
      }
    };
    fetchData();
  }, [placa]);

  // Manejador para los cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (tenedorSame && e.target.name.startsWith("tened")) return;
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value.trim()
    }));
  };

  // Función para copiar los datos del propietario en los campos del tenedor
  const handleCopiarDatos = () => {
    setFormData((prevData) => ({
      ...prevData,
      tenedNombre: prevData.propNombre || "",
      tenedDocumento: prevData.propDocumento || "",
      tenedCiudadExpDoc: prevData.propCiudadExpDoc || "",
      tenedCorreo: prevData.propCorreo || "",
      tenedCelular: prevData.propCelular || "",
      tenedDireccion: prevData.propDireccion || "",
      tenedCiudad: prevData.propCiudad || ""
    }));
  };

  // Toggle para "Tenedor = Propietario"
  const toggleTenedorSame = () => {
    const newState = !tenedorSame;
    setTenedorSame(newState);
    if (newState) handleCopiarDatos();
  };

  // Manejador para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value || ""])
      );
      const response = await fetch(`https://integrappi-dvmh.onrender.com/vehiculos/actualizar-informacion/${placa}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedFormData),
      });
      const result = await response.json();
      Swal.fire({
        title: "Hola",
        text: result.message || "Datos actualizados correctamente",
        icon: "success",
        confirmButtonText: "OK"
      });      
    } catch (error) {
      alert('Hubo un error al actualizar la información');
    } finally {
      setIsLoading(false);
    }
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
        { label: 'Expedida en', name: 'condExpedidaEn', options: municipios.map(m => m.CIUDAD) },
        { label: 'Dirección', name: 'condDireccion' },
        { label: 'Ciudad', name: 'condCiudad', options: municipios.map(m => m.CIUDAD) },
        { label: 'Celular', name: 'condCelular', type: 'number' },
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
        { label: 'Celular', name: 'condCelularEmergencia', type: 'number' },
        { label: 'Parentesco', name: 'condParentescoEmergencia', options: parentescos },
      ],
    },
    {
      title: 'Referencias Laborales',
      fields: [
        { label: 'Empresa', name: 'condEmpresaRef' },
        { label: 'Celular', name: 'condCelularRef', type: 'number' },
        { label: 'Ciudad', name: 'condCiudadRef', options: municipios.map(m => m.CIUDAD) },
        { label: 'Nro. Viajes', name: 'condNroViajesRef', type: 'number' },
        { label: 'Años Antigüedad', name: 'condAntiguedadRef', type: 'number' },
        { label: 'Merc. Transportada', name: 'condMercTransportada' },
      ],
    },
    {
      title: 'Datos del propietario',
      fields: [
        { label: 'Nombre/Razón', name: 'propNombre' },
        { label: 'Número documento', name: 'propDocumento', type: 'number' },
        { label: 'Expedida en', name: 'propCiudadExpDoc', options: municipios.map(m => m.CIUDAD) },
        { label: 'Correo', name: 'propCorreo', type: 'email' },
        { label: 'Celular', name: 'propCelular', type: 'number' },
        { label: 'Dirección', name: 'propDireccion' },
        { label: 'Ciudad', name: 'propCiudad', options: municipios.map(m => m.CIUDAD) },
      ],
    },
    {
      title: 'Toggle Tenedor',
      fields: [] // Solo para mostrar el toggle
    },
    {
      title: 'Datos del Tenedor  (En caso que sea distinto al propietario)',
      fields: [
        { label: 'Nombre/Razón', name: 'tenedNombre' },
        { label: 'Número documento', name: 'tenedDocumento', type: 'number' },
        { label: 'Expedida en', name: 'tenedCiudadExpDoc', options: municipios.map(m => m.CIUDAD) },
        { label: 'Correo', name: 'tenedCorreo', type: 'email' },
        { label: 'Celular', name: 'tenedCelular', type: 'number' },
        { label: 'Dirección', name: 'tenedDireccion' },
        { label: 'Ciudad', name: 'tenedCiudad', options: municipios.map(m => m.CIUDAD) },
      ],
    },
    {
      title: 'Datos del Vehiculo 🚛',
      fields: [
        { label: 'Modelo', name: 'vehModelo', type: 'number', inputProps: { min: 1990, max: 2040 } },
        { label: 'Marca', name: 'vehMarca' },
        { label: 'Tipo Carroceria', name: 'vehTipoCarroceria' },
        { label: 'Línea', name: 'vehLinea' },
        { label: 'Color', name: 'vehColor' },
        { label: 'Repotenciado', name: 'vehRepotenciado', options: ["Sí", "No"] },
        { label: 'Año Repotenciacion', name: 'vehAno', type: 'number', inputProps: { min: 1990, max: 2040 } },
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
      {/* Barra de progreso sticky en la parte superior */}
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
              <input
                type="checkbox"
                id="tenedorSameCheckbox"
                className="Datos-checkbox"
                checked={tenedorSame}
                onChange={toggleTenedorSame}
              />
              <label htmlFor="tenedorSameCheckbox" className="Datos-checkbox-label">
                {tenedorSame
                  ? "Editar datos del Tenedor"
                  : "Rellenar los datos del tenedor con los mismos del Propietario"}
              </label>
            </div>
            )}
            {fields.length > 0 && (
              <FormSection
                title={title}
                fields={fields}
                formData={formData}
                handleChange={handleChange}
                disabled={title.includes("Tenedor") && tenedorSame}
              />
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
