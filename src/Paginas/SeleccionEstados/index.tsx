import { useContext } from "react";
import { Link } from "react-router-dom";
import BotonEstado from "../../Componentes/BotonEstados/index";
import BotonSencillo from "../../Componentes/BotonSencillo";
import "./estilos.css";
import { FaTruck } from "react-icons/fa6";
import { IoDocumentsSharp } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import logo from "../../Imagenes/albatros.png";
import { ContextoApp } from "../../Contexto/index";

const EstadosManifiestos = () => {
  const navigate = useNavigate();
  const almacenVariables = useContext(ContextoApp);

  const actualizaEstado = (estado: string) => {
    almacenVariables?.setEstado(estado);
  };


  // Función para manejar el cierre de sesión
  const cerrarSesion = () => {
    // Remover las cookies
    Cookies.remove("nombreIntegrapp");
    // Redirigir al inicio y recargar la página
    navigate("/");
  };

  return (
    <div className="contenedorManifiestos-principal">
      <header className="contenedorManifiestos-cabecera">
        <img
          src={logo}
          alt="Logo Integra"
          className="contenedorManifiestos-logo"
        />
        <div className="contenedorManifiestos-titulo">
          <h1>Integr</h1>
          <h1>App</h1>
        </div>
      </header>

      <div className="contenedorManifiestos-estados">
        <Link
          to="/Estados"
          className="contenedorManifiestos-linkBoton"
          onClick={() => actualizaEstado("TRANSITO")}
        >
          <BotonEstado nombreEstado="En tránsito" icono={<FaTruck />} />
        </Link>

        <Link
          to="/Estados"
          className="contenedorManifiestos-linkBoton"
          onClick={() => actualizaEstado("CUMPLIDO")}
        >
          <BotonEstado nombreEstado="Cumplidos" icono={<IoDocumentsSharp />} />
        </Link>

        <Link
          to="/Estados"
          className="contenedorManifiestos-linkBoton"
          onClick={() => actualizaEstado("LIQUIDADO")}
        >
          <BotonEstado nombreEstado="Liquidados" icono={<FaMoneyBillTransfer />} />
        </Link>

        {/* Botón de cierre de sesión */}
        <BotonSencillo
          type="button"
          texto="Salir"
          colorClass="rojo"
          onClick={cerrarSesion} // Asignar la función aquí
        />
      </div>
    </div>
  );
};

export default EstadosManifiestos;
