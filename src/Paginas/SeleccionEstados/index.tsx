import { useContext } from 'react'
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
import { ContextoApp } from '../../Contexto/index'


const EstadosManifiestos = () => {

  const almacenVariables = useContext(ContextoApp)

  return (
    <div className='contenedorManifiestos'>
        <div className='cabecera'>
            <div><BsPersonCircle /></div>
            <div><h1>Hola  {almacenVariables?.nombre || 'Usuario'} </h1></div>
            <div><FaBell /></div>
        </div>

        <div className="contenedorEstadosManifiestos">
          {/* Envolver cada BotonEstado en un Link que dirija a /DetalleEstados */}
          <Link to="/Api" className="linkBoton">
            <BotonEstado nombreEstado="En tránsito" cantidad={1} icono={<FaTruck />} />
          </Link>

          <Link to="/DetalleEstados" className="linkBoton">
            <BotonEstado nombreEstado="Cumplidos" cantidad={1} icono={<IoDocumentsSharp />} />
          </Link>

          <Link to="/DetalleEstados" className="linkBoton">
            <BotonEstado nombreEstado="Liquidados" cantidad={2} icono={<BiMailSend />} />
          </Link>

          <Link to="/DetalleEstados" className="linkBoton">
            <BotonEstado nombreEstado="Pagados" cantidad={3} icono={<FcMoneyTransfer />} />
          </Link>

          {/* Botón de Salir */}
          <Link to="/" className='linkBoton'>
            <BotonSencillo type="button" texto="Salir" colorClass="rojo" />            
          </Link>
        </div>
    </div>
  );
};

export default EstadosManifiestos;
