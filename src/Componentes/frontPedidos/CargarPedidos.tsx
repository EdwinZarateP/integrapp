import React, { useState } from "react";
import { cargarPedidosMasivo } from "../../Funciones/ApiPedidos/pedidos";
import "./CargarPedidos.css";

type RespuestaCarga = {
  mensaje: string;
};

const CargarPedidos = () => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [creadoPor, setCreadoPor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setArchivo(file || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo || !creadoPor) {
      setMensaje("Debes seleccionar un archivo y escribir quién lo carga.");
      return;
    }

    try {
      setCargando(true);
      const resultado: RespuestaCarga = await cargarPedidosMasivo(archivo, creadoPor);
      setMensaje(resultado.mensaje || "Carga exitosa.");
    } catch (error: any) {
      setMensaje(error?.detail || "Error al cargar pedidos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="CargarPedidos-formulario" onSubmit={handleSubmit}>
      <h2 className="CargarPedidos-titulo">Cargar pedidos desde Excel</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleArchivoChange}
        className="CargarPedidos-input"
      />

      <input
        type="text"
        placeholder="Nombre de quien carga"
        value={creadoPor}
        onChange={(e) => setCreadoPor(e.target.value)}
        className="CargarPedidos-input"
      />

      <button type="submit" className="CargarPedidos-boton" disabled={cargando}>
        {cargando ? "Cargando..." : "Subir archivo"}
      </button>

      {mensaje && <p className="CargarPedidos-mensaje">{mensaje}</p>}
    </form>
  );
};

export default CargarPedidos;
