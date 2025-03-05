import './estilos.css';
import CreacionVehiculo from '../../Componentes/CreacionVehiculo/index';
import HeaderIcono from '../../Componentes/HeaderIcono/index';

const FormularioHojavida: React.FC = () => {

  return (
    <div className="FormularioHojavida-Contenedor">
      <HeaderIcono descripcion='Creación de vehículo'/>
      <CreacionVehiculo />    
    </div>
  );
};

export default FormularioHojavida;
