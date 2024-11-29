import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from '../Inicio/index';
import Registro from '../Registro/index';
import EstadosManifiestos from '../SeleccionEstados/index';
import Estados from '../EstadosManifiestos/index';
import SalaEspera from '../SalaEspera/index';
// import DetalleEstados from '../DetalleEstados/index';
import Api2 from '../Api/autenticar';
import Olvidoclave from '../Olvidoclave/index';
import NoEncontrado from '../NoEncontrado/index';
import { ProveedorVariables } from '../../Contexto/index';

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
        <Route path="/Estados" element={<Estados />} />
        <Route path="/SalaEspera" element={<SalaEspera />} />
        {/* <Route path="/DetalleEstados" element={<DetalleEstados />} /> */}
        <Route path="/Api2" element={<Api2 />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Router>
    }
  />
  );
}

export default App;
