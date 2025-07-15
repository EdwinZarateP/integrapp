// src/Paginas/Pedidos.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import CargarPedidos from '../../Componentes/PedidosComponentes/CargarPedidos';
import TablaPedidos from '../../Componentes/PedidosComponentes/TablaPedidos';
import ExportarAutorizados from '../../Componentes/PedidosComponentes/ExportarAutorizados';
import ImportarPedidosVulcano from '../../Componentes/PedidosComponentes/importarPedidosVulcano';
import './estilos.css';

const Pedidos: React.FC = () => {
  const navigate = useNavigate();
  const [vista, setVista] = useState<'gestion' | 'completados'>('gestion');

  const cerrarSesion = () => {
    document.cookie = 'usuarioPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'regionalPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'perfilPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    navigate('/LoginUsuario');
  };

  const handleVistaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'gestion' | 'completados';
    setVista(val);
    if (val === 'completados') {
      navigate('/pedidoscompletados');
    }
  };

  return (
    <div className="Pedidos-contenedor">
      <div className="Pedidos-header">
        <select
          className="Pedidos-select"
          value={vista}
          onChange={handleVistaChange}
        >
          <option value="gestion">Gestión de Pedidos</option>
          <option value="completados">Pedidos completados</option>
        </select>
        <button className="Pedidos-botonCerrar" onClick={cerrarSesion}>
          <FaSignOutAlt className="Pedidos-iconoCerrar" />
        </button>
      </div>

      <div className="Pedidos-cuerpo">
        <TablaPedidos />
        <div className="Pedidos-botones">
          <CargarPedidos />
          <ExportarAutorizados />
          <ImportarPedidosVulcano />
        </div>
      </div>
    </div>
  );
};

export default Pedidos;
