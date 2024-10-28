import { Link } from 'react-router-dom'; 
import { useContext } from 'react';
import BotonSencillo from '../../Componentes/BotonSencillo';
import './estilos.css';
import { FaBell } from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";
import TarjetaDetalle from '../../Componentes/TarjetaDetalle/index';
import { ContextoApp } from '../../Contexto/index';


const DetalleManifiestos = () => {
  const almacenVariables = useContext(ContextoApp);

  // Función para obtener la primera palabra en mayúscula
  const obtenerPrimeraPalabra = (nombre: string | undefined): string => {
    if (!nombre) return 'Usuario';
    const primeraPalabra = nombre.split(' ')[0];
    return primeraPalabra.charAt(0).toUpperCase() + primeraPalabra.slice(1);
  };


  return (
    <div className='contenedorManifiestos'>
      <div className='cabecera'>
        <div><BsPersonCircle /></div>
        <div><h5>{obtenerPrimeraPalabra(almacenVariables?.estado)}S</h5></div>
        <div><FaBell /></div>
      </div>

      <div className="contenedorDetalleManifiestos">
        <div>        
        <TarjetaDetalle estadoFiltrar={almacenVariables?.estado || ''}
        tenedor={almacenVariables?.tenedor || ''} />

        </div>

        <Link to="/SeleccionEstados" className='linkBoton'>
          <BotonSencillo type="button" texto="Volver" colorClass="rojo"/>            
        </Link>
      </div>
    </div>
  );
};

export default DetalleManifiestos;
