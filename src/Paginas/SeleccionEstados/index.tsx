import { useContext } from 'react';
import { Link } from 'react-router-dom'; // Importar Link de react-router-dom
import BotonEstado from '../../Componentes/BotonEstados/index';
import BotonSencillo from '../../Componentes/BotonSencillo';
import './estilos.css';
import { BiMailSend } from "react-icons/bi";
import { FaTruck } from "react-icons/fa6";
import { IoDocumentsSharp } from "react-icons/io5";
import { FcMoneyTransfer } from "react-icons/fc";
// import { FaBell } from "react-icons/fa";
// import { BsPersonCircle } from "react-icons/bs";
import { ContextoApp } from '../../Contexto/index';

const EstadosManifiestos = () => {
  const almacenVariables = useContext(ContextoApp);

  // Función para obtener la primera palabra en mayúscula
  const obtenerPrimeraPalabra = (nombre: string | undefined): string => {
    if (!nombre) return 'Usuario';
    const primeraPalabra = nombre.split(' ')[0]; // Dividir por espacios y obtener la primera palabra
    return primeraPalabra.charAt(0).toUpperCase() + primeraPalabra.slice(1); // Capitalizar la primera letra
  };

  const actualizaTransito = () => {
    almacenVariables?.setEstado("TRANSITO"); // Actualizar el estado en el contexto
  };

  const actualizaCumplidos = () => {
    almacenVariables?.setEstado("CUMPLIDO"); // Actualizar el estado en el contexto
  };

  const actualizaLiquidado = () => {
    almacenVariables?.setEstado("LIQUIDADO"); // Actualizar el estado en el contexto
  };

  const actualizaPagado = () => {
    almacenVariables?.setEstado("ANULADO"); // Actualizar el estado en el contexto
  };


  return (
    <div className='contenedorManifiestos1'>
      <div className='cabecera'>
        {/* <div><BsPersonCircle /></div> */}
        <div><h1>Hola {obtenerPrimeraPalabra(almacenVariables?.nombre)}</h1></div>
        {/* <div><FaBell /></div> */}
      </div>

      <div className="contenedorEstadosManifiestos">
        {/* Envolver cada BotonEstado en un Link que dirija a /DetalleEstados */}
        <Link to="/DetalleEstados" className="linkBoton" onClick={actualizaTransito}>
          <BotonEstado nombreEstado="En tránsito" icono={<FaTruck />} />
        </Link>

        <Link to="/DetalleEstados" className="linkBoton" onClick={actualizaCumplidos}>
          <BotonEstado nombreEstado="Cumplidos"  icono={<IoDocumentsSharp />} />
        </Link>

        <Link to="/DetalleEstados" className="linkBoton" onClick={actualizaLiquidado}>
          <BotonEstado nombreEstado="Liquidados"  icono={<BiMailSend />} />
        </Link>

        {/* <Link to="/DetalleEstados" className="linkBoton" onClick={actualizaPagado}>
          <BotonEstado nombreEstado="Pagados"  icono={<FcMoneyTransfer />} />
        </Link> */}

        {/* Botón de Salir */}
        <Link to="/" className='linkBoton'>
          <BotonSencillo type="button" texto="Salir" colorClass="rojo" />
        </Link>
      </div>
    </div>
  );
};

export default EstadosManifiestos;
