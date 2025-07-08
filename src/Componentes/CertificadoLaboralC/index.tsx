import React, { useState } from "react";
import Swal from "sweetalert2";
import "jspdf-autotable";
import "./estilos.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const BUSCAR_URL = `${API_BASE}/empleados/buscar?identificacion=`;
const ENVIAR_URL = `${API_BASE}/empleados/enviar`;

const CertificadoLaboralC: React.FC = () => {
  const [cedula, setCedula] = useState("");
  const [incluirSalario, setIncluirSalario] = useState(true);
  const [loading, setLoading] = useState(false);

  const enviarCertificado = async () => {
    if (!cedula) {
      return Swal.fire("Error", "Debes ingresar una cédula", "error");
    }

    setLoading(true);
    try {
      const r1 = await fetch(BUSCAR_URL + cedula);
      if (!r1.ok) throw new Error("Empleado no encontrado");
      const emp = await r1.json();

      if (!emp.correo) throw new Error("Empleado sin correo registrado");

      const query = new URLSearchParams({ identificacion: cedula }).toString();
      const r2 = await fetch(`${ENVIAR_URL}?${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incluirSalario })
      });
      if (!r2.ok) {
        const errText = await r2.text();
        throw new Error(errText || "Error al enviar certificado");
      }

      const correo = emp.correo as string;
      const mostrar = correo.replace(/^(.{3}).+@/, "$1***@");
      Swal.fire({
        icon: "success",
        title: "Enviado",
        text: `El certificado ha sido enviado a ${mostrar}`,
      });

      setCedula("");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CertificadoLaboralC-contenedor">
      <h2 className="CertificadoLaboralC-titulo">Enviar Certificado Laboral</h2>

      <input
        className="CertificadoLaboralC-input"
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={e => setCedula(e.target.value.replace(/\D/g, ""))}
        disabled={loading}
      />

      <label className="CertificadoLaboralC-checkbox">
        <input
          type="checkbox"
          checked={incluirSalario}
          onChange={() => setIncluirSalario(prev => !prev)}
          disabled={loading}
        />
        Incluir salario y auxilios
      </label>

      <button
        className="CertificadoLaboralC-boton"
        onClick={enviarCertificado}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar Certificado"}
      </button>
    </div>
  );
};

export default CertificadoLaboralC;
