import { useContext } from 'react';
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
import { ContextoApp } from '../../Contexto/index';

const EstadosManifiestos = () => {
  const almacenVariables = useContext(ContextoApp);

  // Función para obtener la primera palabra en mayúscula
  const obtenerPrimeraPalabra = (nombre: string | undefined): string => {
    if (!nombre) return 'Usuario';
    const primeraPalabra = nombre.split(' ')[0]; // Dividir por espacios y obtener la primera palabra
    return primeraPalabra.charAt(0).toUpperCase() + primeraPalabra.slice(1); // Capitalizar la primera letra
  };

  return (
    <div className='contenedorManifiestos'>
      <div className='cabecera'>
        <div><BsPersonCircle /></div>
        <div><h1>Hola {obtenerPrimeraPalabra(almacenVariables?.nombre)}</h1></div>
        <div><FaBell /></div>
      </div>

      <div className="contenedorEstadosManifiestos">
        {/* Envolver cada BotonEstado en un Link que dirija a /DetalleEstados */}
        <Link to="/Api" className="linkBoton">
          <BotonEstado nombreEstado="En tránsito" cantidad={1} icono={<FaTruck />} />
          {/* <BotonEstado nombreEstado="dar clic aqui para probar En tránsito" cantidad={0} icono={<FaTruck />} /> */}
        </Link>

        <Link to="/DetalleEstados" className="linkBoton">
          <BotonEstado nombreEstado="Estoy construyendo cumplidos" cantidad={0} icono={<IoDocumentsSharp />} />
          {/* <BotonEstado nombreEstado="En tránsito" cantidad={0} icono={<IoDocumentsSharp />} /> */}
        </Link>

        <Link to="/DetalleEstados" className="linkBoton">
          <BotonEstado nombreEstado="Estoy construyendo Liquidados" cantidad={0} icono={<BiMailSend />} />
        </Link>

        <Link to="/DetalleEstados" className="linkBoton">
          <BotonEstado nombreEstado="Estoy construyendo Pagados" cantidad={0} icono={<FcMoneyTransfer />} />
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
