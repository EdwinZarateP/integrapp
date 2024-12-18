import React from 'react';
import './estilos.css';


// Definir los props que el botón genérico va a recibir
interface PropiedadesBotonManifiestos {
  nombreEstado: string;
  // cantidad: number;
  icono: JSX.Element; 
}
console.log
const BotonEstado: React.FC<PropiedadesBotonManifiestos> = ({ nombreEstado, icono }) => {
  return (
    <div className='contenedorBotonEstado'>
        <div className='contenedorImagenEstado'>
            {icono} 
        </div>
        <div className='contenedorInformacionEstado'>
            <h2>{nombreEstado}</h2> 
        </div>


    </div>
  );
};

export default BotonEstado;
