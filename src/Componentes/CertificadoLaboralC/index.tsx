import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fondoBase64 } from "./fondoBase64";
import "./estilos.css";

const urlLogo = "https://storage.googleapis.com/integrapp/Imagenes/albatroz.png";

const baseDeDatos = [
  {
    cedula: "12345",
    nombre: "Armando Bronca",
    cargo: "Auxiliar Logistico",
    salario: 1465000,
    fechaIngreso: "03 de diciembre de 2024",
    tipoContrato: "OBRA Y/O LABOR", // propiedad agregada
  },
];

/**
 * Función auxiliar para imprimir “partes” de texto con estilos distintos
 * y evitar que se salgan del ancho máximo. Si se acerca demasiado, salta a la siguiente línea.
 */
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
    // Separar por palabras para controlar mejor el ancho
    const words = parte.texto.split(" ");

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      // Agregamos un espacio al final de cada palabra, excepto la última
      if (i < words.length - 1) {
        word += " ";
      }

      const wordWidth = doc.getTextWidth(word);

      // Si al agregar esta palabra nos pasamos del ancho disponible, bajamos de línea
      if (x + wordWidth > xInicial + maxWidth) {
        y += lineHeight;
        x = xInicial;
      }

      doc.text(word, x, y);
      x += wordWidth;
    }
  }

  // Devuelve la coordenada Y donde terminó de escribir
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

    // Formatear fecha actual
    const fechaEmision = new Date();
    const opcionesFecha = { day: "numeric", month: "long", year: "numeric" } as const;
    const fechaFormateada = fechaEmision.toLocaleDateString("es-ES", opcionesFecha);

    // Formatear cédula con puntos
    const cedulaFormateada = cedula.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, "$1.");

    const doc = new jsPDF();
    doc.addImage(fondoBase64, "PNG", 0, 0, 210, 297);

    const margenIzquierdo = 20;
    let y = 40;
    const maxAnchoTexto = 170; // ancho máximo para no desbordar

    // Título centrado y en negrita
    doc.setFont("Times", "bold");
    doc.setFontSize(14);
    doc.text("EL DEPARTAMENTO DE GESTIÓN HUMANA", 105, y, { align: "center" });

    y += 15;
    doc.setFontSize(12);
    doc.text("CERTIFICA QUE:", 105, y, { align: "center" });

    y += 12;

    // Arreglo de partes con estilos intercalados; el cargo y el tipo de contrato se muestran en negrita.
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

    // Ajustamos fuente y tamaño para este bloque
    doc.setFont("Times", "normal");
    doc.setFontSize(12);

    // Imprimir las partes controlando el ancho
    // lineHeight: puntos a bajar al hacer salto de línea
    y = printParts(doc, partesTexto, margenIzquierdo, y, maxAnchoTexto, 6);

    // Dejamos un espacio debajo del párrafo
    y += 10;

    // Párrafo adicional: info de contacto
    const infoContacto = `Para mayor información de ser necesario, se pueden comunicar al PBX 7006232 o celular 3183385709.`;
    const lineasContacto = doc.splitTextToSize(infoContacto, maxAnchoTexto);
    doc.text(lineasContacto, margenIzquierdo, y);
    y += lineasContacto.length * 3;

    // Párrafo final
    const infoFinal = `La presente certificación se expide a solicitud del interesado, dado a los ${fechaFormateada} en la ciudad de Bogotá.`;
    const lineasFinal = doc.splitTextToSize(infoFinal, maxAnchoTexto);
    y += 10;
    doc.text(lineasFinal, margenIzquierdo, y);
    y += lineasFinal.length * 6;

    // Cierre
    y += 15;
    doc.text("Cordialmente,", margenIzquierdo, y);

    // Descargar PDF
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
