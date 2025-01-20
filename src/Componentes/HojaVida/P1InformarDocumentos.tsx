// Archivo: P1InformarDocumentos.tsx
import React from 'react';
import './P1InformarDocumentos.css';

const P1InformarDocumentos: React.FC = () => {
  return (
    <div className='P1InformarDocumentos-contenedor-principal'>
      <h1 className="P1InformarDocumentos-titulo">Documentos que debe tener antes de iniciar</h1>
      <div className="P1InformarDocumentos-contenedor">      

      <section className="P1InformarDocumentos-seccion">
        <h2 className="P1InformarDocumentos-subtitulo">1. Documentos para Vehículo</h2>
        <ul className="P1InformarDocumentos-lista">
          <li className="P1InformarDocumentos-item">Tarjeta de Propiedad</li>
          <li className="P1InformarDocumentos-item">SOAT</li>
          <li className="P1InformarDocumentos-item">Revisión Tecnomecánica</li>
          <li className="P1InformarDocumentos-item">Tarjeta de Remolque</li>
          <li className="P1InformarDocumentos-item">Fotos</li>
          <li className="P1InformarDocumentos-item">Póliza de Responsabilidad Civil</li>
          <li className="P1InformarDocumentos-item">Copia del Documento de Identidad</li>
        </ul>
      </section>

      <section className="P1InformarDocumentos-seccion">
        <h2 className="P1InformarDocumentos-subtitulo">2. Documentos para Conductor</h2>
        <ul className="P1InformarDocumentos-lista">
          <li className="P1InformarDocumentos-item">Licencia de Conducción Vigente</li>
          <li className="P1InformarDocumentos-item">Planilla de EPS</li>
          <li className="P1InformarDocumentos-item">Planilla de ARL</li>
        </ul>
      </section>

      <section className="P1InformarDocumentos-seccion">
        <h2 className="P1InformarDocumentos-subtitulo">3. Documentos para Tenedor</h2>
        <ul className="P1InformarDocumentos-lista">
          <li className="P1InformarDocumentos-item">Copia del Documento de Identidad</li>
          <li className="P1InformarDocumentos-item">Certificación Bancaria</li>
          <li className="P1InformarDocumentos-item">Documento que lo acredite como Tenedor</li>
          <li className="P1InformarDocumentos-item">RUT</li>
        </ul>
      </section>

      <section className="P1InformarDocumentos-seccion">
        <h2 className="P1InformarDocumentos-subtitulo">4. Documentos para Propietario</h2>
        <ul className="P1InformarDocumentos-lista">
          <li className="P1InformarDocumentos-item">Copia del Documento de Identidad</li>
          <li className="P1InformarDocumentos-item">RUT</li>
        </ul>
      </section>
      </div>
    </div>
  );
};

export default P1InformarDocumentos;
