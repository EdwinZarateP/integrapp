import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContenedorTarjetas from "../../Componentes/ContenedorTarjetas/index";
import { ContextoApp } from "../../Contexto/index";
import './estilos.css';

const Estados: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  if (!almacenVariables) {
    return <p>Error: El contexto no está disponible.</p>;
  }

  // Verifica el contenido del contexto para depuración
  // console.log(
  //   "Contenido de DiccionarioManifiestosTodos:",
  //   almacenVariables.DiccionarioManifiestosTodos
  // );

  // Filtra los manifiestos con el estado actual del contexto global
  const manifiestosFiltrados = almacenVariables.DiccionarioManifiestosTodos.filter(
    (manifiesto) =>
      manifiesto.Estado_mft?.trim().toUpperCase() ===
      almacenVariables.estado?.trim().toUpperCase()
  );

  // Lógica para mostrar/ocultar el botón al hacer scroll
  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll < lastScroll) {
        setShowButton(true); // Aparece el botón al hacer scroll hacia arriba
      } else {
        setShowButton(false); // Desaparece al hacer scroll hacia abajo
      }
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="estados-contenedor">
      <ContenedorTarjetas manifiestos={manifiestosFiltrados} />

      {/* Botón flotante que navega a /SeleccionEstados */}
      {showButton && (
        <button
          className="boton-flotante"
          onClick={() => navigate("/SeleccionEstados")}
        >
          Volver
        </button>
      )}
    </div>
  );
};

export default Estados;
