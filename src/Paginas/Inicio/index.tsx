import React from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import logo from "../../Imagenes/albatros.png";
import './estilos.css';

const Inicio: React.FC = () => {
  const CodigoTenedorCookie = Cookies.get('tenedorIntegrapp');
  const navigate = useNavigate();

  const IrPropietarios = () => {
    if (!CodigoTenedorCookie) {
      navigate("/loginpropietarios");
    } else {
      navigate("/SalaEspera");
    }
  };

  const IrSeguridad = () => {
    if (!CodigoTenedorCookie) {
      navigate("/LoginUsuariosSeguridad");
    } else {
      navigate("/revision");
    }
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
        <div className="Inicio-opcion" onClick={IrSeguridad}>
          <h2>🔒</h2>
          <h2>Seguridad</h2>
          <p>Mira el proceso y el estado que tienen el o los vehiculos registrado</p>
        </div>
        <div className="Inicio-opcion" onClick={IrPropietarios}>
          <h2>👨🏻‍💼Modo Propietario</h2>
          <p>Registra tus vehículos, consulta tus manifiestos</p>
        </div>
        {/*
        <div className="Inicio-opcion" onClick={IrEmpleados}>
          <h2>📦Empleados</h2>
          <p>Descarga tu certificado laboral</p>
        </div>
        */}
      </div>
    </div>
  );
};

export default Inicio;
