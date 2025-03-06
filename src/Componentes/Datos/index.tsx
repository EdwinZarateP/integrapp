import React from 'react';
import './estilos.css';

// Definir la interfaz para los campos de entrada
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
}

// Componente reutilizable para los inputs
const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text' }) => (
  <div className="input-container">
    <label>{label}</label>
    <input type={type} name={name} />
  </div>
);

// Definir la interfaz para las secciones del formulario
interface FormSectionProps {
  title: string;
  fields: InputFieldProps[];
}

// Componente para secciones del formulario
const FormSection: React.FC<FormSectionProps> = ({ title, fields }) => (
  <div className="form-section">
    <h4>{title}</h4>
    <div className="fields-container">
      {fields.map(({ label, name, type }) => (
        <InputField key={name} label={label} name={name} type={type} />
      ))}
    </div>
  </div>
);

const Datos: React.FC = () => {
  const sections: FormSectionProps[] = [
    {
      title: 'Información del Conductor',
      fields: [
        { label: 'Primer Apellido', name: 'condPrimerApellido' },
        { label: 'Segundo Apellido', name: 'condSegundoApellido' },
        { label: 'Nombres', name: 'condNombres' },
        { label: 'Cédula de Ciudadanía', name: 'condCedulaCiudadania' },
        { label: 'Expedida en', name: 'condExpedidaEn' },
        { label: 'Dirección', name: 'condDireccion' },
        { label: 'Ciudad', name: 'condCiudad' },
        { label: 'Celular', name: 'condCelular' },
        { label: 'Correo Electrónico', name: 'condCorreo', type: 'email' },
        { label: 'EPS y ARL', name: 'condEpsArl' },
        { label: 'No. Licencia', name: 'condNoLicencia' },
        { label: 'Fecha de Vencimiento', name: 'condFechaVencimientoLic', type: 'date' },
        { label: 'Categoría', name: 'condCategoriaLic' },
        { label: 'Grupo Sanguíneo RH', name: 'condGrupoSanguineo' },
      ],
    },
    {
      title: 'En Caso de Emergencia Avisar a',
      fields: [
        { label: 'Nombre', name: 'condNombreEmergencia' },
        { label: 'Celular', name: 'condCelularEmergencia' },
        { label: 'Parentesco', name: 'condParentescoEmergencia' },
      ],
    },
    {
      title: 'Referencias Laborales',
      fields: [
        { label: 'Empresa', name: 'condEmpresaRef' },
        { label: 'Celular', name: 'condCelularRef' },
        { label: 'Ciudad', name: 'condCiudadRef' },
        { label: 'Nro. Viajes', name: 'condNroViajesRef', type: 'number' },
        { label: 'Antigüedad', name: 'condAntiguedadRef' },
        { label: 'Merc. Transportada', name: 'condMercTransportada' },
      ],
    },
    {
      title: 'Datos del propietario',
      fields: [
        { label: 'Nombre/Razón', name: 'propNombre' },
        { label: 'Número documento', name: 'propDocumento' },
        { label: 'Expedida En', name: 'propCiudadExpDoc' },
        { label: 'Correo', name: 'propCorreo', type: 'email' },
        { label: 'Celular', name: 'propCelular'},
        { label: 'Direccion', name: 'propDireccion'},
        { label: 'Ciudad', name: 'propCiudad' },
      ],
    },
    {
      title: 'Datos del Tenedor  (En caso que sea distinto al propietario)',
      fields: [
        { label: 'Nombre/Razón', name: 'tenedNombre' },
        { label: 'Número documento', name: 'tenedDocumento' },
        { label: 'Expedida en', name: 'tenedCiudadExpDoc' },
        { label: 'Correo', name: 'tenedCorreo', type: 'email' },
        { label: 'Celular', name: 'tenedCelular'},
        { label: 'Direccion', name: 'tenedDireccion'},
        { label: 'Ciudad', name: 'tenedCiudad' },
      ],
    },
    {
      title: 'Datos del Vehiculo',
      fields: [
        { label: 'Modelo', name: 'vehModelo' },
        { label: 'Marca', name: 'vehMarca' },
        { label: 'Tipo Carroceria', name: 'vehTipoCarroceria' },        
        { label: 'Linea', name: 'vehLinea'},
        { label: 'Color', name: 'vehColor' },
        { label: 'Repotenciado', name: 'vehRepotenciado'},
        { label: 'Ano', name: 'vehAno' },
        { label: 'Empresa Satelital', name: 'vehEmpresaSat' },
        { label: 'Usuario Satelital', name: 'vehUsuarioSat' },
        { label: 'Clave Satelital', name: 'vehClaveSat' },
      ],
    },
    {
      title: 'Datos del Remolque',
      fields: [
        { label: 'Placa Remolque', name: 'RemolPlaca' },
        { label: 'Modelo', name: 'RemolModelo' },
        { label: 'Clase/config', name: 'RemolClase' },        
        { label: 'Tipo Carroceria', name: 'RemolTipoCarroceria'},
        { label: 'Alto', name: 'RemolAlto' },
        { label: 'Largo', name: 'RemolLargo'},
        { label: 'Ancho', name: 'RemolAncho' }
      ],
    },
  ];

  return (
    <div className="Datos-contenedor">
      <form className="Form-datos-generales">
        {sections.map(({ title, fields }) => (
          <FormSection key={title} title={title} fields={fields} />
        ))}
      </form>
    </div>
  );
};

export default Datos;