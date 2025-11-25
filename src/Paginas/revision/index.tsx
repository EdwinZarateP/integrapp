"use client";

import { useState } from "react";
import "./estilos.css";
import Swal from "sweetalert2"; 
import "sweetalert2";

interface Vehiculo {
  placa?: string;
  estadoIntegra?: string;
  idUsuario?: string;
  [key: string]: any;
}

export default function RevisionVehiculos() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Estado para las observaciones de cada placa
  const [observacionesPorPlaca, setObservacionesPorPlaca] = useState<{ [placa: string]: string }>({});

  const fetchVehiculos = async () => {
    if (!cedula.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Por favor ingresa una cédula o ID válido.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/vehiculos/obtener-vehiculos?id_usuario=${encodeURIComponent(
          cedula.trim()
        )}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || data.detail || "Error al obtener vehículos");

      setVehiculos(Array.isArray(data.vehicles) ? data.vehicles : []);
      setStep(2);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error inesperado",
      });
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleObservacionChange = (placa: string, valor: string) => {
    setObservacionesPorPlaca((prev) => ({ ...prev, [placa]: valor }));
  };

  const enviarObservacionPlaca = async (placa: string) => {
    const observacion = observacionesPorPlaca[placa]?.trim();
    if (!observacion) {
      Swal.fire({
        icon: "warning",
        title: "Observación vacía",
        text: "Escribe las observaciones antes de enviar.",
      });
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/revision/enviar-observaciones?tenedor=${encodeURIComponent(
          cedula.trim()
        )}&placa=${encodeURIComponent(placa)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ observaciones: observacion }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || data.message || "Error al enviar observaciones");

      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: `Observaciones para la placa ${placa} enviadas correctamente.`,
        confirmButtonText: "Aceptar",
      });

      setObservacionesPorPlaca((prev) => ({ ...prev, [placa]: "" }));
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar",
        text: err.message || "Error enviando observaciones",
      });
    }
  };

  const volverLogin = () => {
    setStep(1);
    setVehiculos([]);
    setCedula("");
    setObservacionesPorPlaca({});
    setError(null);
  };

  const renderValor = (valor: any) => {
    if (Array.isArray(valor)) {
      return valor.length === 0 ? (
        <em>Sin items</em>
      ) : (
        <ul className="lista-links">
          {valor.map((sub, i) => (
            <li key={i}>
              {typeof sub === "string" && sub.startsWith("http") ? (
                <a href={sub} target="_blank" rel="noreferrer" className="link-documento">
                  Ver documento {i + 1}
                </a>
              ) : (
                <span>{String(sub)}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof valor === "object" && valor !== null) {
      return (
        <ul className="lista-links">
          {Object.entries(valor).map(([subKey, subValue]) => (
            <li key={subKey}>
              <strong>{subKey}:</strong>{" "}
              {typeof subValue === "string" && subValue.startsWith("http") ? (
                <a href={subValue} target="_blank" rel="noreferrer" className="link-documento">
                  Ver documento
                </a>
              ) : (
                <span>{String(subValue)}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof valor === "string" && valor.startsWith("http")) {
      return (
        <a href={valor} target="_blank" rel="noreferrer" className="link-documento">
          Ver documento
        </a>
      );
    }

    return <span>{String(valor ?? "")}</span>;
  };

  return (
    <div className="revision-container">
      {step === 1 && (
        <div className="login-card">
          <h1 className="titulo-login">Bienvenido</h1>
          <p className="subtitulo-login">Por favor ingresa el número de cédula o ID de usuario</p>

          <input
            type="text"
            className="login-input"
            placeholder="Cédula o ID"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchVehiculos();
            }}
          />

          <div className="login-actions">
            <button className="btn-principal" onClick={fetchVehiculos} disabled={loading}>
              {loading ? "Cargando..." : "Consultar Vehículos"}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="vehiculos-list">
          <div className="lista-header">
            <h2 className="titulo-lista">Vehículos Registrados</h2>
            <div className="lista-acciones">
              <button className="btn-secundario" onClick={volverLogin}>
                Volver
              </button>
            </div>
          </div>

          {vehiculos.length === 0 && <p className="sin-result">No se encontraron vehículos.</p>}

          {vehiculos.map((v, index) => (
            <details key={v.placa ?? index} className="vehiculo-item">
              <summary className="placa-titulo">{v.placa ?? `Vehículo ${index + 1}`}</summary>

              <div className="vehiculo-detalle">
                {Object.entries(v).map(([key, value]) => (
                  <div key={key} className="detalle-fila">
                    <strong className="detalle-key">{key}:</strong>
                    <div className="detalle-value">{renderValor(value)}</div>
                  </div>
                ))}

                {/* Observaciones específicas de cada placa */}
                <div className="observaciones-box">
                  <textarea
                    className="observaciones-input"
                    placeholder="Escribe aquí las observaciones..."
                    value={observacionesPorPlaca[v.placa ?? `vehiculo-${index}`] || ""}
                    onChange={(e) =>
                      handleObservacionChange(v.placa ?? `vehiculo-${index}`, e.target.value)
                    }
                  />
                  <button
                    className="btn-enviar"
                    onClick={() => enviarObservacionPlaca(v.placa ?? `vehiculo-${index}`)}
                  >
                    Enviar Observaciones
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
