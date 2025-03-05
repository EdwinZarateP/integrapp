import albatros from "../../Imagenes/albatros.png"
import { useNavigate } from "react-router-dom";
import "./estilos.css";

// Definir la propiedad 'nombreMarca' como string
interface HeaderIconoProps {
    descripcion: string;
}

const HeaderIcono: React.FC<HeaderIconoProps> = ({ descripcion }) => {

  const navigate = useNavigate();

  const irAInicio = () => {
    navigate("/"); // Navega a la ruta "/"
    window.location.reload(); // Recarga la página
  };   

  return (
    <div className="HeaderIcono-contenedor">
      <header className="HeaderIcono-Header">
        <div className="HeaderIcono-izquierda" onClick={irAInicio}>
          <img src={albatros} alt="Logo" className="HeaderIcono-logo" />
          <span className="HeaderIcono-nombreMarca">{descripcion}</span>
        </div>
      </header>
    </div>
  );
};

export default HeaderIcono;
