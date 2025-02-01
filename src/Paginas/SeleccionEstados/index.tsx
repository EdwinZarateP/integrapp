import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import BotonEstado from "../../Componentes/BotonEstados/index";
import "./estilos.css";
import { FaTruck } from "react-icons/fa6";
import { IoDocumentsSharp } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import Cookies from 'js-cookie';
import logo from "../../Imagenes/albatros.png";
import { ContextoApp } from "../../Contexto/index";

const EstadosManifiestos = () => {
  const navigate = useNavigate();
  const almacenVariables = useContext(ContextoApp);

  const handleNavigation = (estado: string) => {
    almacenVariables?.setEstado(estado);
    navigate('/Estados');
  };

  // Función para manejar el cierre de sesión
  const cerrarSesion = () => {
    Cookies.remove("nombreIntegrapp");
    navigate("/");
  };

  return (
    <div className="contenedorManifiestos-principal">
      <header className="contenedorManifiestos-cabecera">
        <img src={logo} alt="Logo Integra" className="contenedorManifiestos-logo" />
        <div className="contenedorManifiestos-titulo">
          <h1>Integr</h1>
          <h1>App</h1>
        </div>
      </header>

      <div className="contenedorManifiestos-estados">
        <div onClick={() => handleNavigation("TRANSITO")} className="contenedorManifiestos-linkBoton">
          <BotonEstado nombreEstado="En tránsito" icono={<FaTruck />} />
        </div>

        <div onClick={() => handleNavigation("CUMPLIDO")} className="contenedorManifiestos-linkBoton">
          <BotonEstado nombreEstado="Cumplidos" icono={<IoDocumentsSharp />} />
        </div>

        <div onClick={() => handleNavigation("LIQUIDADO")} className="contenedorManifiestos-linkBoton">
          <BotonEstado nombreEstado="Liquidados" icono={<FaMoneyBillTransfer />} />
        </div>

      </div>
    </div>
  );
};

export default EstadosManifiestos;
