import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fondoBase64 } from "./fondoBase64";
import "./estilos.css";

const urlLogo = "https://storage.googleapis.com/integrapp/Imagenes/albatroz.png";

const baseDeDatos = [
  {
    cedula: "1002207691",
    nombre: "FULANITO PALACIOS",
    cargo: "AUXILIAR LOGISTICO",
    salario: 1465000,
    fechaIngreso: "03 de diciembre de 2024",
  },
];

const CertificadoLaboralC: React.FC = () => {
  const [cedulaIngresada, setCedulaIngresada] = useState("");
  const [incluirSalario, setIncluirSalario] = useState(true);

  const generarPDF = () => {
    const empleado = baseDeDatos.find((e) => e.cedula === cedulaIngresada);

    const {
      nombre = "",
      cedula = cedulaIngresada,
      cargo = "",
      salario = 0,
      fechaIngreso = "",
    } = empleado || {};

    const fechaEmision = new Date();
    const opcionesFecha = { day: "numeric", month: "long", year: "numeric" } as const;
    const fechaFormateada = fechaEmision.toLocaleDateString("es-ES", opcionesFecha);

    const doc = new jsPDF();
    doc.addImage(fondoBase64, "PNG", 0, 0, 210, 297);

    const margenIzquierdo = 20;
    let y = 60;

    // Título
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("EL DEPARTAMENTO DE GESTIÓN HUMANA", margenIzquierdo, y);

    y += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICA QUE:", margenIzquierdo, y);

    y += 12;

    const cedulaFormateada = cedula.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, "$1.");

    // Línea 1: El señor/a + nombre
    let x = margenIzquierdo;
    doc.setFont("helvetica", "normal");
    const frag1 = "El señor/a ";
    doc.text(frag1, x, y);
    x += doc.getTextWidth(frag1);

    doc.setFont("helvetica", "bold");
    doc.text(`${nombre},`, x, y);

    // Línea 2: cédula + continuación
    y += 10;
    x = margenIzquierdo;
    const frag2 = "identificado/a con cédula de ciudadanía número ";
    doc.setFont("helvetica", "normal");
    doc.text(frag2, x, y);
    x += doc.getTextWidth(frag2);

    doc.setFont("helvetica", "bold");
    doc.text(cedulaFormateada, x, y);

    // Continuación párrafo justificado
    y += 12;
    doc.setFont("helvetica", "normal");
    const frag3 = "labora en nuestra empresa";
    const frag4 = fechaIngreso ? ` desde el ${fechaIngreso}` : "";
    const frag5 = cargo ? `, desempeñando el cargo de ${cargo}` : "";
    const frag6 = " con contrato a término OBRA Y/O LABOR.";

    const salarioTexto = incluirSalario && salario
      ? ` Con un salario fijo mensual por valor de Un Millón Cuatrocientos Sesenta y Cinco Mil Pesos ($${salario.toLocaleString()} m/cte.).`
      : "";

    const cuerpoTexto = frag3 + frag4 + frag5 + frag6 + salarioTexto;

    doc.text(cuerpoTexto, margenIzquierdo, y, {
      maxWidth: 170,
      align: "justify",
    });

    // Párrafos adicionales
    y += 30;
    const infoContacto = `Para mayor información de ser necesario, se pueden comunicar al PBX 7006232 o celular 3183385709.`;
    doc.text(infoContacto, margenIzquierdo, y, {
      maxWidth: 170,
      align: "justify",
    });

    y += 20;
    const infoFinal = `La presente certificación se expide a solicitud del interesado, dado a los ${fechaFormateada} en la ciudad de Bogotá.`;
    doc.text(infoFinal, margenIzquierdo, y, {
      maxWidth: 170,
      align: "justify",
    });

    // Cierre
    y += 30;
    doc.text("Cordialmente,", margenIzquierdo, y);

    doc.save(`certificado_${cedula}.pdf`);
  };

  return (
    <div className="CertificadoLaboralC-contenedor">
      <div className="CertificadoLaboralC-encabezado">
        <img src={urlLogo} alt="Logo Integra" className="CertificadoLaboralC-logo" />
        <h2 className="CertificadoLaboralC-titulo">Certificado Laboral</h2>
      </div>

      <input
        type="text"
        placeholder="Ingrese número de cédula"
        className="CertificadoLaboralC-input"
        value={cedulaIngresada}
        onChange={(e) => setCedulaIngresada(e.target.value)}
      />
      <label className="CertificadoLaboralC-checkbox">
        <input
          type="checkbox"
          checked={incluirSalario}
          onChange={() => setIncluirSalario(!incluirSalario)}
        />
        Incluir salario
      </label>
      <button className="CertificadoLaboralC-boton" onClick={generarPDF}>
        Descargar Certificado
      </button>
    </div>
  );
};

export default CertificadoLaboralC;
