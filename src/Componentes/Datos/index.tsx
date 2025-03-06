import { useState, useEffect } from 'react';
import municipios from "../../Componentes/Municipios/municipios.json";
import './estilos.css';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[]; // Si tiene opciones, renderiza un <select>
}

const categoriasLicencia = ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"];
const gruposSanguineos = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const epsColombia = ["Sura", "Sanitas", "Compensar", "Coomeva", "Salud Total"];
const arlColombia = ["Positiva", "Sura", "Colpatria", "Bolívar", "Axa Colpatria"];
const parentescos = ["Padre", "Madre", "Hijo(a)", "Hermano(a)", "Esposo(a)", "Abuelo(a)", "Tio(a)","Otro"];

const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', value, onChange, options }) => (
  <div className="input-container">
    <label>{label}</label>
    {options ? (
      <select name={name} value={value} onChange={onChange}>
        <option value="">Seleccione...</option>
        {options.map((option, idx) => (
          <option key={idx} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} />
    )}
  </div>
);

interface FormSectionProps {
  title: string;
  fields: { label: string; name: string; type?: string; options?: string[] }[];
  formData: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FormSection: React.FC<FormSectionProps> = ({ title, fields, formData, handleChange }) => (
  <div className="form-section">
    <h4>{title}</h4>
    <div className="fields-container">
      {fields.map(({ label, name, type, options }) => (
        <InputField
          key={name}
          label={label}
          name={name}
          type={type}
          value={formData[name] || ""}
          onChange={handleChange}
          options={options}
        />
      ))}
    </div>
  </div>
);

// Componente principal
interface DatosProps {
  placa: string;
}

const Datos: React.FC<DatosProps> = ({ placa }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value.trim()
    }));
  };

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
      alert(result.message || 'Datos actualizados correctamente');
    } catch (error) {
      alert('Hubo un error al actualizar la información');
    } finally {
      setIsLoading(false);
    }
  };

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
        { label: 'Celular', name: 'propCelular', type: 'number'},
        { label: 'Direccion', name: 'propDireccion'},  
        { label: 'Ciudad', name: 'propCiudad', options: municipios.map(m => m.CIUDAD) },
      ],
    },
    {
      title: 'Datos del Tenedor  (En caso que sea distinto al propietario)',
      fields: [
        { label: 'Nombre/Razón', name: 'tenedNombre' },
        { label: 'Número documento', name: 'tenedDocumento' },  
        { label: 'Ciudad', name: 'tenedCiudadExpDoc', options: municipios.map(m => m.CIUDAD) },
        { label: 'Correo', name: 'tenedCorreo', type: 'email' },
        { label: 'Celular', name: 'tenedCelular', type: 'number'},
        { label: 'Direccion', name: 'tenedDireccion'},    
        { label: 'Ciudad', name: 'tenedCiudad', options: municipios.map(m => m.CIUDAD) },                
      ],
    },
    {
      title: 'Datos del Vehiculo 🚛',
      fields: [
        { label: 'Modelo', name: 'vehModelo', type: 'number' },
        { label: 'Marca', name: 'vehMarca' },
        { label: 'Tipo Carroceria', name: 'vehTipoCarroceria' },
        { label: 'Linea', name: 'vehLinea'},
        { label: 'Color', name: 'vehColor' },
        { label: 'Repotenciado', name: 'vehRepotenciado', options: ["Sí", "No"] },
        { label: 'Ano', name: 'vehAno', type: 'number' },
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
        { label: 'Tipo Carroceria', name: 'RemolTipoCarroceria'},
        { label: 'Alto', name: 'RemolAlto', type: 'number' },
        { label: 'Largo', name: 'RemolLargo', type: 'number'},
        { label: 'Ancho', name: 'RemolAncho', type: 'number' }
      ],
    },
  ];

  return (
    <div className="Datos-contenedor">
      <form className="Form-datos-generales" onSubmit={handleSubmit}>
        {sections.map(({ title, fields }) => (
          <FormSection
            key={title}
            title={title}
            fields={fields}
            formData={formData}
            handleChange={handleChange}
          />
        ))}
        <button className="Datos-botonActualizar" type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
};

export default Datos;
