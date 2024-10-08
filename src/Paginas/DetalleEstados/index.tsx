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
            manifiesto="00045354"
            fecha="02/10/2024"
            origen="Funza"
            destino="Medellin"
            placa="ANA83L"
            flete={1000000}
            anticipo={700000}
            reteFuente={10000}
            reteIca={10000}
            descuento={50000}
            saldo={230000}
        />

          <TarjetaDetalle
            manifiesto="00035353"
            fecha="02/09/2024"
            origen="Funza"
            destino="Barranquilla"
            placa="KOK83L"
            flete={1500000}
            anticipo={1200000}
            reteFuente={10000}
            reteIca={10000}
            descuento={50000}
            saldo={230000}
          />

<TarjetaDetalle
            manifiesto="00035353"
            fecha="02/09/2024"
            origen="Funza"
            destino="Bucaramanga"
            placa="KOK23L"
            flete={1200000}
            anticipo={1000000}
            reteFuente={10000}
            reteIca={10000}
            descuento={50000}
            saldo={130000}
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
