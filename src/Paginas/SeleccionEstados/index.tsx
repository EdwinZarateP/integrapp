import { Link } from 'react-router-dom'; // Importar Link de react-router-dom
import BotonEstado from '../../Componentes/BotonEstados/index';
import BotonSencillo from '../../Componentes/BotonSencillo';
import './estilos.css';
import { BiMailSend } from "react-icons/bi";
import { FaTruck } from "react-icons/fa6";
import { IoDocumentsSharp } from "react-icons/io5";
import { FcMoneyTransfer } from "react-icons/fc";
import { FaBell } from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";

const EstadosManifiestos = () => {
  return (
    <div className='contenedorManifiestos'>
        <div className='cabecera'>
            <div><BsPersonCircle /></div>
            <div><h1>Hola Nestor</h1></div>
            <div><FaBell /></div>
        </div>

        {/* <h3>Estado de manifiestos:</h3> */}

        <div className="contenedorEstadosManifiestos">
        <BotonEstado nombreEstado="En tránsito" cantidad={1} icono={<FaTruck />} />
        <BotonEstado nombreEstado="Cumplidos" cantidad={1} icono={<IoDocumentsSharp />} />
        <BotonEstado nombreEstado="Liquidados" cantidad={2} icono={<BiMailSend />} />
        <BotonEstado nombreEstado="Pagados" cantidad={3} icono={<FcMoneyTransfer />} />

        {/* Envolver el botón dentro de Link */}
        <Link to="/" className='linkBoton'>
            <BotonSencillo type="button" texto="Salir" colorClass="rojo"/>            
        </Link>
        
        </div>
    </div>
  );
};

export default EstadosManifiestos;
