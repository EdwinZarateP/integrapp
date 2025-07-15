// src/Paginas/Pedidos.tsx

import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import CargarPedidos from '../../Componentes/PedidosComponentes/CargarPedidos';
import TablaPedidos from '../../Componentes/PedidosComponentes/TablaPedidos';
import ExportarAutorizados from '../../Componentes/PedidosComponentes/ExportarAutorizados';
import ImportarPedidosVulcano from '../../Componentes/PedidosComponentes/importarPedidosVulcano';
import './estilos.css';

const Pedidos = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    // Eliminar cookies
    document.cookie = 'usuarioPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'regionalPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'perfilPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    // Redirigir a login
    navigate('/LoginUsuario');
  };

  return (
    <div className="Pedidos-contenedor">
      <div className="Pedidos-header">
        <h1 className="Pedidos-titulo">Gestión de Pedidos</h1>
        <button className="Pedidos-botonCerrar" onClick={cerrarSesion}>
          <FaSignOutAlt className="Pedidos-iconoCerrar" />
        </button>
      </div>

      <div className="Pedidos-cuerpo">
        <TablaPedidos/>

        <div className="Pedidos-botones">
          <CargarPedidos />
          <ExportarAutorizados/>
          <ImportarPedidosVulcano/>

        </div>
      </div>

    </div>
  );
};

export default Pedidos;
