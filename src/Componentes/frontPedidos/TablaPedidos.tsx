import { useEffect, useState } from "react";
import { listarPedidos } from "../../Funciones/ApiPedidos/pedidos";
import "./TablaPedidos.css";

interface Pedido {
  id: string;
  cliente: string;
  estado: string;
  // Agrega aquí más campos según tu modelo real
}

const TablaPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const data = await listarPedidos("ezarate");
        setPedidos(data.pedidos);
      } catch (err: any) {
        console.error("Error real:", err);
        setError("Error al cargar los pedidos");
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, []);


  if (cargando) return <p className="TablaPedidos-mensaje">Cargando pedidos...</p>;
  if (error) return <p className="TablaPedidos-error">{error}</p>;

  return (
    <table className="TablaPedidos-tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.length === 0 ? (
          <tr>
            <td colSpan={4} className="TablaPedidos-sinDatos">No hay pedidos para mostrar</td>
          </tr>
        ) : (
          pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.id}</td>
              <td>{pedido.cliente}</td>
              <td>{pedido.estado}</td>
              <td>🔧</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default TablaPedidos;
