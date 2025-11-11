import './estilos.css';

const DescargableBotRecolecciones = () => {
  return (
    <section className="DescargableBotRecolecciones">
      <div className="DescargableBotRecolecciones-card">
        <img
          src={`${import.meta.env.BASE_URL}albatroz.png`}
          alt="Logo Albatroz"
          className="DescargableBotRecolecciones-logo"
        />

        <h1 className="DescargableBotRecolecciones-title">
          Recolecciones Auto
        </h1>

        <p className="DescargableBotRecolecciones-text">
          Descarga el asistente de recolecciones para automatizar la creación
          de recogidas en Integra y reducir errores manuales.
        </p>

        <a
          href={`${import.meta.env.BASE_URL}bot_recolecciones.exe`}
          className="DescargableBotRecolecciones-button"
          download
        >
          Descargar programa
        </a>

        <p className="DescargableBotRecolecciones-note">
          Compatible con Windows (.exe). Si tu navegador muestra una advertencia,
          confirma la descarga para continuar.
        </p>
      </div>
    </section>
  );
};

export default DescargableBotRecolecciones;
