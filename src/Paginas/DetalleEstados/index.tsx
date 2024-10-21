import { Link } from 'react-router-dom'; // Importar Link de react-router-dom
import BotonSencillo from '../../Componentes/BotonSencillo';
import './estilos.css';
import { FaBell } from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";
import TarjetaDetalle from '../../Componentes/TarjetaDetalle/index';

const DetalleManifiestos = () => {
  return (
    <div className='contenedorManifiestos'>
        <div className='cabecera'>
            <div><BsPersonCircle /></div>
            <div><h1>Hola Nestor</h1></div>
            <div><FaBell /></div>
        </div>

        <div className="contenedorDetalleManifiestos">

        <div>        
          <TarjetaDetalle
            manifiesto="00035353"
            fecha={new Date("2024-10-02")} 
            origen="Funza"
            destino="Bucaramanga"
            placa="KOK23L"
            flete={1200000}
            anticipo={1000000}
            reteFuente={10000}
            reteIca={10000}
            descuento={50000}
            saldo={130000}
            fecha_saldo={new Date("2024-10-02")} 
          />
        </div>
       
        {/* Envolver el botón dentro de Link */}
        <Link to="/SeleccionEstados" className='linkBoton'>
          <BotonSencillo type="button" texto="Volver" colorClass="rojo"/>            
        </Link>
        
        </div>
    </div>
  );
};

export default DetalleManifiestos;
