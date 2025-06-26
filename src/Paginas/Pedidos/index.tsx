// src/Paginas/Pedidos.tsx

import CargarPedidos from "../../Componentes/frontPedidos/CargarPedidos";
import TablaPedidos from "../../Componentes/frontPedidos/TablaPedidos";
// import FiltroPedidos si lo creas luego
// import ProcesarMasivo si lo creas luego

const Pedidos = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestión de Pedidos</h1>
      
      {/* Aquí puedes ir agregando por secciones */}
      <CargarPedidos />

      <hr style={{ margin: "2rem 0" }} />

      {/* Aquí luego puedes agregar filtros */}
      {/* <FiltroPedidos /> */}

      <TablaPedidos />
    </div>
  );
};

export default Pedidos;
