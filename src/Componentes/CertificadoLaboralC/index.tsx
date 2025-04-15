import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fondoBase64 } from "./fondoBase64";
import { firmaBase64 } from "./firmaBase64";
import "./estilos.css";

const urlLogo = "https://storage.googleapis.com/integrapp/Imagenes/albatroz.png";

const baseDeDatos = [
  {
    cedula: "12345",
    nombre: "Armando Bronca",
    cargo: "Auxiliar Logistico",
    salario: 1465000,
    fechaIngreso: "03 de diciembre de 2024",
    tipoContrato: "OBRA Y/O LABOR",
  },
];

function printParts(
  doc: jsPDF,
  parts: { texto: string; estilo: "normal" | "bold" }[],
  xInicial: number,
  yInicial: number,
  maxWidth: number,
  lineHeight: number
) {
  let x = xInicial;
  let y = yInicial;

  for (const parte of parts) {
    doc.setFont("Times", parte.estilo);
    const words = parte.texto.split(" ");

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      if (i < words.length - 1) {
        word += " ";
      }
      const wordWidth = doc.getTextWidth(word);

      if (x + wordWidth > xInicial + maxWidth) {
        y += lineHeight;
        x = xInicial;
      }

      doc.text(word, x, y);
      x += wordWidth;
    }
  }
  return y;
}

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
      tipoContrato = "",
    } = empleado || {};

    const fechaEmision = new Date();
    const opcionesFecha = { day: "numeric", month: "long", year: "numeric" } as const;
    const fechaFormateada = fechaEmision.toLocaleDateString("es-ES", opcionesFecha);

    const cedulaFormateada = cedula.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, "$1.");

    const doc = new jsPDF();
    doc.addImage(fondoBase64, "PNG", 0, 0, 210, 297);

    const margenIzquierdo = 20;
    let y = 40;
    const maxAnchoTexto = 170;

    doc.setFont("Times", "bold");
    doc.setFontSize(14);
    doc.text("EL DEPARTAMENTO DE GESTIÓN HUMANA", 105, y, { align: "center" });

    y += 15;
    doc.setFontSize(12);
    doc.text("CERTIFICA QUE:", 105, y, { align: "center" });

    y += 12;

    const partesTexto: { texto: string; estilo: "normal" | "bold" }[] = [
      { texto: "El señor/a ", estilo: "normal" },
      { texto: nombre, estilo: "bold" },
      { texto: ", identificado/a con cédula de ciudadanía número ", estilo: "normal" },
      { texto: cedulaFormateada, estilo: "bold" },
      { texto: " labora en nuestra empresa desde el " + fechaIngreso + ", desempeñando el cargo de ", estilo: "normal" },
      { texto: cargo, estilo: "bold" },
      { texto: " con contrato ", estilo: "normal" },
      { texto: tipoContrato, estilo: "bold" },
      { texto: ".", estilo: "normal" },
      {
        texto: incluirSalario && salario
          ? " Con un salario fijo mensual por valor de Un Millón Cuatrocientos Sesenta y Cinco Mil Pesos ($" +
            salario.toLocaleString() +
            " m/cte.)."
          : "",
        estilo: "normal",
      },
    ];

    doc.setFont("Times", "normal");
    doc.setFontSize(12);

    y = printParts(doc, partesTexto, margenIzquierdo, y, maxAnchoTexto, 6);

    y += 10;

    const infoContacto = `Para mayor información de ser necesario, se pueden comunicar al PBX 7006232 o celular 3183385709.`;
    const lineasContacto = doc.splitTextToSize(infoContacto, maxAnchoTexto);
    doc.text(lineasContacto, margenIzquierdo, y);
    y += lineasContacto.length * 3;

    const infoFinal = `La presente certificación se expide a solicitud del interesado, dado a los ${fechaFormateada} en la ciudad de Bogotá.`;
    const lineasFinal = doc.splitTextToSize(infoFinal, maxAnchoTexto);
    y += 10;
    doc.text(lineasFinal, margenIzquierdo, y);
    y += lineasFinal.length * 6;

    y += 15;
    doc.text("Cordialmente,", margenIzquierdo, y);

    // ↓↓↓ Aquí colocamos el nombre y encima la firma ↓↓↓
    y += 20;
    doc.setFont("Times", "bold");
    doc.text("PATRICIA LEAL AROCA", 105, y, { align: "center" });

    // Firma superpuesta (misma y, un poco más abajo para que cruce el nombre)
    const firmaWidth = 50;
    const firmaHeight = 20;
    const firmaY = y - 10; // para que se superponga al nombre
    doc.addImage(firmaBase64, "PNG", 105 - firmaWidth / 2, firmaY, firmaWidth, firmaHeight);

    // Info adicional
    y += 6;
    doc.setFont("Times", "normal");
    doc.text("certificado laboral", 105, y, { align: "center" });
    y += 6;
    doc.text("Gerente de gestión humana", 105, y, { align: "center" });
    y += 6;
    doc.text("Integra cadena de servicios", 105, y, { align: "center" });

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
        inputMode="numeric"
        placeholder="Ingrese número de cédula"
        className="CertificadoLaboralC-input"
        value={cedulaIngresada}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, "");
          setCedulaIngresada(soloNumeros);
        }}
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
