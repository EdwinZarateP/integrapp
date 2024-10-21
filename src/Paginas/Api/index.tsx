
import extraccionManifiestos from '../../Funciones/ExtraerInfoApi/index';
import './estilos.css';

const Api2 = () => {
  const { manifiestosTodos, loading, error } = extraccionManifiestos();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="contenedorManifiestos">
      <h1 className="api-title">Estado de los Manifiestos</h1>
      {manifiestosTodos.map((item, index) => (
        <div key={index} className="tarjeta-detalle">
          <h2>Manifiesto {item.Manif_numero}</h2>
          <p><strong>Placa:</strong> {item.Placa}</p>
          <p><strong>Estado_mft:</strong> {item.Estado_mft}</p>
          <p><strong>Fecha:</strong> {item.Fecha}</p>
          <p><strong>Origen:</strong> {item.Origen}</p>
          <p><strong>Destino:</strong> {item.Destino}</p>
          <p><strong>MontoTotal:</strong> {item.MontoTotal}</p>
          <p><strong>ReteFuente:</strong> {item.ReteFuente}</p>
          <p><strong>ReteICA:</strong> {item.ReteICA}</p>
          <p><strong>ValorAnticipado:</strong> {item.ValorAnticipado}</p>
        </div>
      ))}
    </div>
  );
};

export default Api2;
