import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InicioPropietarios from '../InicioPropietarios/index';
import Inicio from '../Inicio/index';
import Registro from '../Registro/index';
import EstadosManifiestos from '../SeleccionEstados/index';
import Estados from '../EstadosManifiestos/index';
import SalaEspera from '../SalaEspera/index';
import Novedad from '../Novedad/index';
import FormularioHojavida from '../FormularioHojavida/index';
import Api2 from '../Api/autenticar';
import Olvidoclave from '../Olvidoclave/index';
import PaginaIntegra from '../PaginaIntegra/index';
import PortalClientes from '../PortalClientes/index';
import PortalVentas from '../PortalVentas/index';
import CertificadoLaboralP from '../CertificadoLaboralP/index';
import NoEncontrado from '../NoEncontrado/index';
import { ProveedorVariables } from '../../Contexto/index';
import Pedidos from '../Pedidos/index';
import PedidosCompletados from '../PedidosCompletados/index';
import LoginUsuario from '../LoginUsuarios/index'
import Indicadores from '../Indicadores/index'
import "./estilos.css";

const App: React.FC = () => {
  return (
    // Encerramos todo en el ProveedorVariables para que puedan acceder a ellas
    <ProveedorVariables 
      hijo={
    <Router basename="/integrapp">
      <Routes>
        <Route path="/" element={<PaginaIntegra />} />
        <Route path="/InicioPropietarios" element={<Inicio />} />  
        <Route path="/loginpropietarios" element={<InicioPropietarios />} />               
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Olvidoclave" element={<Olvidoclave />} />
        <Route path="/SeleccionEstados" element={<EstadosManifiestos />} />
        <Route path="/Estados" element={<Estados />} />
        <Route path="/Novedad" element={<Novedad />} />
        <Route path="/SalaEspera" element={<SalaEspera />} />
        <Route path="/FormularioHojavida" element={<FormularioHojavida />} />        
        <Route path="/Api2" element={<Api2 />} />
        <Route path="/PortalClientes" element={<PortalClientes />} />
        <Route path="/PortalVentas" element={<PortalVentas />} />
        <Route path="/CertificadoLaboralP" element={<CertificadoLaboralP />} />
        <Route path="/Pedidos" element={<Pedidos />} />
        <Route path="/PedidosCompletados" element={<PedidosCompletados />} />
        <Route path="/LoginUsuario" element={<LoginUsuario/>} />
        <Route path="/indicadores" element={<Indicadores/>} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Router>
    }
  />
  );
}

export default App;
