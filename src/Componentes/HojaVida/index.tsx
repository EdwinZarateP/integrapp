// import { ContextoApp } from '../../Contexto/index';
import React, { useState  } from "react";
// import React, { useState, useContext, useEffect  } from "react";
import P1InformarDocumentos from "./P1InformarDocumentos";
import P2RegistroPlaca from "./P2RegistroPlaca";
// import Swal from "sweetalert2";
// import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';
import "./estilos.css";


const CreacionVehiculo: React.FC = () => {
  // const correoUsuarioCookie = Cookies.get('correoUsuario');
  const [pasoActual, setPasoActual] = useState<number>(0);
  // const {latitud } = useContext(ContextoApp)!;
  // const navigate = useNavigate(); 

  // const redirigirInicio = () => {
  //   navigate("/");
  //   window.location.reload();
  // };


  const pasos = [
    <P1InformarDocumentos key="P1InformarDocumentos" />,
    <P2RegistroPlaca key="P2RegistroPlaca" />
  ];

  const avanzarPaso = () => {

    // Validación para el paso 6 si la descripcion tiene mas de 20 palabras
    // if (pasoActual === 1 && amenidadesGlobal.length === 0) {
    //   Swal.fire({
    //     icon: "warning",
    //     title: "Todos tenemos detallitos 🎸🎹🎺",
    //     text: "Dinos al menos una amenidad que dispongas",
    //     confirmButtonText: "Aceptar",
    //   });
    //   return;
    // }

    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const retrocederPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  return (
    <div className="CreacionVehiculo-contenedor">
      <div className="CreacionVehiculo-paso">{pasos[pasoActual]}</div>    
      <div className="CreacionVehiculo-progreso">
        <div className="CreacionVehiculo-progreso-barra" style={{ width: `${progreso}%` }}></div>
      </div>

      <div className="CreacionVehiculo-controles">
        <button
          className="CreacionVehiculo-boton-atras"
          onClick={retrocederPaso}
          disabled={pasoActual === 0}
        >
          Atrás
        </button>

        <button
          className="CreacionVehiculo-boton-siguiente"
          onClick={() => {
            if (pasoActual === 13) {
              alert("¡Glamping creado exitosamente!");
            } else {
              avanzarPaso();
            }
          }}
          style={pasoActual === 13 ? { display: 'none' } : {}}
        >
          {pasoActual === 13 ? "Terminar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
};

export default CreacionVehiculo;
