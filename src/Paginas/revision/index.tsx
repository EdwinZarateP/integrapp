

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import BarraSuperiorSeguridad from "../../Componentes/Barra";
import axios from "axios";
import Swal from "sweetalert2";
import "./estilos.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export interface Vehiculo {
  _id: string;
  placa: string;
  linea?: string;
  modelo?: string;
  estadoIntegra: string;
  idUsuario: string;
  tenedor?: string;
  tenedCorreo?: string;
  documentos?: Record<string, string>;
  [key: string]: any;
}

const RevisionVehiculos: React.FC = () => {
  const navigate = useNavigate();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculosAprobados, setVehiculosAprobados] = useState<Vehiculo[]>([]);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string>("");

  const [observaciones, setObservaciones] = useState<{ [id: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [vista, setVista] = useState<"revisar" | "aprobados">("revisar");

  // ======================================
  // CARGAR VEHÍCULOS
  // ======================================
  useEffect(() => {
    const idUsuario = Cookies.get("seguridadId");

    if (!idUsuario) {
      navigate("/LoginUsuariosSeguridad");
    } else {
      cargarVehiculos(idUsuario);
    }
  }, []);

  const cargarVehiculos = async (idUsuario: string) => {
    try {
      const res = await axios.get<{ message: string; vehicles: Vehiculo[] }>(
        `${API_BASE}/vehiculos/obtener-vehiculos-incompletos`,
        { params: { id_usuario: idUsuario } }
      );

      const list = res.data.vehicles || [];

      const aprobados = list.filter((v) => v.estadoIntegra === "aprobado");
      const pendientes = list.filter((v) => v.estadoIntegra !== "aprobado");

      setVehiculos(pendientes);
      setVehiculosAprobados(aprobados);

      if (pendientes.length > 0) {
        setSelectedVehiculoId(pendientes[0]._id);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
    }
  };

  // ======================================
  // APROBAR VEHÍCULO
  // ======================================
  const aprobarVehiculo = async (veh: Vehiculo) => {
    try {
      const seguridadId = Cookies.get("seguridadId") || "";
      const formData = new FormData();

      formData.append("placa", veh.placa);
      formData.append("nuevo_estado", "aprobado");
      formData.append("usuario_id", seguridadId);

      await axios.put(`${API_BASE}/vehiculos/actualizar-estado`, formData);

      Swal.fire("Éxito", "Vehículo aprobado correctamente", "success");

      const vehActualizado = { ...veh, estadoIntegra: "aprobado" };

      setVehiculosAprobados((prev) => [...prev, vehActualizado]);
      setVehiculos((prev) => prev.filter((v) => v._id !== veh._id));
    } catch {
      Swal.fire("Error", "No se pudo aprobar el vehículo", "error");
    }
  };

  // ======================================
  // ENVIAR OBSERVACIONES
  // ======================================
  const enviarObservaciones = async (veh: Vehiculo) => {
    const texto = observaciones[veh._id] || "";
    if (!texto.trim()) {
      Swal.fire("Escribe algo", "Debes escribir observaciones", "warning");
      return;
    }

    const tenedor = veh.tenedor || veh.idUsuario;

    try {
      await axios.post(
        `${API_BASE}/revision/enviar-observaciones?tenedor=${tenedor}`,
        { observaciones: texto }
      );

      Swal.fire("Enviado", "Correo enviado correctamente", "success");

      setObservaciones({ ...observaciones, [veh._id]: "" });
    } catch {
      Swal.fire("Error", "No se pudo enviar el correo", "error");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ======================================
  // RENDER
  // ======================================
  return (
    <div>
      <BarraSuperiorSeguridad />

      <div className="layout-revision">
        {/* Panel Izquierdo */}
        <div className="panel-lateral">
          <button
            className={`btn-menu ${vista === "revisar" ? "active" : ""}`}
            onClick={() => setVista("revisar")}
          >
            Vehículos por revisar
          </button>

          <button
            className={`btn-menu ${vista === "aprobados" ? "active" : ""}`}
            onClick={() => setVista("aprobados")}
          >
            Vehículos aprobados
          </button>
        </div>

        {/* Panel Derecho */}
        <div className="contenedor-principal">

          {/* =================== VISTA REVISAR =================== */}
          {vista === "revisar" && (
            <>
              <h2>Vehículos por revisar</h2>

              <div className="dropdown-contenedor">
                <label htmlFor="vehiculoSelect">Selecciona un vehículo:</label>

                <select
                  id="vehiculoSelect"
                  className="select-vehiculo"
                  value={selectedVehiculoId}
                  onChange={(e) => setSelectedVehiculoId(e.target.value)}
                >
                  {vehiculos.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.placa} {v.linea} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {vehiculos.map((veh) => {
                const isExpanded = expandedId === veh._id;

                return (
                  <div key={veh._id} className="vehiculo-card">
                    <div className="vehiculo-header" onClick={() => toggleExpand(veh._id)}>
                      <h3>{veh.placa} {veh.linea} {veh.modelo}</h3>
                      <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {isExpanded && (
                      <div className="vehiculo-body">

                        {/* === INFORMACIÓN BÁSICA === */}
                        <h4>📌 Información básica</h4>
                        <p><strong>ID Usuario:</strong> {veh.idUsuario}</p>
                        <p><strong>Placa:</strong> {veh.placa}</p>
                        <p><strong>Estado:</strong> {veh.estadoIntegra}</p>
                        <p><strong>Email Tenedor:</strong> {veh.tenedCorreo}</p>

                        {/* === DOCUMENTOS === */}
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2">Documentos</h3>

                          {veh.documentos && Object.keys(veh.documentos).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(veh.documentos).map(([nombre, url]) => (
                                <div
                                  key={nombre}
                                  className="border rounded-lg p-3 shadow-sm bg-white flex justify-between items-center"
                                >
                                  <p className="font-medium capitalize">
                                    {nombre.replace(/([A-Z])/g, " $1")}
                                  </p>

                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                  >
                                    Abrir
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No hay documentos disponibles.</p>
                          )}
                        </div>

                        {/* === DATOS DEL VEHÍCULO === */}
                        <h4>🚗 Datos del Vehículo</h4>
                        <p><strong>Marca:</strong> {veh.vehMarca}</p>
                        <p><strong>Línea:</strong> {veh.vehLinea}</p>
                        <p><strong>Modelo:</strong> {veh.vehModelo}</p>
                        <p><strong>Año:</strong> {veh.vehAno}</p>
                        <p><strong>Color:</strong> {veh.vehColor}</p>

                        {/* === CONDUCTOR === */}
                        <h4>🧑‍✈️ Conductor</h4>
                        <p><strong>Nombres:</strong> {veh.condNombres}</p>
                        <p>
                          <strong>Apellidos:</strong> {veh.condPrimerApellido} {veh.condSegundoApellido}
                        </p>
                        <p><strong>Cédula:</strong> {veh.condCedulaCiudadania}</p>
                        <p><strong>Celular:</strong> {veh.condCelular}</p>
                        <p><strong>Ciudad:</strong> {veh.condCiudad}</p>

                        {/* === PROPIETARIO === */}
                        <h4>👤 Propietario</h4>
                        <p><strong>Nombre:</strong> {veh.propNombre}</p>
                        <p><strong>Documento:</strong> {veh.propDocumento}</p>
                        <p><strong>Correo:</strong> {veh.propCorreo}</p>

                        {/* === TENEDOR === */}
                        <h4>🧾 Tenedor</h4>
                        <p><strong>Nombre:</strong> {veh.tenedNombre}</p>
                        <p><strong>Documento:</strong> {veh.tenedDocumento}</p>
                        <p><strong>Email Tenedor:</strong> {veh.tenedCorreo}</p>

                        {/* === ACCIONES === */}
                        <div className="acciones">
                          <button className="btn-aprobar" onClick={() => aprobarVehiculo(veh)}>
                            Aprobar vehículo
                          </button>

                          <textarea
                            className="textarea-observaciones"
                            placeholder="Escribe observaciones..."
                            value={observaciones[veh._id] || ""}
                            onChange={(e) =>
                              setObservaciones({ ...observaciones, [veh._id]: e.target.value })
                            }
                          />

                          <button
                            className="btn-enviar"
                            onClick={() => enviarObservaciones(veh)}
                          >
                            Enviar observaciones
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* =================== VISTA APROBADOS =================== */}
          {vista === "aprobados" && (
            <>
              <h2>Vehículos aprobados</h2>

              {vehiculosAprobados.length === 0 && (
                <p>No hay vehículos aprobados aún.</p>
              )}

              {vehiculosAprobados.map((veh) => (
                <div key={veh._id} className="vehiculo-card aprobado">
                  <div className="vehiculo-header">
                    <h3>{veh.placa} {veh.linea} {veh.modelo}</h3>
                  </div>
                  <div className="vehiculo-body">
                    <p><strong>Estado:</strong> {veh.estadoIntegra}</p>
                    <p><strong>ID Usuario:</strong> {veh.idUsuario}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevisionVehiculos;
