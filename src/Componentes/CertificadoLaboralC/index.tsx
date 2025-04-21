import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fondoBase64 } from "./fondoBase64";
import { firmaBase64 } from "./firmaBase64";
import "./estilos.css";

const urlLogo = "https://storage.googleapis.com/integrapp/Imagenes/albatroz.png";
const API_URL = "https://integrappi-dvmh.onrender.com/empleados/buscar?identificacion=";

function convertirNumeroALetras(num: number): string {
  const unidades = ["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciseis","diecisiete","dieciocho","diecinueve"];
  const decenas = ["","", "veinte","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"];
  const centenas = ["","cien","doscientos","trescientos","cuatrocientos","quinientos","seiscientos","setecientos","ochocientos","novecientos"];

  if (num < 20) return unidades[num];
  if (num < 100) {
    const d = Math.floor(num / 10), u = num % 10;
    if (num < 30 && num >= 21) return `veinti${unidades[u]}`;
    return `${decenas[d]}${u ? ` y ${unidades[u]}` : ""}`;
  }
  if (num < 1000) {
    if (num === 100) return "cien";
    const c = Math.floor(num / 100), r = num % 100;
    return `${centenas[c]}${r ? ` ${convertirNumeroALetras(r)}` : ""}`;
  }
  if (num < 1_000_000) {
    const m = Math.floor(num / 1000), r = num % 1000;
    const textoMiles = m === 1 ? "mil" : `${convertirNumeroALetras(m)} mil`;
    return `${textoMiles}${r ? ` ${convertirNumeroALetras(r)}` : ""}`;
  }
  if (num < 1_000_000_000) {
    const mm = Math.floor(num / 1_000_000), r = num % 1_000_000;
    const textoMillones = mm === 1 ? "un millón" : `${convertirNumeroALetras(mm)} millones`;
    return `${textoMillones}${r ? ` ${convertirNumeroALetras(r)}` : ""}`;
  }
  return num.toString();
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function printParts(
  doc: jsPDF,
  parts: { texto: string; estilo: "normal" | "bold" }[],
  xInicial: number,
  yInicial: number,
  maxWidth: number,
  lineHeight: number
) {
  let x = xInicial, y = yInicial;
  for (const parte of parts) {
    doc.setFont("Times", parte.estilo);
    const words = parte.texto.split(" ");
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? " " : "");
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

  const generarPDF = async () => {
    try {
      const res = await fetch(API_URL + cedulaIngresada);
      if (!res.ok) throw new Error("Empleado no encontrado");
      const empleado = await res.json();

      const {
        nombre = "",
        identificacion = cedulaIngresada,
        cargo = "",
        salario = 0,
        fechaIngreso = "",
        tipoContrato = "",
      } = empleado;

      // Fecha emisión
      const hoy = new Date();
      const opcionesFecha = { day: "numeric", month: "long", year: "numeric" } as const;
      const fechaFormateada = hoy.toLocaleDateString("es-ES", opcionesFecha);

      // Fecha ingreso formateada
      const fechaIngDate = fechaIngreso ? new Date(fechaIngreso) : null;
      const fechaIngresoFormateada = fechaIngDate
        ? fechaIngDate.toLocaleDateString("es-ES", opcionesFecha)
        : "";

      // Cédula formateada
      const cedulaFormateada = identificacion.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      // Salario en letras y números
      const salarioEntero = Math.floor(salario);
      const letras = salarioEntero > 0
        ? capitalize(convertirNumeroALetras(salarioEntero)) + " pesos"
        : "";
      const salarioTexto = incluirSalario && salarioEntero
        ? ` Con un salario fijo mensual por valor de ${letras} ($${salarioEntero.toLocaleString()} m/cte.).`
        : "";

      const doc = new jsPDF();
      doc.addImage(fondoBase64, "PNG", 0, 0, 210, 297);
      const margenIzq = 20;
      let y = 40;
      const maxAncho = 170;

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
        { texto: ` labora en nuestra empresa desde el ${fechaIngresoFormateada}, desempeñando el cargo de `, estilo: "normal" },
        { texto: cargo, estilo: "bold" },
        { texto: " con contrato ", estilo: "normal" },
        { texto: tipoContrato, estilo: "bold" },
        { texto: ".", estilo: "normal" },
        { texto: salarioTexto, estilo: "normal" },
      ];

      doc.setFont("Times", "normal");
      doc.setFontSize(12);
      y = printParts(doc, partesTexto, margenIzq, y, maxAncho, 6);
      y += 10;

      const contacto = "Para mayor información de ser necesario, se pueden comunicar al PBX 7006232 o celular 3183385709.";
      const lineasContacto = doc.splitTextToSize(contacto, maxAncho);
      doc.text(lineasContacto, margenIzq, y);
      y += lineasContacto.length * 3;

      const infoFinal = `La presente certificación se expide a solicitud del interesado, dado a los ${fechaFormateada} en la ciudad de Bogotá.`;
      const lineasFinal = doc.splitTextToSize(infoFinal, maxAncho);
      y += 10;
      doc.text(lineasFinal, margenIzq, y);
      y += lineasFinal.length * 6;

      y += 15;
      doc.text("Cordialmente,", margenIzq, y);
      y += 20;

      doc.setFont("Times", "bold");
      doc.text("PATRICIA LEAL AROCA", 105, y, { align: "center" });
      const firmaW = 50, firmaH = 20;
      doc.addImage(firmaBase64, "PNG", 105 - firmaW / 2, y - 10, firmaW, firmaH);
      y += 6;

      doc.setFont("Times", "normal");
      doc.text("certificado laboral", 105, y, { align: "center" });
      y += 6;
      doc.text("Gerente de gestión humana", 105, y, { align: "center" });
      y += 6;
      doc.text("Integra cadena de servicios", 105, y, { align: "center" });

      doc.save(`certificado_${identificacion}.pdf`);
    } catch (error) {
      alert("No se encontró un empleado con esa cédula.");
      console.error("Error al generar el certificado:", error);
    }
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
        onChange={(e) => setCedulaIngresada(e.target.value.replace(/\D/g, ""))}
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
