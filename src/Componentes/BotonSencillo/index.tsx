import React from 'react';
import './estilos.css';

// Definir las propiedades (props) que el botón va a recibir
interface PropiedadesBotonSencillo {
  type: 'button' | 'submit' | 'reset'; // Propiedad para el tipo de botón
  onClick?: () => void; // Propiedad opcional para manejar el click del botón
  texto: string; // Propiedad para el texto del botón
  colorClass?: string; // Propiedad opcional para la clase del color del botón
}

const BotonSencillo: React.FC<PropiedadesBotonSencillo> = ({ type, onClick, texto, colorClass }) => {
  return (
    <button type={type} className={`boton-${colorClass}`} onClick={onClick}>{texto}</button>
  );
};

export default BotonSencillo;
