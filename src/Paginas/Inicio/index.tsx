import React from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { Lock, User, Car, ChevronRight } from 'lucide-react';
import HeaderLogo from '../../Componentes/HeaderLogo'; 
import logo from "../../Imagenes/albatros.png"; 
import './estilos.css';

const Inicio: React.FC = () => {
  const navigate = useNavigate();

  // --- NAVEGACIÓN SEGURIDAD ---
  const IrSeguridad = () => {
    const seguridadCookie = Cookies.get('seguridadId'); 
    
    if (!seguridadCookie) { 
      navigate("/LoginUsuariosSeguridad");
    } else {
      navigate("/revision");
    }
  };

  // --- NAVEGACIÓN PROPIETARIO ---
  const IrPropietarios = () => {
    const tenedorCookie = Cookies.get('tenedorIntegrapp');
    
    if (!tenedorCookie) {
      navigate("/loginpropietarios");
    } else {
      navigate("/SalaEspera");
    }
  };

  // --- NAVEGACIÓN CONDUCTOR ---
  const IrConductor = () => { 
    const conductorCookie = Cookies.get('conductorId');
    
    if (!conductorCookie) {
      navigate("/LoginConductores");
    } else {
      navigate("/PanelConductores");
    }
  };

  return (
    <div className="Inicio-contenedor">
      {/* Componente Header existente */}
      <HeaderLogo />

      {/* --- NUEVO LOGO 3D CENTRAL CON TÍTULO --- */}
      <div className="Inicio-logo-container-3d">
        <div className="Logo-3d-wrapper">
            <img src={logo} alt="Albatros Logo 3D" className="Inicio-logo-3d" />
            <div className="Logo-sombra-metalica"></div>
        </div>

        {/* --- NUEVO TÍTULO ANIMADO --- */}
        <div className="Inicio-titulo-3d">
            <span>INTEGR</span>
            <span>APP</span>
        </div>
      </div>
      {/* ---------------------------------------- */}

      {/* GRID DE OPCIONES */}
      <div className="Inicio-opciones">
        
        {/* TARJETA 1: SEGURIDAD (CANDADO) */}
        <div className="Inicio-card" onClick={IrSeguridad}>
          <div className="Inicio-card-icon-bg bg-seguridad">
            <Lock className="icono-ajuste" />
          </div>
          <h2>Seguridad</h2>
          <p>Validación de vehículos y monitoreo de procesos en tiempo real.</p>
          <div className="Inicio-card-action">
             Acceder <ChevronRight size={18} />
          </div>
        </div>

        {/* TARJETA 2: PROPIETARIO (PERSONA) */}
        <div className="Inicio-card" onClick={IrPropietarios}>
          <div className="Inicio-card-icon-bg bg-propietario">
            <User className="icono-ajuste" />
          </div>
          <h2>Modo Propietario</h2>
          <p>Consulta de manifiestos.</p>
          <div className="Inicio-card-action">
             Acceder <ChevronRight size={18} />
          </div>
        </div>

        {/* TARJETA 3: CONDUCTOR (CARRO) */}
        <div className="Inicio-card" onClick={IrConductor}>
          <div className="Inicio-card-icon-bg">
            <Car className="icono-ajuste" />
          </div>
          <h2>Modo Conductor</h2>
          <p>Gestión de vehículos y procesos.</p>
          <div className="Inicio-card-action">
             Acceder <ChevronRight size={18} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inicio;