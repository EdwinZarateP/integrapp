// ModalEditarPedido.tsx
import "./ModalEditarPedido.css";

const ModalEditarPedido = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  if (!visible) return null;

  return (
    <div className="ModalEditarPedido-overlay">
      <div className="ModalEditarPedido-contenido">
        <h2 className="ModalEditarPedido-titulo">Editar Pedido</h2>
        <button onClick={onClose} className="ModalEditarPedido-cerrar">X</button>
        {/* Aquí va el formulario */}
      </div>
    </div>
  );
};

export default ModalEditarPedido;
