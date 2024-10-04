import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from '../Inicio/index';
import Registro from '../Registro/index';
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
        <Route path="/" element={<Registro />} />        
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Router>
    }
  />
  );
}

export default App;
