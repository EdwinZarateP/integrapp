import { useContext } from "react";
import { Link } from "react-router-dom";
import BotonEstado from "../../Componentes/BotonEstados/index";
import BotonSencillo from "../../Componentes/BotonSencillo";
import "./estilos.css";
import { FaTruck } from "react-icons/fa6";
import { IoDocumentsSharp } from "react-icons/io5";
import { GiCash } from "react-icons/gi";
import logo from "../../Imagenes/albatros.png";
import { ContextoApp } from "../../Contexto/index";

const EstadosManifiestos = () => {
  const almacenVariables = useContext(ContextoApp);

  const actualizaEstado = (estado: string) => {
    almacenVariables?.setEstado(estado);
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
          <BotonEstado nombreEstado="Liquidados y saldos" icono={<GiCash />} />
        </Link>

        {/* <Link
          to="/Estados"
          className="contenedorManifiestos-linkBoton"
          onClick={() => actualizaEstado("PAGADO")}
        >
          <BotonEstado nombreEstado="Historico pagado" icono={<BiMailSend />} />
        </Link> */}

        <Link to="/" className="contenedorManifiestos">
          <BotonSencillo type="button" texto="Salir" colorClass="rojo" />
        </Link>
      </div>
    </div>
  );
};

export default EstadosManifiestos;
