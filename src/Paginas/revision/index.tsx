// src/paginas/revision/RevisionVehiculos.tsx
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
  archivos?: {
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

const RevisionVehiculos: React.FC = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string>("");
  const [observaciones, setObservaciones] = useState<{ [id: string]: string }>({});

  //estado para controlar qué vehículo está expandido (pliega/despliega)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const idUsuario = Cookies.get("seguridadId");
    if (!idUsuario) {
      navigate("/LoginUsuariosSeguridad");
    } else {
      cargarVehiculos();
    }
  }, []);

  const cargarVehiculos = async () => {
    try {
      const res = await axios.get<{ message: string; vehicles: Vehiculo[] }>(
        `${API_BASE}/vehiculos/obtener-vehiculos-incompletos`
      );
      const list = res.data.vehicles || [];
      setVehiculos(list);
      if (list.length > 0) {
        setSelectedVehiculoId(list[0]._id);
      }
    } catch (error: any) {
      Swal.fire("Error", "No se pudieron cargar los vehículos", "error");
      setVehiculos([]);
    }
  };

 // const vehiculoSeleccionado = vehiculos.find(v => v._id === selectedVehiculoId) || null;
   const aprobarVehiculo = async (veh: Vehiculo) => {
    try {
    const seguridadId = Cookies.get("seguridadId") || "";
    const formData = new FormData();

    formData.append("placa", veh.placa);
    formData.append("nuevo_estado", "aprobado");
    formData.append("usuario_id", seguridadId);

    await axios.put(`${API_BASE}/vehiculos/actualizar-estado`, formData);
    Swal.fire("Éxito", "Vehículo aprobado correctamente", "success");
    await cargarVehiculos();
  } catch (error: any) {
    console.error("Error al aprobar vehículo:", error.response?.data || error);
    Swal.fire("Error", "No se pudo actualizar el estado", "error");
     }
  };

  const enviarObservaciones = async (veh: Vehiculo) => {
  const texto = observaciones[veh._id] || "";
  if (!texto.trim()) {
    Swal.fire("Escribe algo", "Debes escribir observaciones", "warning");
    return;
  }

  try {
    await axios.post(
      `${API_BASE}/revision/enviar-observaciones`,
      {
        vehiculo_id: veh._id,
        observaciones: texto,
      }
    );
    Swal.fire("Enviado", "Correo enviado correctamente", "success");
  } catch (error: any) {
    console.error("Error enviando observaciones:", error.response?.data || error);
    Swal.fire("Error", error.response?.data?.detail || "No se pudo enviar", "error");
  }
};


  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <BarraSuperiorSeguridad />

      <div className="contenedor-principal">
        <h2>Revisión de Vehículos</h2>

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
              <div className="vehiculo-header" onClick={() => toggleExpand(veh._id)} style={{ cursor: "pointer" }}>
                <h3>
                  {veh.placa} {veh.linea} {veh.modelo}
                </h3>
                <span>{isExpanded ? "▲" : "▼"}</span>
              </div>

{isExpanded && (
                <div className="vehiculo-body">
                  <p><strong>Estado:</strong> {veh.estadoIntegra}</p>
                  <p><strong>Email:</strong> {veh.tenedCorreo}</p>
                  <p><strong>Usuario ID:</strong> {veh.idUsuario}</p>

<div className="info-completa">
    {Object.entries(veh)
      .filter(
           ([key]) =>
                  ![
                    "archivos",
                    "_id",
                    "placa",
                    "estadoIntegra",
                    "idUsuario",
                    "usuarioIntegra",
                    "linea",
                    "modelo",
                    "tenedor",
                    "tenedCorreo",
                    ].includes(key)
                  )
.map(([key, value]) => {
                        const isUrl =
                          typeof value === "string" &&
                          (value.startsWith("http://") || value.startsWith("https://"));
                        return (
                          <div key={key}>
                            <strong>{key}:</strong>{" "}
                            {isUrl ? (
                              <a href={value} target="_blank" rel="noopener noreferrer">
                                {value}
                              </a>
                            ) : Array.isArray(value) ? (
                              value.join(", ")
                            ) : (
                              String(value)
                            )}
                          </div>
                        );
                      })}
                  </div>
<div className="acciones">
                    <button className="btn-aprobar" type="button" onClick={() => aprobarVehiculo(veh)}>
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
                    <button className="btn-enviar" type="button" onClick={() => enviarObservaciones(veh)}>
                      Enviar observaciones por correo
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevisionVehiculos;

