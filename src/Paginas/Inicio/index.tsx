import React from 'react';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { Lock, User, Car, ChevronRight } from 'lucide-react';
// CORRECCIÓN: Importar el componente, NO el archivo .css
import HeaderLogo from '../../Componentes/HeaderLogo'; 
import './estilos.css';

const Inicio: React.FC = () => {
  const navigate = useNavigate();

  // --- NAVEGACIÓN SEGURIDAD ---
  const IrSeguridad = () => {
    // Verificamos si existe cookie de seguridad
    const seguridadCookie = Cookies.get('seguridadId'); 
    
    if (!seguridadCookie) { 
      // Si no hay sesión, ir al LOGIN DE SEGURIDAD
      navigate("/LoginUsuariosSeguridad");
    } else {
      // Si ya hay sesión, ir al panel de revisión
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
      {/* Ahora sí renderizará el componente correctamente */}
      <HeaderLogo />

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
          <p>Creación de vehículos y Gestión.</p>
          <div className="Inicio-card-action">
             Acceder <ChevronRight size={18} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inicio;