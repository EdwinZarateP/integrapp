// src/Paginas/Pedidos.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import TablaPedidosCompletados from '../../Componentes/PedidosComponentes/TablaPedidosCompletados';
import './estilos.css';

const PedidosCompletados: React.FC = () => {
  const navigate = useNavigate();
  const [vista, setVista] = useState<'completados' | 'gestion'>('completados');

  const cerrarSesion = () => {
    document.cookie = 'usuarioPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'regionalPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'perfilPedidosCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    navigate('/LoginUsuario');
  };

  const handleVistaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'completados' | 'gestion';
    setVista(val);
    if (val === 'gestion') {
      navigate('/Pedidos');
    }
  };

  return (
    <div className="PedidosCompletados-contenedor">
      <div className="PedidosCompletados-header">
        <select
          className="PedidosCompletados-select"
          value={vista}
          onChange={handleVistaChange}
        >
          <option value="completados">Pedidos completados</option>
          <option value="gestion">Gestión de Pedidos</option>
        </select>
        <button
          className="PedidosCompletados-botonCerrar"
          onClick={cerrarSesion}
        >
          <FaSignOutAlt className="PedidosCompletados-iconoCerrar" />
        </button>
      </div>

      <div className="PedidosCompletados-cuerpo">
        <TablaPedidosCompletados />
      </div>
    </div>
  );
};

export default PedidosCompletados;