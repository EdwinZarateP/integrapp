import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from '../Inicio/index';
import Registro from '../Registro/index';
import EstadosManifiestos from '../SeleccionEstados/index';
import DetalleEstados from '../DetalleEstados/index';
import VulcanoApiComponent from '../Api/index';
import Olvidoclave from '../Olvidoclave/index';
import NoEncontrado from '../NoEncontrado/index';
import { ProveedorVariables } from '../../Contexto/index';
// import './App.css';

const App: React.FC = () => {
  return (
    // Encerramos todo en el ProveedorVariables para que puedan acceder a ellas
    <ProveedorVariables 
      hijo={
    <Router basename="/integrapp">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Olvidoclave" element={<Olvidoclave />} />
        <Route path="/SeleccionEstados" element={<EstadosManifiestos />} />
        <Route path="/DetalleEstados" element={<DetalleEstados />} />
        <Route path="/Api" element={<VulcanoApiComponent />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Router>
    }
  />
  );
}

export default App;
