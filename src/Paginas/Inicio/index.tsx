import React from 'react';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import logo from "../../Imagenes/albatros.png";
import './estilos.css';

const Inicio: React.FC = () => {
  const CodigoTenedorCookie = Cookies.get('tenedorIntegrapp');
  const navigate = useNavigate();

  const mostrarAlerta = () => {
    Swal.fire({
      title: "🚧 En construcción",
      text: "Estamos trabajando en construir este módulo, por ahora solo tenemos el modo propietarios",
      icon: "info",
      confirmButtonText: "Entendido",
    });
  };

  const IrPropietarios = () => {
    if(!CodigoTenedorCookie){
      navigate("/InicioPropietarios");
    }else{
      navigate("/SalaEspera");
    }
  };

  const IrConductores = () => {
    // navigate("/InicioPropietarios");
    mostrarAlerta()
  };

  const IrClientes = () => {
    // navigate("/InicioPropietarios");
    mostrarAlerta()
  };

  return (
    <div className="Inicio-contenedor">
      <div className="Inicio-cabecera">
        <img src={logo} alt="Logo Albatros" className="Inicio-logo" />
        <div className="Inicio-titulo">
            <h1>Integr</h1>
            <h1>App</h1>
          </div>
      </div>
      <div className="Inicio-opciones">
        <div className="Inicio-opcion"  onClick={IrConductores}>
          <h2>🚚 Modo Conductor</h2>
          <p>Mira que viajes hay disponibles para que los tomes</p>
        </div>
        <div className="Inicio-opcion"  onClick={IrPropietarios}>
          <h2>👨🏻‍💼Modo Propietario</h2>
          <p>Registra tus vehículos, consulta tus manifiestos</p>
        </div>
        <div className="Inicio-opcion"  onClick={IrClientes}>
          <h2>📦Modo Cliente</h2>
          <p>Encuentra el vehículo a tu cargas fácilmente.</p>
        </div>
      </div>
    </div>
  );
};
export default Inicio;