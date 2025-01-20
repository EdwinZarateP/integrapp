import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ContextoApp } from "../../Contexto/index";
import ExtraccionTotal from "../../Funciones/ExtraccionTotal"; // Importa la función ExtraccionTotal
import logo from "../../Imagenes/albatros.png";
import HashLoader from "react-spinners/HashLoader";
import "./estilos.css";

const SalaEspera: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  const navigate = useNavigate();
  const { ejecutarExtraccion } = ExtraccionTotal(); // Extraer la función ejecutarExtraccion
  const [loading, setLoading] = useState(false); // Estado para manejar el HashLoader

  const irManifiestos = async () => {
    setLoading(true); // Mostrar el loader al iniciar la extracción
    try {
      console.log("Iniciando extracción total...");
      await ejecutarExtraccion(); // Ejecutar extracción total
      console.log("Extracción completada.");
      navigate("/SeleccionEstados"); // Navegar después de completar la extracción
    } catch (error) {
      console.error("Error durante la extracción total:", error);
      setLoading(false); 
    }
  };

  const irFormularioHojavida = async () => {
      navigate("/FormularioHojavida");
  };

  return (
    <div className="SalaEspera-contenedor">
      {loading ? (
        <div className="SalaEspera-loader">
          <HashLoader size={60} color={"rgb(141, 199, 63)"} loading={loading} />
          <p>Cargando información de tus manifiestos, por favor espera...</p>
        </div>
      ) : (
        <>
          <img src={logo} alt="Logo Integra" className="logo" />
          <h1 className="SalaEspera-titulo">Hola {almacenVariables?.nombre}</h1>
        
          <button className="SalaEspera-boton" onClick={irManifiestos}>
            Manifiestos
          </button>
          <button className="SalaEspera-boton" onClick={irFormularioHojavida} >
            Gestiona tus vehículos
          </button>

        </>
      )}
    </div>
  );
};

export default SalaEspera;
